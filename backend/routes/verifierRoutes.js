import express from "express";
import { requireRole } from "../middlewares/authMiddleware.js";
import { verifyProof } from "../controllers/verifierController.js";

const router = express.Router();

router.post("/verify", requireRole("verifier"), verifyProof);

export default router;