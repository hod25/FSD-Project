import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const TOKEN_SECRET = process.env.TOKEN_SECRET;

if (!MONGODB_URI) {
  throw new Error("Missing MONGODB_URI in .env file");
}

if (!TOKEN_SECRET) {
  console.warn(
    "⚠️ WARNING: TOKEN_SECRET is not defined in environment variables!"
  );
  if (process.env.NODE_ENV === "production") {
    throw new Error("TOKEN_SECRET must be defined in production environment");
  }
}

export const connectToDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB Atlas");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};
