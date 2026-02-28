const express = require('express');
const { authMiddleware, roleMiddleware } = require('../middlewares/authMiddleware');
const { uploadJSON, fetchFromIPFS }      = require('../services/ipfsService');
const { addRecordOnChain, getRecordsFromChain } = require('../services/blockchainService');
const { encrypt, decrypt }               = require('../services/encryptionService');

const router = express.Router();

// POST /api/records/upload
router.post('/upload', authMiddleware, roleMiddleware('doctor'), async (req, res, next) => {
  try {
    const { patientWalletAddress, recordData } = req.body;

    const encrypted = encrypt(recordData, patientWalletAddress);
    const cid = await uploadJSON(
      { encrypted, uploadedBy: req.user.walletAddress, uploadedAt: new Date().toISOString() },
      `record-${patientWalletAddress.slice(0, 8)}`
    );
    const { txHash, blockNumber } = await addRecordOnChain(patientWalletAddress, cid);

    res.status(201).json({ success: true, ipfsCid: cid, txHash, blockNumber });
  } catch (err) { next(err); }
});

// GET /api/records/:patientAddress
router.get('/:patientAddress', authMiddleware, async (req, res, next) => {
  try {
    const { patientAddress } = req.params;
    const isOwner   = req.user.walletAddress === patientAddress.toLowerCase();
    const isInsurer = req.user.role === 'insurer';
    const isDoctor  = req.user.role === 'doctor';

    if (!isOwner && !isInsurer && !isDoctor)
      return res.status(403).json({ success: false, message: 'Access denied' });

    const records   = await getRecordsFromChain(patientAddress);
    const decrypted = await Promise.all(records.map(async r => {
      try {
        const ipfsData = await fetchFromIPFS(r.ipfsCid);
        const data     = decrypt(ipfsData.encrypted, patientAddress);
        return { ...r, data, retrieved: true };
      } catch {
        return { ...r, data: null, retrieved: false };
      }
    }));

    res.json({ success: true, records: decrypted });
  } catch (err) { next(err); }
});

module.exports = router;