import "@/app/lib/models/index";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/lib/auth";
import { connectDB } from "@/app/lib/db";
import Task from "@/app/lib/models/Task";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const user = await auth();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const query: string = {
      userId: user.id,
    };

    if (status) {
      query.status = status;
    }

    const tasks = await Task.find(query)
      .populate("categoryId", "name")
      .sort({ createdAt: -1 });

    return NextResponse.json(tasks);
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to fetch tasks",
        error: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: 500 },
    );
  }
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
