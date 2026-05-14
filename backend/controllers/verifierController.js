import { db } from "../config/db.js";

// 1. Verifier creates a condition/policy
export const createRequest = async (req, res) => {
  const { parameterKey, operator, threshold } = req.body;
  
  const request = {
    id: `req_${Date.now()}`,
    verifierId: req.user.id,
    parameterKey,
    operator,
    threshold,
    status: "pending", // pending, verified, or failed
    createdAt: new Date().toISOString()
  };

  db.data.requests.push(request);
  await db.write();

  res.json({ message: "Verification Request Created", request });
};

// 2. Verifier checks if the Prover fulfilled it
export const checkRequestStatus = (req, res) => {
  const { requestId } = req.params;
  const request = db.data.requests.find(r => r.id === requestId && r.verifierId === req.user.id);

  if (!request) return res.status(404).json({ error: "Request not found or unauthorized" });

  res.json({ request });
};