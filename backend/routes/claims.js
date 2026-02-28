const express = require('express');
const crypto  = require('crypto');
const Claim   = require('../models/Claim');
const { authMiddleware, roleMiddleware }        = require('../middlewares/authMiddleware');
const { submitClaimOnChain, approveClaimOnChain, rejectClaimOnChain } = require('../services/blockchainService');
const { analyzeClaim, generateExplanation }    = require('../services/aiService');

const router = express.Router();

// POST /api/claims/submit
router.post('/submit', authMiddleware, roleMiddleware('patient'), async (req, res, next) => {
  try {
    const { hospitalId, ipfsCid, amount, diagnosis, procedureCode, admissionDate, dischargeDate } = req.body;

    const claim = new Claim({
      patientId: req.user._id, hospitalId, ipfsCid, amount,
      diagnosis, procedureCode, admissionDate, dischargeDate,
    });
    await claim.save();

    try {
      const { txHash } = await submitClaimOnChain(
        req.user.walletAddress,
        claim._id.toString(),
        BigInt(Math.round(amount * 100)),
        ipfsCid
      );
      claim.blockchainTxHash = txHash;
    } catch (e) { console.error('Blockchain error:', e.message); }

    try {
      const r = await analyzeClaim({
        claimId: claim._id.toString(), amount,
        diagnosis, procedureCode, admissionDate, dischargeDate,
      });
      claim.fraudScore    = r.fraudScore;
      claim.fraudConcerns = r.concerns;
    } catch (e) { console.error('AI error:', e.message); }

    await claim.save();
    res.status(201).json({ success: true, claim });
  } catch (err) { next(err); }
});

// GET /api/claims
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === 'patient')  query.patientId  = req.user._id;
    if (req.user.role === 'hospital') query.hospitalId = req.user.hospitalId;

    const claims = await Claim.find(query)
      .populate('patientId',  'name walletAddress insurancePolicyId')
      .populate('hospitalId', 'name location')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ success: true, claims });
  } catch (err) { next(err); }
});

// GET /api/claims/:id
router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const claim = await Claim.findById(req.params.id)
      .populate('patientId',  'name walletAddress insurancePolicyId')
      .populate('hospitalId', 'name location');

    if (!claim)
      return res.status(404).json({ success: false, message: 'Claim not found' });

    res.json({ success: true, claim });
  } catch (err) { next(err); }
});

// POST /api/claims/:id/resolve
router.post('/:id/resolve', authMiddleware, roleMiddleware('insurer'), async (req, res, next) => {
  try {
    const { decision, rejectionReason } = req.body;
    const claim = await Claim.findById(req.params.id);
    if (!claim)
      return res.status(404).json({ success: false, message: 'Claim not found' });

    claim.status     = decision;
    claim.resolvedAt = new Date();
    claim.resolvedBy = req.user._id;

    if (decision === 'rejected' && rejectionReason) {
      claim.rejectionReason     = rejectionReason;
      claim.rejectionReasonHash = crypto
        .createHash('sha256').update(rejectionReason).digest('hex');
      try { claim.aiExplanation = await generateExplanation(rejectionReason); } catch {}
      try { await rejectClaimOnChain(claim._id.toString(), claim.rejectionReasonHash); } catch {}
    }

    if (decision === 'approved') {
      try { await approveClaimOnChain(claim._id.toString()); } catch {}
    }

    await claim.save();
    res.json({ success: true, claim });
  } catch (err) { next(err); }
});

module.exports = router;