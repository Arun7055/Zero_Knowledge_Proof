import express from "express";
import { requireRole } from "../middlewares/authMiddleware.js";
import { getCredentials, getRequestDetails, submitProof, getAuditLogs } from "../controllers/proverController.js";

const router = express.Router();
router.get("/credentials", requireRole("prover"), getCredentials);
router.get("/request/:requestId", requireRole("prover"), getRequestDetails);
router.post("/submit-proof", requireRole("prover"), submitProof);
router.get("/audit-logs", requireRole("prover"), getAuditLogs);
export default router;