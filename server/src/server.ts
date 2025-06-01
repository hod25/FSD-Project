console.log("🚀 Running server.ts from:", __filename);

import http from "http";
import app from "./app";
import { initSocket } from "./socket/socket";
import { connectToDB } from "./config/db";


// יצירת שרת HTTP מתוך אפליקציית Express
const server = http.createServer(app);

// אתחול WebSocket
initSocket(server);

// הפעלת השרת רק אחרי התחברות למונגו
const PORT = process.env.PORT || 5000;

connectToDB().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 ProSafe server + WebSocket running at http://localhost:${PORT}`);
  });
});
