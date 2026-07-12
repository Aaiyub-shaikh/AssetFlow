import express from "express";
import cors from "cors";
import assetRoutes from "./routes/assetRoutes.js";
import allocationRoutes from "./routes/allocationRoutes.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/assets", assetRoutes);
app.use("/api", allocationRoutes);

// Health Check Route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🚀 AssetFlow Backend Running"
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Server is healthy"
  });
});

export default app;