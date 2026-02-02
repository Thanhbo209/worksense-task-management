// app/api/weekly-plan/[id]/tasks/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/app/lib/auth";
import { connectDB } from "@/app/lib/db";
import WeeklyPlan from "@/app/lib/models/WeeklyPlan";
import Task from "@/app/lib/models/Task";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();

    const user = await auth();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // ✅ FIX Ở ĐÂY
    const { id: weeklyPlanId } = await context.params;

    const { taskId } = await req.json();

    const weeklyPlan = await WeeklyPlan.findOne({
      _id: weeklyPlanId,
      userId: user.id,
    });

    if (!weeklyPlan) {
      return NextResponse.json(
        { message: "Weekly plan not found or locked" },
        { status: 404 },
      );
    }

    const task = await Task.findOne({
      _id: taskId,
      userId: user.id,
    });

    if (!task) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

    if (!weeklyPlan.tasks.includes(task._id)) {
      weeklyPlan.tasks.push(task._id);
      weeklyPlan.targetTasks = weeklyPlan.tasks.length;
      await weeklyPlan.save();
    }

    await weeklyPlan.populate("tasks");

    return NextResponse.json(weeklyPlan);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Failed to add task" },
      { status: 500 },
    );
  }
}
