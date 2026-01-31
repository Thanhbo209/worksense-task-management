import dayjs from "dayjs";

export type PriorityTaskInput = {
  dueDate?: Date | string | null;
  status: "todo" | "in_progress" | "done";
};

export function calculatePriorityScoreDaily(task: PriorityTaskInput): number {
  // DONE => không ưu tiên
  if (task.status === "done") return 0;

  let score = 0;
  const today = dayjs().startOf("day");

  /* ========= DEADLINE ========= */
  if (task.dueDate) {
    const deadline = dayjs(task.dueDate);
    if (!deadline.isValid()) {
      // invalid dueDate -> skip deadline scoring
      return score;
    }
    const diffDays = deadline.startOf("day").diff(today, "day");

    if (diffDays < 0)
      score += 50; // overdue
    else if (diffDays === 0)
      score += 40; // due today
    else if (diffDays <= 1) score += 35;
    else if (diffDays <= 2) score += 30;
    else if (diffDays <= 5) score += 20;
    else if (diffDays <= 10) score += 10;
    else score += 5;
  }

  /* ========= STATUS BONUS ========= */
  if (task.status === "in_progress") score += 10;
  else if (task.status === "todo") score += 5;

  return score;
}
