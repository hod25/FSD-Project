import express from "express";
import { connectToDB } from "./config/db";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

// Connect to MongoDB
connectToDB();

// Routes
app.get("/", (req, res) => {
  res.send("📡 ProSafe backend is running");
});

export default app;
