import Credential from "../models/Credential.js";

export const issueCredential = async (req, res) => {
  try {
    const { patientId, documentType, parameters, validUntil } = req.body;
    
    // 1. Create the unsigned payload structure
    if (!validUntil) return res.status(400).json({ error: "Expiration date is required" });
    const unsignedPayload = { 
      patientId, 
      documentType, 
      parameters, 
      validUntil,
      issuer: req.user.id,
      domain: req.user.domain // Automatically tags with the logged-in issuer's domain
    };
    
    // 2. Generate a mock cryptographic signature based on the data
    const signatureText = Buffer.from(JSON.stringify(unsignedPayload)).toString('base64').slice(0, 32);
    const mockSignature = `0xmock_sig_${signatureText}`;

    // 3. Save the credential directly into MongoDB
    const credential = await Credential.create({
      id: `cred_${Date.now()}`,
      ...unsignedPayload,
      signature: mockSignature
    });

    res.json({ message: "Credential issued successfully and saved to MongoDB", credential });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getIssuedHistory = async (req, res) => {
  try {
    // We use $or so MongoDB checks if the string "BANK-1" matches the JWT's id, username, or name.
    const credentials = await Credential.find({ 
      $or: [
        { issuer: req.user.id },
        { issuer: req.user.username },
        { issuer: req.user.name },
        { issuer: req.user.issuerId } // Catches custom ID fields
      ]
    }).sort({ createdAt: -1 });

    res.json({ credentials });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};