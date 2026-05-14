import { db } from "../config/db.js";

export const getCredentials = (req, res) => {
  const patientCredentials = db.data.credentials.filter(c => c.patientId === req.user.id);
  res.json({ credentials: patientCredentials });
};

// 1. Fetch the Verifier's requirement
export const getRequestDetails = (req, res) => {
  const { requestId } = req.params;
  const request = db.data.requests.find(r => r.id === requestId);
  if (!request) return res.status(404).json({ error: "Invalid Request ID" });
  
  res.json({ request });
};

// 2. Submit proof specifically for a request
export const submitProof = async (req, res) => {
  const { requestId, proofPayload } = req.body;
  const request = db.data.requests.find(r => r.id === requestId);
  
  if (!request) return res.status(404).json({ error: "Request not found" });

  // Verify the math (simulated backend verification)
  const isValid = 
    proofPayload.protocol === "groth16" && 
    proofPayload.publicSignals[0] === "1" &&
    proofPayload.condition === `${request.parameterKey} ${request.operator} ${request.threshold}`;

  request.status = isValid ? "verified" : "failed";
  request.proofPayload = proofPayload;
  request.fulfilledBy = req.user.id;
  await db.write();

  res.json({ message: "Proof submitted successfully", status: request.status });
};