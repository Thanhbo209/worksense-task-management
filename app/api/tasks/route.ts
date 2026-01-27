import { NextResponse } from "next/server";
import { auth } from "@/app/lib/auth";
import { Task } from "@/app/lib/models/Task";
import { connectDB } from "@/app/lib/db";

export async function GET() {
  await connectDB();

  const user = await auth();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const tasks = await Task.find({ userId: user.id })
    .populate("categoryId", "name")
    .sort({ createdAt: -1 });

  return NextResponse.json(tasks);
}

export async function POST(req: Request) {
  await connectDB();

  const user = await auth();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const {
    title,
    description,
    categoryId,
    status,
    priority,
    startDate,
    dueDate,
    estimatedMinutes,
    actualMinutes,
    tags,
    energyLevel,
    focusLevel,
  } = body;

  if (!title || !categoryId) {
    return NextResponse.json(
      { message: "Title and category are required" },
      { status: 400 },
    );
  }

  const task = await Task.create({
    title,
    description,
    categoryId,
    userId: user.id,

    status: status ?? "todo",
    priority: priority ?? "medium",

    startDate: startDate ? new Date(startDate) : undefined,
    dueDate: dueDate ? new Date(dueDate) : undefined,

    estimatedMinutes,
    actualMinutes,
    tags,
    energyLevel,
    focusLevel,
  });

  return NextResponse.json(task, { status: 201 });
}
