import { connectDB } from "@/app/lib/db";
import Task from "@/app/lib/models/Task";
import { calculatePriorityScoreDaily } from "@/app/lib/func/calculatePriorityScoreDaily";
import { mapPriorityEnum } from "@/app/lib/func/mapPriorityEnum";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();

  const tasks = await Task.find();

  for (const task of tasks) {
    const score = calculatePriorityScoreDaily(task);
    const priority = mapPriorityEnum(score);

    task.priorityScore = score;
    task.priority = priority;
    task.lastPriorityCalcAt = new Date();

    await task.save();
  }

  return NextResponse.json({
    updatedTasks: tasks.length,
  });
}
