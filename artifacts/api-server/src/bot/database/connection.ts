import mongoose from "mongoose";
import { logger } from "../../lib/logger.js";

let isConnected = false;

export async function connectDatabase(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    logger.warn("MONGODB_URI not set — database features disabled");
    return;
  }
  if (isConnected) return;
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    isConnected = true;
    logger.info("MongoDB connected");
    mongoose.connection.on("disconnected", () => {
      isConnected = false;
      logger.warn("MongoDB disconnected — will reconnect on next call");
    });
    mongoose.connection.on("error", (err) => {
      logger.error({ err }, "MongoDB error");
    });
  } catch (err) {
    logger.error({ err }, "MongoDB connection failed — database features disabled");
  }
}

export function isDbConnected(): boolean {
  return isConnected && mongoose.connection.readyState === 1;
}
