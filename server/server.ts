import http from "http";
import app from "./app";
import { initSocket } from "./socket/socket";
import dotenv from "dotenv";
import locationRoutes from "./routes/locations";

dotenv.config();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// ===== Initialize WebSocket =====
initSocket(server);

// Add the locations routes
app.use("/api/locations", locationRoutes);

// ===== Start Server =====
server.listen(PORT, () => {
  console.log(
    `🚀 ProSafe server + WebSocket running at http://localhost:${PORT}`
  );
});
