import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import issuerRoutes from "./routes/issuerRoutes.js";
import proverRoutes from "./routes/proverRoutes.js";
import verifierRoutes from "./routes/verifierRoutes.js";

const app = express();

app.use(cors({
  origin: "http://localhost:5173", // Replace with your frontend's URL
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());

// Mount Routes
app.use("/api/auth", authRoutes);
app.use("/api/issuer", issuerRoutes);
app.use("/api/prover", proverRoutes);
app.use("/api/verifier", verifierRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`ZKP Backend running on port ${PORT}`);
});