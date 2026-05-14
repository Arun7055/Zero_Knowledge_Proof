import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import issuerRoutes from "./routes/issuerRoutes.js";
import proverRoutes from "./routes/proverRoutes.js";
import verifierRoutes from "./routes/verifierRoutes.js";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked origin: ${origin}`));
  },
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.use(express.json());

// Mount Routes
app.use("/api/auth", authRoutes);
app.use("/api/issuer", issuerRoutes);
app.use("/api/prover", proverRoutes);
app.use("/api/verifier", verifierRoutes);

const PORT = process.env.PORT || 5001;
const server = app.listen(PORT, () => {
  console.log(`ZKP Backend running on port ${PORT}`);
});

server.on("error", (error) => {
  console.error(`Failed to start ZKP Backend on port ${PORT}:`, error.message);
});
