"use client";

import { useEffect, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";

// ============================================================================
// TYPES
// ============================================================================

interface Task {
  _id: string;
  title: string;
  status: string;
  priority: "low" | "medium" | "high" | "urgent";
}

interface WeeklyPlan {
  _id: string;
  week: number;
  year: number;
  tasks: Task[];
  targetTasks: number;
  completedTasks: number;
  autoScore?: number;
  locked: boolean;
}

// ============================================================================
// UTILITIES
// ============================================================================

const getWeekNumber = (date: Date): number => {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
};

const formatWeekRange = (week: number, year: number): string => {
  const jan4 = new Date(year, 0, 4);
  const weekStart = new Date(jan4.getTime() + (week - 1) * 7 * 86400000);
  weekStart.setDate(weekStart.getDate() - (weekStart.getDay() || 7) + 1);
  const weekEnd = new Date(weekStart.getTime() + 6 * 86400000);

  const formatDate = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return `${formatDate(weekStart)} - ${formatDate(weekEnd)}`;
};

const normalizeWeeklyPlan = (plan: WeeklyPlan): WeeklyPlan => {
  return {
    ...plan,
    tasks: Array.isArray(plan.tasks) ? plan.tasks : [],
    completedTasks: Number(plan.completedTasks) || 0,
    targetTasks: Number(plan.targetTasks) || 0,
    autoScore:
      plan.autoScore === undefined ? undefined : Number(plan.autoScore),
  };
};

// ============================================================================
// API HOOKS
// ============================================================================

const useWeeklyPlan = (week: number, year: number) => {
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchWeeklyPlan = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/weekly-plan?week=${week}&year=${year}`);
      const data = await res.json();

      if (!data) {
        setWeeklyPlan(null);
        return;
      }

      setWeeklyPlan(normalizeWeeklyPlan(data));
    } catch (error) {
      console.error("Failed to fetch weekly plan:", error);
    } finally {
      setLoading(false);
    }
  };

  const closeWeek = async () => {
    if (!weeklyPlan) return;
    const res = await fetch(`/api/weekly-plan/${weeklyPlan._id}/close`, {
      method: "POST",
    });
    if (!res.ok) {
      console.error("Failed to close week");
      return;
    }
    await fetchWeeklyPlan();
  };

  const addTask = async (taskId: string) => {
    if (!weeklyPlan || weeklyPlan.locked) return;
    const res = await fetch(`/api/weekly-plan/${weeklyPlan._id}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId }),
    });
    if (!res.ok) {
      console.error("Failed to add task to weekly plan");
      return;
    }
    await fetchWeeklyPlan();
  };

  return { weeklyPlan, loading, fetchWeeklyPlan, closeWeek, addTask };
};

const useBacklog = () => {
  const [backlog, setBacklog] = useState<Task[]>([]);

  const fetchBacklog = async () => {
    try {
      const res = await fetch(`/api/tasks?status=todo`);
      const data = await res.json();
      setBacklog(data);
    } catch (error) {
      console.error("Failed to fetch backlog:", error);
    }
  };

  return { backlog, fetchBacklog };
};

// ============================================================================
// COMPONENTS
// ============================================================================

