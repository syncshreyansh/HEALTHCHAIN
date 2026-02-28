const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema(
  {
    name:               { type: String, required: true, trim: true },
    address:            { type: String, trim: true },
    city:               { type: String, trim: true },
    state:              { type: String, trim: true },
    country:            { type: String, trim: true, default: 'India' },
    phone:              { type: String, trim: true },
    email:              { type: String, trim: true, lowercase: true },
    registrationNumber: { type: String, trim: true },
    walletAddress:      { type: String, required: true, lowercase: true, trim: true },
    supportedInsurers:  [{ type: String }],
    isActive:           { type: Boolean, default: true },
  },
  { timestamps: true }
);

hospitalSchema.index({ isActive: 1 });
hospitalSchema.index({ supportedInsurers: 1 });

module.exports = mongoose.model('Hospital', hospitalSchema);