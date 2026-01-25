import mongoose from "mongoose";

// Import environment variables from .env file
const MONGODB_URI = process.env.MONGODB_URI;

/// Ensure the MongoDB URI is defined
if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local",
  );
}

const uri: string = MONGODB_URI;

// Global is used here to maintain a cached connection across hot reloads
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

// Function to connect to the MongoDB database
export async function connectDB() {
  // Return the cached connection if it exists
  if (cached!.conn) {
    return cached!.conn;
  }

  // If no cached promise exists, create a new connection promise
  if (!cached!.promise) {
    cached!.promise = mongoose
      .connect(uri, {
        bufferCommands: false,
      })
      .then((m) => m.connection); // 🔑 LẤY connection
  }

  try {
    // Await the connection promise and cache the connection
    cached!.conn = await cached!.promise;
    console.log("MongoDB connected");
  } catch (error) {
    // Reset promise on failure to allow retry
    cached!.promise = null;
    throw error;
  }

  return cached!.conn;
}
