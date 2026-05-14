import jwt from "jsonwebtoken";

export const JWT_SECRET = process.env.JWT_SECRET || "super_secret_zkp_key_for_demo_only";

export const requireRole = (role) => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Missing token" });

    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (decoded.role !== role) {
        return res.status(403).json({ error: `Forbidden: Requires ${role} access` });
      }
      req.user = decoded; 
      next();
    } catch (err) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
  };
};