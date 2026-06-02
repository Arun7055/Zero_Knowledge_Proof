import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  verifierId: { type: String, required: true },
  parameterKey: { type: String, required: true },
  operator: { type: String, required: true },
  threshold: { type: Number, required: true },
  status: { type: String, default: 'pending', enum: ['pending', 'verified', 'failed'] },
  fulfilledBy: { type: String }, // Which Prover fulfilled it
  proofPayload: { type: Object } // The ZKP data
}, { timestamps: true });

export default mongoose.model('Request', requestSchema);