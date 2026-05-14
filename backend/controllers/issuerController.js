import db from "../config/db.js";

export const issueCredential = async (req, res) => {
  const { patientId, documentType, parameters } = req.body;
  
  const unsignedPayload = { patientId, documentType, parameters, issuer: req.user.id };
  const signature = Buffer.from(JSON.stringify(unsignedPayload)).toString('base64').slice(0, 32);

  const credential = {
    id: `cred_${Date.now()}`,
    ...unsignedPayload,
    signature: `0xmock_sig_${signature}`,
    issuedAt: new Date().toISOString()
  };

  db.data.credentials.push(credential);
  await db.write(); // Save to db.json

  res.json({ message: "Credential issued successfully", credential });
};