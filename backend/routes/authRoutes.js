import express from "express";
import { loginIssuer, loginProver, loginVerifier } from "../controllers/authController.js";

const router = express.Router();

router.post("/issuer/login", loginIssuer);
router.post("/prover/login", loginProver);
router.post("/verifier/login", loginVerifier);

export default router;