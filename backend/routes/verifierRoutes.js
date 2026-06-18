import express from "express";
import { requireRole } from "../middlewares/authMiddleware.js";
import { createRequest, checkRequestStatus, getVerifierHistory } from "../controllers/verifierController.js";

const router = express.Router();
router.post("/request", requireRole("verifier"), createRequest);
router.get("/request/:requestId", requireRole("verifier"), checkRequestStatus);
router.get("/history", requireRole("verifier"), getVerifierHistory);
export default router;