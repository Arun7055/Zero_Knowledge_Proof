import express from "express";
import { requireRole } from "../middlewares/authMiddleware.js";
import { createRequest, checkRequestStatus } from "../controllers/verifierController.js";

const router = express.Router();
router.post("/request", requireRole("verifier"), createRequest);
router.get("/request/:requestId", requireRole("verifier"), checkRequestStatus);
export default router;