import { auth } from "@/app/lib/auth";
import { connectDB } from "@/app/lib/db";
import Task from "@/app/lib/models/Task";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    await connectDB();

    const user = await auth();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    // Find task & verify ownership
    const task = await Task.findOne({ _id: id, userId: user.id });
    if (!task) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

    // Fields allowed to update
    const allowedUpdates = [
      "title",
      "description",
      "categoryId",
      "status",
      "priority",
      "startDate",
      "dueDate",
      "estimatedMinutes",
      "actualMinutes",
      "tags",
      "energyLevel",
      "focusLevel",
    ];

    Object.keys(body).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        if (key === "startDate" || key === "dueDate") {
          task[key] = body[key] ? new Date(body[key]) : undefined;
        } else {
          task[key] = body[key];
        }
      }
    });

    await task.save();
    await task.populate("categoryId", "name");

    return NextResponse.json(task);
  } catch (error) {
    console.error("PATCH /api/tasks/[id] error:", error);

    return NextResponse.json(
      {
        message: "Failed to update task",
        error: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    await connectDB();

    const user = await auth();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const task = await Task.findOneAndDelete({
      _id: id,
      userId: user.id,
    });

    if (!task) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/tasks/[id] error:", error);

    return NextResponse.json(
      {
        message: "Failed to delete task",
        error: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: 500 },
    );
  }
}
