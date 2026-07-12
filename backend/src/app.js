import express from "express";
import cors from "cors";
import bookingRoutes from "./routes/bookings.js";
import resourceRoutes from "./routes/resources.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

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

// API Routes
app.use("/api/bookings", bookingRoutes);
app.use("/api/resources", resourceRoutes);

export default app;