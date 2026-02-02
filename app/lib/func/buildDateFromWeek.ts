export function buildDateFromWeek(
  year: number,
  week: number,
  dayOfWeek: number, // 0 = Sunday
  time: string, // "09:00"
) {
  const [hour, minute] = time.split(":").map(Number);

  // ISO week → Monday
  const firstDayOfYear = new Date(year, 0, 1);
  const daysOffset = (week - 1) * 7;

  const monday = new Date(firstDayOfYear);
  monday.setDate(firstDayOfYear.getDate() + daysOffset);
  monday.setDate(monday.getDate() - monday.getDay() + 1);

  const result = new Date(monday);
  result.setDate(monday.getDate() + dayOfWeek);
  result.setHours(hour, minute, 0, 0);

  return result;
}
