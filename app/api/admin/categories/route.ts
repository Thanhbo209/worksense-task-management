import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import { Category } from "@/app/lib/models/Category";
import { auth } from "@/app/lib/auth"; // middleware check user + role

export async function POST(req: Request) {
  await connectDB();

  const user = await auth();

  if (!user || user.role !== "admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { name, key, icon, color, isActive } = await req.json();

  if (!name || !key) {
    return NextResponse.json(
      { message: "Name and key are required" },
      { status: 400 },
    );
  }

  const category = await Category.create({
    name: name.trim(),
    key: key.toLowerCase(),
    icon,
    color,
    isActive,
    createdBy: user.id,
  });

  return NextResponse.json(category, { status: 201 });
}
