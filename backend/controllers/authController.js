import jwt from "jsonwebtoken";
import db from "../config/db.js";
import { JWT_SECRET } from "../middlewares/authMiddleware.js";

export const loginIssuer = (req, res) => {
  const { id, password } = req.body;
  const user = db.data.users.find(u => u.id === id && u.password === password && u.role === "issuer");
  if (!user) return res.status(401).json({ error: "Invalid Issuer credentials" });
  
  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "1h" });
  res.json({ token, user: { id: user.id, name: user.name } });
};

export const loginProver = (req, res) => {
  const { patientId, pin } = req.body;
  const user = db.data.users.find(u => u.id === patientId && u.pin === pin && u.role === "prover");
  if (!user) return res.status(401).json({ error: "Invalid Patient credentials" });
  
  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "1h" });
  res.json({ token, user: { id: user.id, name: user.name } });
};

export const loginVerifier = (req, res) => {
  const { apiKey } = req.body;
  const user = db.data.users.find(u => u.apiKey === apiKey && u.role === "verifier");
  if (!user) return res.status(401).json({ error: "Invalid Verifier API Key" });
  
  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "1h" });
  res.json({ token, user: { id: user.id, name: user.name } });
};