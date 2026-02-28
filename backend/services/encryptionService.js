const crypto = require('crypto');

const ALGO = 'aes-256-cbc';

function deriveKey(patientAddress) {
  return crypto
    .createHash('sha256')
    .update(`${process.env.ENCRYPTION_MASTER_KEY}:${patientAddress.toLowerCase()}`)
    .digest();
}

function encrypt(data, patientAddress) {
  const key       = deriveKey(patientAddress);
  const iv        = crypto.randomBytes(16);
  const cipher    = crypto.createCipheriv(ALGO, key, iv);
  const text      = typeof data === 'string' ? data : JSON.stringify(data);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  return {
    iv:         iv.toString('hex'),
    ciphertext: encrypted.toString('hex'),
  };
}

function decrypt(encData, patientAddress) {
  const key       = deriveKey(patientAddress);
  const iv        = Buffer.from(encData.iv, 'hex');
  const decipher  = crypto.createDecipheriv(ALGO, key, iv);
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encData.ciphertext, 'hex')),
    decipher.final(),
  ]);
  const text = decrypted.toString('utf8');
  try { return JSON.parse(text); } catch { return text; }
}

module.exports = { encrypt, decrypt };