const DraggableTask = ({ task }: { task: Task }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task._id,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`
        group relative p-3 rounded border  bg-background
        transition-all duration-200 cursor-grab active:cursor-grabbing hover:-translate-y-0.5
        ${isDragging ? "opacity-50 shadow-lg scale-105" : ""}
      `}
    >
      <div className="flex items-start gap-3">
        <div className=" mt-1">
          <svg
            className="w-4 h-4 group-hover:text-destructive"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 8h16M4 16h16"
            />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium ">{task.title}</p>
          {task.priority && task.priority !== "low" && (
            <div className="flex items-center gap-1 mt-1">
              {Array.from({
                length: { medium: 1, high: 2, urgent: 3 }[task.priority] || 0,
              }).map((_, i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-orange-500"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DroppableArea = ({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`
        min-h-100 p-4  rounded-xl border-2 border-dashed transition-all
        ${isOver ? "border-primary bg-card/50" : "border-border bg-card"}
      `}
    >
      {children}
    </div>
  );
};

const ProgressCard = ({ weeklyPlan }: { weeklyPlan: WeeklyPlan }) => {
  const planned = weeklyPlan.tasks.length;
  const completed = weeklyPlan.completedTasks;
  const remaining = Math.max(planned - completed, 0);

  const completionRate =
    weeklyPlan.targetTasks > 0
      ? Math.round((completed / weeklyPlan.targetTasks) * 100)
      : 0;

  return (
    <div className="bg-card rounded-2xl p-6 shadow-sm border">
      <div className="flex justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Progress</h3>
          <p className="text-sm text-muted-foreground">
            {completed} / {weeklyPlan.targetTasks}
          </p>
        </div>
        <div className="text-3xl font-bold text-primary">{completionRate}%</div>
      </div>

      <div className="grid grid-cols-3 gap-4 pt-6 border-t">
        <Stat label="Planned" value={planned} />
        <Stat label="Completed" value={completed} />
        <Stat label="Remaining" value={remaining} />
      </div>
    </div>
  );
};

const Stat = ({ label, value }: { label: string; value: number }) => (
  <div className="text-center bg-primary/10 rounded py-2">
    <p className="text-2xl font-bold text-primary ">{value}</p>
    <p className="text-xs text-muted-foreground mt-1">{label}</p>
  </div>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function WeeklyPlannerPage() {
  const today = new Date();
  const week = getWeekNumber(today);
  const year = today.getFullYear();

  const { weeklyPlan, loading, fetchWeeklyPlan, closeWeek, addTask } =
    useWeeklyPlan(week, year);
  const { backlog, fetchBacklog } = useBacklog();

  useEffect(() => {
    fetchWeeklyPlan();
    fetchBacklog();
  }, []);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || over.id !== "weekly-plan") return;

    const taskId = active.id as string;
    await addTask(taskId);
    await fetchBacklog();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center ">
        <div className="text-center">
          <div className="w-16 h-16 border-4  rounded-full animate-spin mx-auto" />
          <p className="mt-4">Loading your weekly plan...</p>
        </div>
      </div>
    );
  }

  if (!weeklyPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="">No weekly plan found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-bold">Week {week}</h1>
              {weeklyPlan.locked && (
                <span className="px-3 py-1 text-sm font-medium  rounded-full flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  Locked
                </span>
              )}
            </div>
            <p className="text-muted-foreground mt-1">
              {formatWeekRange(week, year)}, {year}
            </p>
          </div>

          {!weeklyPlan.locked && (
            <button
              onClick={closeWeek}
              className="px-6 py-2 bg-primary rounded font-medium hover:bg-secondary transition-all hover:shadow-lg active:scale-95 flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Close Week
            </button>
          )}
        </div>

        {/* Progress Card */}
        <ProgressCard weeklyPlan={weeklyPlan} />

        {/* Drag and Drop Area */}
        <DndContext onDragEnd={handleDragEnd}>
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Weekly Plan */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold  flex items-center gap-2">
                  <svg
                    className="w-9 h-9 p-2 text-primary bg-primary/20 rounded-full"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  Weekly Plan
                </h2>
                <span className="text-sm font-medium">
                  {weeklyPlan.tasks.length} tasks
                </span>
              </div>

              <DroppableArea id="weekly-plan">
                <div className="space-y-3">
                  {weeklyPlan.tasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <svg
                        className="w-16 h-16  mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <p className="text-muted-foreground font-medium">
                        No tasks planned yet
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Drag tasks from backlog to start planning
                      </p>
                    </div>
                  ) : (
                    weeklyPlan.tasks.map((task) => (
                      <div
                        key={task._id}
                        className="p-3 rounded border border-border bg-background shadow-sm"
                      >
                        <p className="text-sm font-medium ">{task.title}</p>
                      </div>
                    ))
                  )}
                </div>
              </DroppableArea>
            </div>

            {/* Backlog */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold  flex items-center gap-2">
                  <svg
                    className="w-9 h-9 p-2 text-primary bg-primary/20 rounded-full"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 10h16M4 14h16M4 18h16"
                    />
                  </svg>
                  Backlog
                </h2>
                <span className="text-sm font-medium text-muted-foreground">
                  {backlog.length} tasks
                </span>
              </div>

              <div className="bg-card rounded-xl p-4 shadow-sm border border-border min-h-100">
                <div className="space-y-3">
                  {backlog.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <svg
                        className="w-16 h-16  mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p className="text-muted-foreground font-medium">
                        All tasks planned!
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Your backlog is empty
                      </p>
                    </div>
                  ) : (
                    backlog.map((task) => (
                      <DraggableTask key={task._id} task={task} />
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </DndContext>
      </div>
    </div>
  );
}
