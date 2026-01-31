import { connectDB } from "@/app/lib/db";
import Task from "@/app/lib/models/Task";
import { calculatePriorityScoreDaily } from "@/app/lib/func/calculatePriorityScoreDaily";
import { scoreToPriority } from "@/app/lib/func/scoreToPriority";

import { NextRequest, NextResponse } from "next/server";
export async function GET(req: NextRequest) {
  const secret = req.headers.get("authorization");
  if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  await connectDB();
  const tasks = await Task.find();

  for (const task of tasks) {
    const score = calculatePriorityScoreDaily(task);
    const priority = scoreToPriority(score);

    task.priorityScore = score;
    task.priority = priority;
    task.lastPriorityCalcAt = new Date();

    await task.save();
  }

  return NextResponse.json({
    updatedTasks: tasks.length,
  });
}
