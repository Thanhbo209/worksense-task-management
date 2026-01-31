export type PriorityLevel = "low" | "medium" | "high" | "urgent";

export function scoreToPriority(score: number): PriorityLevel {
  if (score >= 45) return "urgent";
  if (score >= 30) return "high";
  if (score >= 15) return "medium";
  return "low";
}
