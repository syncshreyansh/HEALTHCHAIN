const express  = require('express');
const Hospital = require('../models/Hospital');
const User     = require('../models/User');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

// GET /api/hospitals
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    let query = { isActive: true };

    if (req.user.role === 'patient' && req.query.filterByInsurer !== 'false') {
      const patient = await User.findById(req.user._id);
      if (patient?.insurancePolicyId) {
        query.supportedInsurers = { $in: [patient.insurancePolicyId] };
      }
    }

    const hospitals = await Hospital.find(query).select('-__v');
    res.json({ success: true, hospitals });
  } catch (err) { next(err); }
});

// GET /api/hospitals/:id
router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital)
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    res.json({ success: true, hospital });
  } catch (err) { next(err); }
});

module.exports = router;