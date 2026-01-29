import { NextResponse } from "next/server";
import { auth } from "@/app/lib/auth";
import Category from "@/app/lib/models/Category";
import { connectDB } from "@/app/lib/db";

export async function GET() {
  await connectDB();

  const user = await auth();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const categories = await Category.find().sort({ createdAt: -1 });
  return NextResponse.json(categories);
}
