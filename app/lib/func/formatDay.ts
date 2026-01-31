import dayjs from "dayjs";

export function formatDay(
  date?: Date | string | null,
  options?: {
    withTime?: boolean;
    fallback?: string;
  },
): string {
  if (!date) return options?.fallback ?? "No deadline";

  const d = dayjs(date);
  if (!d.isValid()) return options?.fallback ?? "Invalid date";

  return options?.withTime
    ? d.format("DD/MM/YYYY HH:mm")
    : d.format("DD/MM/YYYY");
}
