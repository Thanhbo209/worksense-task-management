import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";

export async function GET() {
  await connectDB();

  return NextResponse.json("Hello from Test API");
}
