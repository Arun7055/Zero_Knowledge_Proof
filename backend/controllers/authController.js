import jwt from "jsonwebtoken";
import User from "../models/Userr.js"
import { JWT_SECRET } from "../middlewares/authMiddleware.js";

function generateToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "24h" });
}
const ISSUERS = [
  { id: "DOC-1", password: "password123", name: "Dr. Smith", role: "issuer", domain: "Health" },
  { id: "BANK-1", password: "password123", name: "Global Bank", role: "issuer", domain: "Finance" },
  { id: "UNI-1", password: "password123", name: "State University", role: "issuer", domain: "Education" }
];

const VERIFIERS = [
  { id: "V-HEALTH", apiKey: "verify-health", name: "Acme Insurance", role: "verifier", domain: "Health" },
  { id: "V-FINANCE", apiKey: "verify-finance", name: "Mortgage Corp", role: "verifier", domain: "Finance" },
  { id: "V-EDU", apiKey: "verify-edu", name: "Tech Recruiters", role: "verifier", domain: "Education" }
];

// ==========================================
// 1. HARDCODED ISSUER (Doctor)
// ==========================================
export const loginIssuer = (req, res) => {
  const { id, password } = req.body;
  const user = ISSUERS.find(u => u.id === id && u.password === password);
  
  if (user) {
    // Notice we are adding the domain to the token payload!
    const token = jwt.sign({ id: user.id, role: user.role, domain: user.domain }, JWT_SECRET, { expiresIn: "24h" });
    return res.json({ token, user });
  }
  return res.status(401).json({ error: "Invalid Issuer credentials" });
};

// ==========================================
// 2. HARDCODED VERIFIER (Third Party)
// ==========================================
export const loginVerifier = (req, res) => {
  const { apiKey } = req.body;
  const user = VERIFIERS.find(u => u.apiKey === apiKey);
  
  if (user) {
    // Now user.id exists and will be packed safely into the JWT token!
    const token = jwt.sign({ id: user.id, role: user.role, domain: user.domain }, JWT_SECRET, { expiresIn: "24h" });
    return res.json({ token, user });
  }
  return res.status(401).json({ error: "Invalid Verifier API Key" });
};

// ==========================================
// 3. DYNAMIC PROVER (Patient) - Uses db2.json
// ==========================================
export const signupProver = async (req, res) => {
  try {
    const { patientId, pin, name } = req.body;
    
    // Check MongoDB if user exists
    const userExists = await User.findOne({ id: patientId });
    if (userExists) return res.status(400).json({ error: "Patient ID already exists" });
    
    // Create new user in MongoDB
    const user = await User.create({
      id: patientId,
      name,
      pin,
      role: "prover"
    });
    
    res.json({ token: generateToken(user), user: { id: user.id, name: user.name } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const loginProver = async (req, res) => {
  try {
    const { patientId, pin } = req.body;
    
    // Search MongoDB for matching credentials
    const user = await User.findOne({ id: patientId, pin, role: "prover" });
    if (!user) return res.status(401).json({ error: "Invalid Patient credentials" });
    
    res.json({ token: generateToken(user), user: { id: user.id, name: user.name } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};