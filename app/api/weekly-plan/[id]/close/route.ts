import { auth } from "@/app/lib/auth";
import { connectDB } from "@/app/lib/db";
import WeeklyPlan from "@/app/lib/models/WeeklyPlan";
import { NextResponse } from "next/server";

export async function POST(context: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    const user = await auth();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const weeklyPlan = await WeeklyPlan.findOne({
      _id: id,
      userId: user.id,
    }).populate("tasks");

    if (!weeklyPlan) {
      return NextResponse.json(
        { message: "Weekly plan not found or already locked" },
        { status: 404 },
      );
    }

    // lock tuần
    weeklyPlan.locked = true;

    // tính completedTasks
    weeklyPlan.completedTasks = weeklyPlan.tasks.filter(
      (t: any) => t.status === "done",
    ).length;

    await weeklyPlan.save();

    return NextResponse.json(weeklyPlan);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to close weekly plan" },
      { status: 500 },
    );
  }
}
