import { Skeleton } from "@/components/ui/skeleton";

export default function TaskColumnSkeleton() {
  return (
    <div className="flex-1 min-w-[320px] rounded border p-4 bg-background">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-5 w-8" />
      </div>

      {/* Task skeletons */}
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-md" />
        ))}
      </div>
    </div>
  );
}
