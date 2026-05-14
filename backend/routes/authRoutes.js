import express from "express";
import { 
  loginIssuer, signupIssuer, 
  loginProver, signupProver, 
  loginVerifier, signupVerifier 
} from "../controllers/authController.js";

const router = express.Router();

router.post("/issuer/login", loginIssuer);
router.post("/issuer/signup", signupIssuer);

router.post("/prover/login", loginProver);
router.post("/prover/signup", signupProver);

router.post("/verifier/login", loginVerifier);
router.post("/verifier/signup", signupVerifier);

export default router;