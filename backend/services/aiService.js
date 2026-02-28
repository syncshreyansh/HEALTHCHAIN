const axios = require('axios');

async function callLLM(systemPrompt, userMessage, retries = 3) {
  const provider = process.env.AI_PROVIDER || 'anthropic';

  for (let i = 1; i <= retries; i++) {
    try {
      if (provider === 'anthropic') {
        const res = await axios.post(
          'https://api.anthropic.com/v1/messages',
          {
            model:      'claude-haiku-4-5-20251001',
            max_tokens: 1024,
            system:     systemPrompt,
            messages:   [{ role: 'user', content: userMessage }],
          },
          {
            headers: {
              'x-api-key':         process.env.ANTHROPIC_API_KEY,
              'anthropic-version': '2023-06-01',
              'Content-Type':      'application/json',
            },
          }
        );
        return res.data.content[0].text;
      } else {
        const res = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model:      'gpt-3.5-turbo',
            max_tokens: 1024,
            messages:   [
              { role: 'system', content: systemPrompt },
              { role: 'user',   content: userMessage },
            ],
          },
          { headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` } }
        );
        return res.data.choices[0].message.content;
      }
    } catch (err) {
      if (i === retries) throw err;
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)));
    }
  }
}

async function analyzeClaim(claimData) {
  const sys = `You are a healthcare insurance fraud detection AI.
Analyse the claim and respond ONLY with valid JSON (no markdown fences):
{"fraudScore":<number 0-100>,"concerns":["string"],"summary":"string"}`;

  const raw   = await callLLM(sys, `Analyse this claim:\n${JSON.stringify(claimData)}`);
  const clean = raw.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
}

async function generateExplanation(technicalReason) {
  const sys = `You are a patient advocate. Rewrite insurance rejection reasons
in simple, empathetic language a non-medical person can understand.
Keep it to 2-3 sentences. No medical jargon.`;
  return callLLM(sys, `Rejection reason: ${technicalReason}`);
}

async function structurePrescription(doctorNotes) {
  const sys = `You are a medical record structuring assistant.
Convert the doctor's notes into structured JSON ONLY (no markdown fences):
{
  "diagnosis": "",
  "icd10Code": "",
  "medications": [{"name":"","dosage":"","frequency":"","duration":""}],
  "procedures":  [{"name":"","code":""}],
  "notes": ""
}`;
  const raw   = await callLLM(sys, `Doctor notes: ${doctorNotes}`);
  const clean = raw.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
}

module.exports = { analyzeClaim, generateExplanation, structurePrescription };