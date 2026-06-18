import express from "express";
import { requireRole } from "../middlewares/authMiddleware.js";
import { issueCredential, getIssuedHistory } from "../controllers/issuerController.js";

const router = express.Router();

router.post("/credential", requireRole("issuer"), issueCredential);
router.get("/history", requireRole("issuer"), getIssuedHistory);

export default router;