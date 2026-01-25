import mongoose from "mongoose";

// Import environment variables from .env file
const MONGODB_URI: string =
  process.env.MONGODB_URI || "mongodb://localhost:27017/worksense";

/// Ensure the MongoDB URI is defined
if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local",
  );
}

// Global is used here to maintain a cached connection across hot reloads
let cached = (global as any).mongoose;

//  If the cached connection is not defined, initialize it
if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null }; // Initialize cached object
}

// Function to connect to the MongoDB database
export async function connectDB() {
  // Return the cached connection if it exists
  if (cached.conn) {
    return cached.conn;
  }

  // If no cached promise exists, create a new connection promise
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  // Await the connection promise and cache the connection
  cached.conn = await cached.promise;
  console.log("MongoDB connected");

  return cached.conn;
}
