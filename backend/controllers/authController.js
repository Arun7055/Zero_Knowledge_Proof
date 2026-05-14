import jwt from "jsonwebtoken";
import { authDb } from "../config/db.js";
import { JWT_SECRET } from "../middlewares/authMiddleware.js";

function generateToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "24h" });
}

// ==========================================
// 1. HARDCODED ISSUER (Doctor)
// ==========================================
export const loginIssuer = (req, res) => {
  const { id, password } = req.body;
  // Hardcoded check
  if (id === "DOC-1" && password === "password123") {
    const user = { id: "DOC-1", name: "Dr. Smith", role: "issuer" };
    return res.json({ token: generateToken(user), user });
  }
  return res.status(401).json({ error: "Invalid Doctor credentials" });
};

// ==========================================
// 2. HARDCODED VERIFIER (Third Party)
// ==========================================
export const loginVerifier = (req, res) => {
  const { apiKey } = req.body;
  // Hardcoded check
  if (apiKey === "verify999") {
    const user = { id: "VER-1", name: "Acme Insurance", role: "verifier" };
    return res.json({ token: generateToken(user), user });
  }
  return res.status(401).json({ error: "Invalid Verifier API Key" });
};

// ==========================================
// 3. DYNAMIC PROVER (Patient) - Uses db2.json
// ==========================================
export const signupProver = async (req, res) => {
  const { patientId, pin, name } = req.body;
  
  if (authDb.data.users.find(u => u.id === patientId)) {
    return res.status(400).json({ error: "Patient ID already exists" });
  }
  
  const user = { id: patientId, pin, name, role: "prover" };
  authDb.data.users.push(user);
  await authDb.write();
  
  res.json({ token: generateToken(user), user: { id: user.id, name: user.name } });
};

export const loginProver = (req, res) => {
  const { patientId, pin } = req.body;
  
  const user = authDb.data.users.find(u => u.id === patientId && u.pin === pin && u.role === "prover");
  if (!user) return res.status(401).json({ error: "Invalid Patient credentials" });
  
  res.json({ token: generateToken(user), user: { id: user.id, name: user.name } });
};