import Credential from "../models/Credential.js";
import Request from "../models/Request.js";
import AuditLog from "../models/AuditLog.js";

// 1. Fetch user's credentials from MongoDB
export const getCredentials = async (req, res) => {
  try {
    const patientCredentials = await Credential.find({ patientId: req.user.id });
    res.json({ credentials: patientCredentials });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. Fetch specific verification request rules
export const getRequestDetails = async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await Request.findOne({ id: requestId });
    
    if (!request) return res.status(404).json({ error: "Invalid Request ID" });
    res.json({ request });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. Submit generated proof and update request status in MongoDB
export const submitProof = async (req, res) => {
  try {
    const { requestId, proofPayload, credentialId } = req.body;
    
    const request = await Request.findOne({ id: requestId });
    if (!request) return res.status(404).json({ error: "Request not found" });

    // ---> MISSING CODE ADDED HERE <---
    // You must fetch the credential from MongoDB before checking its date!
    const credential = await Credential.findOne({ id: credentialId });
    if (!credential) return res.status(404).json({ error: "Credential not found" });

    // Now 'credential' exists, so we can check its validUntil property
    if (new Date(credential.validUntil) < new Date()) {
      return res.status(400).json({ error: "This credential has expired and cannot be used for verification." });
    }

    // Validate the ZKP verification math criteria matches the request policy
    const isValid = 
      proofPayload.protocol === "groth16" && 
      proofPayload.publicSignals[0] === "1" &&
      proofPayload.condition === `${request.parameterKey} ${request.operator} ${request.threshold}`;

    // Update the existing request in MongoDB with results
    request.status = isValid ? "verified" : "failed";
    request.proofPayload = proofPayload;
    request.fulfilledBy = req.user.id;
    await request.save();

    await AuditLog.create({
      proverId: req.user.id,
      verifierId: request.verifierId,
      credentialId: credential.id,
      documentType: credential.documentType,
      policyChecked: `${request.parameterKey} ${request.operator} ${request.threshold}`,
      status: request.status
    });

    res.json({ message: "Proof submitted successfully", status: request.status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 4. Fetch the Prover's Audit History
export const getAuditLogs = async (req, res) => {
  try {
    // Fetch logs and sort them by newest first
    const logs = await AuditLog.find({ proverId: req.user.id }).sort({ timestamp: -1 });
    res.json({ logs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};