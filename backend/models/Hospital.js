const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema(
  {
    patientId:           { type: mongoose.Schema.Types.ObjectId, ref: 'User',     required: true },
    hospitalId:          { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
    doctorId:            { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    ipfsCid:             { type: String, required: true },
    blockchainTxHash:    { type: String },
    amount:              { type: Number, required: true },
    currency:            { type: String, default: 'INR' },
    status:              { type: String, enum: ['pending', 'approved', 'rejected', 'under_review'], default: 'pending' },
    fraudScore:          { type: Number, min: 0, max: 100, default: null },
    fraudConcerns:       [{ type: String }],
    aiExplanation:       { type: String },
    rejectionReason:     { type: String },
    rejectionReasonHash: { type: String },
    diagnosis:           { type: String },
    procedureCode:       { type: String },
    admissionDate:       { type: Date },
    dischargeDate:       { type: Date },
    resolvedAt:          { type: Date },
    resolvedBy:          { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

claimSchema.index({ patientId: 1,  status: 1 });
claimSchema.index({ hospitalId: 1, status: 1 });

module.exports = mongoose.model('Claim', claimSchema);