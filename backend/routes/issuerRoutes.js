import express from "express";
import { requireRole } from "../middlewares/authMiddleware.js";
import { issueCredential } from "../controllers/issuerController.js";

const router = express.Router();

router.post("/credential", requireRole("issuer"), issueCredential);

export default router;