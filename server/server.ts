import http from "http";
import app from "./app";
import { initSocket } from "./socket/socket";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// ===== Initialize WebSocket =====
initSocket(server);

// ===== Start Server =====
server.listen(PORT, () => {
  console.log(
    `🚀 ProSafe server + WebSocket running at http://localhost:${PORT}`
  );
});
