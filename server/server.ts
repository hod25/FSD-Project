import express from "express";
import http from "http";
import https from "https";
import fs from "fs";
import next from "next";
import dotenv from "dotenv";
import cors from "cors";

import { initSocket, sendAlert } from "./socket/socket";
import { connectToDB } from "./config/db";
import locationRoutes from "./routes/locations";
import authRoutes from "./routes/auth";
import eventRoutes from "./routes/events";
import statsRoutes from "./routes/stats";

dotenv.config();

const port = parseInt(
  process.env.PORT ||
    "5000" /*|| (process.env.NODE_ENV === "production" ? "443" : "5000")*/
);
const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev, dir: "../client" });
const handle = nextApp.getRequestHandler();

async function start() {
  await nextApp.prepare();
  await connectToDB();
  console.log("🚀 Connected to MongoDB");

  const app = express();

  // ===== Middleware =====
  app.use(cors());
  app.use(express.json());

  // ===== API Routes =====
  app.use("/api/auth", authRoutes);
  app.use("/api/locations", locationRoutes);
  app.use("/api/events", eventRoutes);
  app.use("/api/stats", statsRoutes);
  app.post("/api/alert", (req, res) => {
    const { message, timestamp } = req.body;
    console.log("🚨 Alert Received:", message, timestamp);
    sendAlert({ message, timestamp });
    res.status(200).json({ success: true });
  });

  app.get("/", (req, res) => {
    res.send("📡 ProSafe backend is running");
  });

  // // ===== Next.js Handler =====
  app.all("*", (req, res) => handle(req, res));

  // ===== HTTP or HTTPS Server =====
  let server: http.Server | https.Server;

  // if (dev) {
  // Development uses HTTP
  server = http.createServer(app);
  server.listen(port, () => {
    console.log(`✅ server running at http://localhost:${port}`);
  });
  // } else {
  //   // Production uses HTTPS
  //   const sslOptions = {
  //     key: fs.readFileSync("./myserver.key"),
  //     cert: fs.readFileSync("./CSB.crt"),
  //   };

  //   server = https.createServer(sslOptions, app);
  //   server.listen(port, () => {
  //     console.log(
  //       `🔒 HTTPS server running at https://pro-safe.cs.colman.ac.il/`
  //     );
  //   });
  // }

  // ===== WebSocket Initialization =====
  initSocket(server);
}

start().catch((err) => {
  console.error("⨯ Server start error:", err);
});
