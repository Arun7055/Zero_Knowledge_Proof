import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['issuer', 'prover', 'verifier'], required: true },
  domain: { type: String }, // For Health, Finance, Education
  password: { type: String }, // For Issuers
  pin: { type: String },      // For Provers
  apiKey: { type: String }    // For Verifiers
}, { timestamps: true });

export default mongoose.model('User', userSchema);