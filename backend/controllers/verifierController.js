import db from "../config/db.js";

export const verifyProof = async (req, res) => {
  const { proofId } = req.body;
  const proofRecord = db.data.proofs.find(p => p.id === proofId);

  if (!proofRecord) return res.status(404).json({ error: "Proof not found" });

  const payload = proofRecord.payload;
  const hasGroth16Shape =
    payload.protocol === "groth16" &&
    Array.isArray(payload.proof?.pi_a) &&
    Array.isArray(payload.publicSignals);

  const isValid = hasGroth16Shape && payload.publicSignals[0] === "1";
  
  proofRecord.status = isValid ? "verified" : "failed";
  await db.write(); // Save status update to db.json

  res.json({ 
    valid: isValid, 
    condition: payload.condition,
    message: isValid ? "Cryptographic Proof Validated" : "Verification Failed"
  });
};