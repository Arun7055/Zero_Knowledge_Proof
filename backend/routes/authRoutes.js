import express from "express";
import { 
  loginIssuer, 
  loginProver, signupProver, 
  loginVerifier 
} from "../controllers/authController.js";

const router = express.Router();

router.post("/issuer/login", loginIssuer);

router.post("/prover/login", loginProver);
router.post("/prover/signup", signupProver);

router.post("/verifier/login", loginVerifier);

export default router;