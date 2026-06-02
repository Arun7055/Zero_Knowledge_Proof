import Credential from "../models/Credential.js";

export const issueCredential = async (req, res) => {
  try {
    const { patientId, documentType, parameters } = req.body;
    
    // 1. Create the unsigned payload structure
    const unsignedPayload = { 
      patientId, 
      documentType, 
      parameters, 
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