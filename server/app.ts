import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectToDB } from "./config/db";
import { sendAlert } from "./socket/socket";
import authRoutes from "./routes/auth";

dotenv.config();

const app = express();

// ===== Middleware =====
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(express.json());
app.use("/auth", authRoutes);

// ===== Connect Database =====
connectToDB().then(() => {
  console.log("🚀 ProSafe server is ready");
});

// ===== Routes =====
app.get("/", (req, res) => {
  res.send("📡 ProSafe backend is running");
});

app.post("/api/alert", (req, res) => {
  const { message, timestamp } = req.body;
  console.log("🚨 Alert Received:", message, timestamp);
  sendAlert({ message, timestamp });
  res.status(200).json({ success: true });
});

export default app;
