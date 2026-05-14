import {db} from "../config/db.js";

export const getCredentials = (req, res) => {
  const patientCredentials = db.data.credentials.filter(c => c.patientId === req.user.id);
  res.json({ credentials: patientCredentials });
};

export const submitProof = async (req, res) => {
  const { proofPayload } = req.body;
  
  const proofRecord = {
    id: `proof_${Date.now()}`,
    patientId: req.user.id,
    payload: proofPayload,
    status: "pending",
    submittedAt: new Date().toISOString()
  };
  
  db.data.proofs.push(proofRecord);
  await db.write(); // Save to db.json

  res.json({ message: "Proof submitted to network", proofId: proofRecord.id });
};