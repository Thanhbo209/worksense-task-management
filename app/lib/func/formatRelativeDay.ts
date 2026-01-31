import dayjs from "dayjs";

export function formatRelativeDay(date?: Date | string | null): string {
  if (!date) return "No deadline";

  const today = dayjs().startOf("day");
  const target = dayjs(date).startOf("day");

  if (!target.isValid()) return "Invalid date";

  const diff = target.diff(today, "day");

  if (diff < 0) return `Overdue ${Math.abs(diff)}d`;
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff <= 7) return `In ${diff} days`;

  return target.format("DD/MM/YYYY");
}
