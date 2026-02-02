import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import WeeklyPlan from "@/app/lib/models/WeeklyPlan";
import Task from "@/app/lib/models/Task";
import { auth } from "@/app/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const user = await auth();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const week = Number(searchParams.get("week"));
    const year = Number(searchParams.get("year"));

    if (!week || !year) {
      return NextResponse.json(
        { message: "week and year are required" },
        { status: 400 },
      );
    }

    let weeklyPlan = await WeeklyPlan.findOne({
      userId: user.id,
      week,
      year,
    }).populate("tasks");

    // 👉 AUTO CREATE
    if (!weeklyPlan) {
      // 1. Lấy task overdue / chưa done
      const carryOverTasks = await Task.find({
        userId: user.id,
        status: { $ne: "done" },
        dueDate: { $lte: new Date() },
      })
        .sort({ priorityScore: -1 })
        .limit(5);

      weeklyPlan = await WeeklyPlan.create({
        userId: user.id,
        week,
        year,
        tasks: carryOverTasks.map((t) => t._id),
        targetTasks: carryOverTasks.length,
        completedTasks: 0,
      });

      await weeklyPlan.populate("tasks");
    }

    return NextResponse.json(weeklyPlan);
  } catch (err) {
    return NextResponse.json(
      { message: "Failed to fetch weekly plan" },
      { status: 500 },
    );
  }
}
