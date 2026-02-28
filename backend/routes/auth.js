const express    = require('express');
const { ethers } = require('ethers');
const jwt        = require('jsonwebtoken');
const User       = require('../models/User');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

// POST /api/auth/challenge
router.post('/challenge', async (req, res, next) => {
  try {
    const { walletAddress } = req.body;
    if (!walletAddress)
      return res.status(400).json({ success: false, message: 'walletAddress required' });

    const address = walletAddress.toLowerCase();
    let user = await User.findOne({ walletAddress: address });
    if (!user) user = new User({ walletAddress: address });

    const nonce = user.generateNonce();
    await user.save();

    res.json({ success: true, nonce, message: `HealthChain-${nonce}` });
  } catch (err) { next(err); }
});

// POST /api/auth/verify
router.post('/verify', async (req, res, next) => {
  try {
    const { walletAddress, signature } = req.body;
    if (!walletAddress || !signature)
      return res.status(400).json({ success: false, message: 'walletAddress and signature required' });

    const address = walletAddress.toLowerCase();
    const user    = await User.findOne({ walletAddress: address });
    if (!user || !user.nonce)
      return res.status(400).json({ success: false, message: 'Request a challenge first' });

    const recovered = ethers.verifyMessage(`HealthChain-${user.nonce}`, signature);
    if (recovered.toLowerCase() !== address)
      return res.status(401).json({ success: false, message: 'Invalid signature' });

    user.nonce = null;
    await user.save();

    const token = jwt.sign(
      { id: user._id, walletAddress: user.walletAddress, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id:            user._id,
        walletAddress: user.walletAddress,
        role:          user.role,
        name:          user.name,
      },
    });
  } catch (err) { next(err); }
});

// GET /api/auth/me
router.get('/me', authMiddleware, (req, res) => {
  res.json({ success: true, user: req.user });
});

// PUT /api/auth/profile
router.put('/profile', authMiddleware, async (req, res, next) => {
  try {
    const { name, email, role, insurancePolicyId, specialty } = req.body;
    const updates = {};
    if (name)              updates.name              = name;
    if (email)             updates.email             = email;
    if (role)              updates.role              = role;
    if (insurancePolicyId) updates.insurancePolicyId = insurancePolicyId;
    if (specialty)         updates.specialty         = specialty;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    res.json({ success: true, user });
  } catch (err) { next(err); }
});

module.exports = router;