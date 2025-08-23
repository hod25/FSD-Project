import http from "http";
import appPromise from "./app";  // now a Promise that resolves to Express
import { initSocket } from "./socket/socket";
import { connectToDB } from "./config/db";
import { startEventWatcher, stopEventWatcher } from './services/eventWatcher';
import mongoose from "mongoose";

console.log("🚀 Running server.ts from:", __filename);

const PORT = process.env.PORT || 5000;
let serverInstance: http.Server;

async function main() {
  try {
    // Wait for Next.js + Express to be ready
    const app = await appPromise;

    // Create HTTP server
    const server = http.createServer(app);

    // Init WebSocket + background services
    initSocket(server);
    startEventWatcher();

    // Connect to DB first
    await connectToDB();

    // Start listening
    serverInstance = server.listen(PORT, () => {
      console.log(`🚀 ProSafe server + WebSocket running at http://localhost:${PORT}`);
    });

    // Handle server error
    server.once("error", (err) => {
      console.error("❌ Server error:", err);
      process.exit(1);
    });

  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

// Start server
main();

// ===== Graceful shutdown handling =====
const gracefulShutdown = async (signal: string) => {
  console.log(`Received ${signal}. Starting graceful shutdown...`);

  stopEventWatcher();

  if (serverInstance) {
    serverInstance.close(() => {
      console.log("✅ HTTP server closed");
    });
  }

  try {
    await mongoose.connection.close();
    console.log("✅ MongoDB connection closed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during shutdown:", error);
    process.exit(1);
  }
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  gracefulShutdown("uncaughtException");
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  gracefulShutdown("unhandledRejection");
});
