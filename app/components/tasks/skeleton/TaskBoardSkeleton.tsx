import TaskColumnSkeleton from "./TaskColumnSkeleton";

export default function TaskBoardSkeleton() {
  return (
    <div className="flex gap-6 overflow-x-auto pb-4">
      <TaskColumnSkeleton />
      <TaskColumnSkeleton />
      <TaskColumnSkeleton />
    </div>
  );
}
