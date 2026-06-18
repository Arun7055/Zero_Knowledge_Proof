import express from "express";
import { getStats } from "../controllers/homeController";

const router = express.Router();

router.get("/stats",getStats);

export default router;