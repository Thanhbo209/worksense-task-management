import { connectDB } from "@/app/lib/db";
import { User } from "@/app/lib/models/User";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();
  const users = await User.find();
  return NextResponse.json(users || "hello");
}
