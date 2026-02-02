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

    const task = await Task.findOne({
      _id: id,
      userId: user.id,
      isDeleted: false,
    });

    if (!task) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

    // ✅ Fields cho phép update
    const allowedUpdates = [
      "title",
      "description",
      "status",
      "priority",
      "startDate",
      "dueDate",
      "estimatedMinutes",
      "actualMinutes",
      "tags",
      "energyLevel",
      "focusLevel",
      "categoryId",
    ];

    Object.keys(body).forEach((key) => {
      if (!allowedUpdates.includes(key)) return;

      if (key === "startDate" || key === "dueDate") {
        task[key] = body[key] ? new Date(body[key]) : undefined;
      } else {
        task[key] = body[key];
      }
    });

    await task.save();
    await task.populate("categoryId", "name");

    return NextResponse.json(task);
  } catch (error) {
    console.error("PATCH /api/tasks/[id] error:", error);
    return NextResponse.json(
      { message: "Failed to update task" },
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

    const task = await Task.findOne({
      _id: id,
      userId: user.id,
      isDeleted: false,
    });

    if (!task) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

    task.isDeleted = true;
    await task.save();

    return NextResponse.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/tasks/[id] error:", error);
    return NextResponse.json(
      { message: "Failed to delete task" },
      { status: 500 },
    );
  }
}
