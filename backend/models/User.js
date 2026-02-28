const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    walletAddress:     { type: String, required: true, unique: true, lowercase: true, trim: true },
    role:              { type: String, enum: ['patient', 'doctor', 'hospital', 'insurer'], default: 'patient' },
    name:              { type: String, required: true, trim: true, default: 'New User' },
    email:             { type: String, trim: true, lowercase: true },
    insurancePolicyId: { type: String },
    insurerId:         { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
    hospitalId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
    specialty:         { type: String },
    nonce:             { type: String },
    biometricKey:      { type: String },
    isActive:          { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.methods.generateNonce = function () {
  this.nonce = Math.floor(Math.random() * 1_000_000).toString();
  return this.nonce;
};

module.exports = mongoose.model('User', userSchema);