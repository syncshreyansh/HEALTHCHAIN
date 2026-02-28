const express = require('express');
const { authMiddleware, roleMiddleware }        = require('../middlewares/authMiddleware');
const { structurePrescription, generateExplanation } = require('../services/aiService');

const router = express.Router();

// POST /api/ai/prescription-assist
router.post('/prescription-assist', authMiddleware, roleMiddleware('doctor'), async (req, res, next) => {
  try {
    const { notes } = req.body;
    if (!notes)
      return res.status(400).json({ success: false, message: 'notes required' });

    const structured = await structurePrescription(notes);
    res.json({ success: true, structured });
  } catch (err) { next(err); }
});

// POST /api/ai/explain
router.post('/explain', authMiddleware, async (req, res, next) => {
  try {
    const { technicalReason } = req.body;
    if (!technicalReason)
      return res.status(400).json({ success: false, message: 'technicalReason required' });

    const explanation = await generateExplanation(technicalReason);
    res.json({ success: true, explanation });
  } catch (err) { next(err); }
});

module.exports = router;