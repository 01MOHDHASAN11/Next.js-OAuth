import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI must be defined in environment variables");
}

let cachedConnection = null;

export async function connectToDatabase() {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    console.log("Using cached MongoDB connection");
    return cachedConnection;
  }

  try {
    console.log("MONGODB_URI:", MONGODB_URI);
    console.log("Connecting to MongoDB...");
    cachedConnection = await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB Connected Successfully, readyState:", mongoose.connection.readyState);
    return cachedConnection;
  } catch (error) {
    console.error("❗ Error connecting to MongoDB:", error.message);
    throw error;
  }
}