import express from "express";
import { requireRole } from "../middlewares/authMiddleware.js";
import { getCredentials, submitProof } from "../controllers/proverController.js";

const router = express.Router();

router.get("/credentials", requireRole("prover"), getCredentials);
router.post("/submit-proof", requireRole("prover"), submitProof);

export default router;