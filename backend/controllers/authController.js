import jwt from "jsonwebtoken";
import { authDb } from "../config/db.js";
import { JWT_SECRET } from "../middlewares/authMiddleware.js";

function generateToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "24h" });
}

// --- ISSUER ---
export const signupIssuer = async (req, res) => {
  const { id, password, name } = req.body;
  if (authDb.data.users.find(u => u.id === id)) return res.status(400).json({ error: "Doctor ID already exists" });
  
  const user = { id, password, name, role: "issuer" };
  authDb.data.users.push(user);
  await authDb.write();
  
  res.json({ token: generateToken(user), user: { id: user.id, name: user.name } });
};

export const loginIssuer = (req, res) => {
  const { id, password } = req.body;
  const user = authDb.data.users.find(u => u.id === id && u.password === password && u.role === "issuer");
  if (!user) return res.status(401).json({ error: "Invalid credentials" });
  res.json({ token: generateToken(user), user: { id: user.id, name: user.name } });
};

// --- PROVER (PATIENT) ---
export const signupProver = async (req, res) => {
  const { patientId, pin, name } = req.body;
  if (authDb.data.users.find(u => u.id === patientId)) return res.status(400).json({ error: "Patient ID already exists" });
  
  const user = { id: patientId, pin, name, role: "prover" };
  authDb.data.users.push(user);
  await authDb.write();
  
  res.json({ token: generateToken(user), user: { id: user.id, name: user.name } });
};

export const loginProver = (req, res) => {
  const { patientId, pin } = req.body;
  const user = authDb.data.users.find(u => u.id === patientId && u.pin === pin && u.role === "prover");
  if (!user) return res.status(401).json({ error: "Invalid credentials" });
  res.json({ token: generateToken(user), user: { id: user.id, name: user.name } });
};

// --- VERIFIER ---
export const signupVerifier = async (req, res) => {
  const { verifierId, apiKey, name } = req.body;
  if (authDb.data.users.find(u => u.id === verifierId)) return res.status(400).json({ error: "Verifier ID already exists" });
  
  const user = { id: verifierId, apiKey, name, role: "verifier" };
  authDb.data.users.push(user);
  await authDb.write();
  
  res.json({ token: generateToken(user), user: { id: user.id, name: user.name } });
};

export const loginVerifier = (req, res) => {
  const { verifierId, apiKey } = req.body;
  const user = authDb.data.users.find(u => u.id === verifierId && u.apiKey === apiKey && u.role === "verifier");
  if (!user) return res.status(401).json({ error: "Invalid credentials" });
  res.json({ token: generateToken(user), user: { id: user.id, name: user.name } });
};