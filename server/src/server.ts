console.log("🚀 Running server.ts from:", __filename);

import http from "http";
import app from "./app";
import { initSocket } from "./socket/socket";
import { connectToDB } from "./config/db";
import { startEventWatcher, stopEventWatcher } from './services/eventWatcher';
import mongoose from "mongoose";

// // Increase max listeners to prevent warning
// process.setMaxListeners(15);

// יצירת שרת HTTP מתוך אפליקציית Express
const server = http.createServer(app);

// אתחול WebSocket
initSocket(server);
startEventWatcher();

// הפעלת השרת רק אחרי התחברות למונגו
const PORT = process.env.PORT || 5000;
let serverInstance: http.Server;

connectToDB().then(() => {
  serverInstance = server.listen(PORT, () => {
    console.log(`🚀 ProSafe server + WebSocket running at http://localhost:${PORT}`);
  });
});

// Graceful shutdown handling
const gracefulShutdown = async (signal: string) => {
  console.log(`Received ${signal}. Starting graceful shutdown...`);
  
  stopEventWatcher();
  
  if (serverInstance) {
    serverInstance.close(() => {
      console.log('✅ HTTP server closed');
    });
  }
  
  try {
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
};

// Handle different shutdown signals and clean all old mongodb processes
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});
