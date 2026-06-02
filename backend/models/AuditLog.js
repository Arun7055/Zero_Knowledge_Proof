import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  proverId: { type: String, required: true },
  verifierId: { type: String, required: true },
  credentialId: { type: String, required: true },
  documentType: { type: String, required: true },
  policyChecked: { type: String, required: true },
  status: { type: String, enum: ['verified', 'failed'], required: true },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('AuditLog', auditLogSchema);