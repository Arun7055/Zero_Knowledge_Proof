import Request from "../models/Request.js";

// 1. Verifier creates a verification policy condition
export const createRequest = async (req, res) => {
  try {
    const { parameterKey, operator, threshold } = req.body;
    
    // Save the verification rules to MongoDB
    const request = await Request.create({
      id: `req_${Date.now()}`,
      verifierId: req.user.id,
      parameterKey,
      operator,
      threshold: Number(threshold), // Ensure it's a number for ZKP evaluation
      status: "pending"
    });

    res.json({ message: "Verification Request Created in MongoDB", request });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. Verifier checks if the Prover successfully fulfilled the request
export const checkRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    
    // Search MongoDB for this specific request
    const request = await Request.findOne({ id: requestId, verifierId: req.user.id });

    if (!request) {
      return res.status(404).json({ error: "Request not found or unauthorized" });
    }

    res.json({ request });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};