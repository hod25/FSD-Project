import express from "express";
import http from "http";
import next from "next";
import dotenv from "dotenv";
import cors from "cors";

import { initSocket, sendAlert } from "./socket/socket";
import { connectToDB } from "./config/db";
import locationRoutes from "./routes/locations";
import authRoutes from "./routes/auth";

dotenv.config();

const port = parseInt(process.env.PORT || "5000");
const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev, dir: "../client" }); // 👈 point to Next.js project
const handle = nextApp.getRequestHandler();

async function start() {
  await nextApp.prepare(); // Wait for Next.js to be ready

  const app = express();

  // ===== Middleware =====
  app.use(cors()); // Allow all origins - to be changed later
  app.use(express.json());

  // ===== Connect Database =====
  await connectToDB();
  console.log("🚀 Connected to MongoDB");

  // ===== API Routes =====
  app.use("/api/auth", authRoutes);
  app.use("/api/locations", locationRoutes);

  app.post("/api/alert", (req, res) => {
    const { message, timestamp } = req.body;
    console.log("🚨 Alert Received:", message, timestamp);
    sendAlert({ message, timestamp });
    res.status(200).json({ success: true });
  });

  app.get("/", (req, res) => {
    res.send("📡 ProSafe backend is running");
  });

  // ===== Next.js Handler =====
  app.all("*", (req, res) => {
    return handle(req, res);
  });

  // ===== HTTP + WebSocket Server =====
  const server = http.createServer(app);
  initSocket(server);

  server.listen(port, () => {
    console.log(`✅ Server running on http://localhost:${port}`);
  });
}

start().catch((err) => {
  console.error("⨯ Server start error:", err);
});
