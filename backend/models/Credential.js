import mongoose from 'mongoose';

const credentialSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  patientId: { type: String, required: true },
  issuer: { type: String, required: true },
  domain: { type: String, required: true },
  documentType: { type: String, required: true },
  parameters: { type: Object, required: true }, // Stores the dynamic keys like Blood_Sugar or GPA
  signature: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model('Credential', credentialSchema);