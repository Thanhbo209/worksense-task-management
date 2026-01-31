import "@/app/lib/models/index";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/lib/auth";
import { connectDB } from "@/app/lib/db";
import Task from "@/app/lib/models/Task";
import { calculatePriorityScoreDaily } from "@/app/lib/func/calculatePriorityScoreDaily";
import { scoreToPriority } from "@/app/lib/func/scoreToPriority";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const user = await auth();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const query: any = {
      userId: user.id,
    };

    if (status) {
      query.status = status;
    }

    const tasks = await Task.find(query).populate("categoryId", "name");

    const updatedTasks = await Promise.all(
      tasks.map(async (task) => {
        const newScore = calculatePriorityScoreDaily(task);
        const newPriority = scoreToPriority(newScore);

        if (task.priorityScore !== newScore || task.priority !== newPriority) {
          task.priorityScore = newScore;
          task.priority = newPriority;
          await task.save();
        }

        return task;
      }),
    );

    // Sort sau khi score đã chuẩn
    updatedTasks.sort((a, b) => {
      if (b.priorityScore !== a.priorityScore) {
        return b.priorityScore - a.priorityScore;
      }
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return NextResponse.json(updatedTasks);
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

  const taskData = {
    title,
    description,
    categoryId,
    userId: user.id,

    status: status ?? "todo",

    startDate: startDate ? new Date(startDate) : undefined,
    dueDate: dueDate ? new Date(dueDate) : undefined,

    estimatedMinutes,
    actualMinutes,
    tags,
    energyLevel,
    focusLevel,
  };

  // 🔥 Tính priority ngay khi tạo
  const priorityScore = calculatePriorityScoreDaily(taskData);
  const priority = scoreToPriority(priorityScore);

  const task = await Task.create({
    ...taskData,
    priorityScore,
    priority,
  });

  return NextResponse.json(task, { status: 201 });
}
