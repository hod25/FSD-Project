import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import fs from "fs";
import multer from "multer";
import next from "next";

// Controllers & models
import { sendAlert } from "./socket/socket";
import EventModel from "./models/Event";

// Routes
import authRoutes from "./routes/auth";
import locationRoutes from "./routes/locations";
import areaRoutes from "./routes/areas";
import userRoutes from "./routes/users";
import eventRoutes from "./routes/event";
import statsRoutes from "./routes/stats";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev, dir: path.join(__dirname, "../../client") });
const handle = nextApp.getRequestHandler();

// ===== Build and export the app (async) =====
const appPromise = (async () => {
  await nextApp.prepare();

  const app = express();

  // ===== CORS =====
  /**
   * @deprecated Old fixed-origin CORS (localhost only)
   * app.use(cors({
   *   origin: "http://localhost:3000",
   *   credentials: true,
   *   methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
   * }));
   */
  app.use(cors({
    origin: (origin, callback) => callback(null, true), // allow all
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
  }));

  // ===== Static Folder for images =====
  const alertImagesPath = path.join(__dirname, "../public/alert_images");
  fs.mkdirSync(alertImagesPath, { recursive: true });
  app.use("/static", express.static(path.join(__dirname, "../public")));

  // ===== Body Parsers =====
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  // ===== Multer Setup =====
  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, alertImagesPath),
    filename: (_req, file, cb) => {
      const filename = `frame_${Date.now()}${path.extname(file.originalname)}`;
      cb(null, filename);
    }
  });
  const upload = multer({ storage });

  // ===== Routes =====
  app.use("/api/auth", authRoutes);
  app.use("/api/locations", locationRoutes);
  app.use("/api/areas", areaRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/events", eventRoutes);
  app.use("/api/stats", statsRoutes);

  // ===== Real-Time Alert Endpoint =====
  app.post("/api/alert", upload.single("image"), async (req, res) => {
    const { message, timestamp, site_location, area_location, details } = req.body;
    const filename = req.file?.filename;

    const image_url = filename
      ? `http://pro-safe.cs.colman.ac.il:5000/static/alert_images/${filename}`
      : "";

    const no_hardhat_count = req.body.no_hardhat_count
      ? parseInt(req.body.no_hardhat_count, 10)
      : 0;

    console.log("🚨 Alert Received:", message, timestamp);

    sendAlert({ message, timestamp, site_location, area_location, details, image_url, no_hardhat_count });

    try {
      const saved = await EventModel.create({
        site_location,
        area_location,
        status: "Not Handled",
        details,
        image_url,
        time_: timestamp,
        no_hardhat_count
      });

      res.status(200).json({ success: true });
    } catch (err) {
      console.error("❌ Failed to save event:", err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  // ===== Next.js frontend =====
  app.all("*", (req, res) => handle(req, res));

  return app;
})();

export default appPromise;
