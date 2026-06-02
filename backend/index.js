import express from "express";
import cors from "cors";
import 'dotenv/config';

import authRoutes from "./routes/authRoutes.js";
import issuerRoutes from "./routes/issuerRoutes.js";
import proverRoutes from "./routes/proverRoutes.js";
import verifierRoutes from "./routes/verifierRoutes.js";
import { connectDB } from './config/db.js';

const app = express();

// Connect to MongoDB before setting up routes
connectDB();

app.use(cors());
app.use(express.json());

// Mount Routes
app.use("/api/auth", authRoutes);
app.use("/api/issuer", issuerRoutes);
app.use("/api/prover", proverRoutes);
app.use("/api/verifier", verifierRoutes);

const PORT = process.env.PORT || 5001;
const server = app.listen(PORT, "0.0.0.0",() => {
  console.log(`ZKP Backend running on port ${PORT}`);
});

server.on("error", (error) => {
  console.error(`Failed to start ZKP Backend on port ${PORT}:`, error.message);
});
