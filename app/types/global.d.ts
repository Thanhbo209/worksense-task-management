import type mongoose from "mongoose";

declare global {
  var mongoose:
    | {
        conn: mongoose.Connection | null;
        promise: Promise<mongoose.Connection> | null;
      }
    | undefined;

  type TaskStatus = "todo" | "in_progress" | "done" | "archived";

  export interface Task {
    _id: string;

    // Owner & scope
    userId: string;
    week: number;
    year: number;

    // Core
    title: string;
    description?: string;
    status: TaskStatus;

    priority: "low" | "medium" | "high" | "urgent";
    priorityScore?: number;

    // Time
    startTime: string;
    endTime: string;
    dayOfWeek: number; // 1–7
    dueDate?: string;

    // Planner
    hasConflict: boolean;
    estimatedMinutes?: number;
    actualMinutes?: number;

    // Organization
    tags?: string[];

    categoryId:
      | string
      | {
          _id: string;
          name: string;
          icon?: string;
        };

    // Insight
    energyLevel?: number;
    focusLevel?: number;

    // Meta
    isDeleted?: boolean;
    completedAt?: string;
    createdAt?: string;
    updatedAt?: string;
  }

  interface TaskColumnProps {
    status: Task["status"];
    title: string;
    tasks: Task[];
    onArchive?: (taskId: string) => void;
  }

  interface TaskCardProps {
    task: Task;
    onArchive?: (taskId: string) => void;
  }

  interface TaskBoardProps {
    initialTasks: Task[];
    onTaskUpdate?: (taskId: string, newStatus: Task["status"]) => Promise<void>;
  }

  interface ArchivedTaskProps {
    _id: string;
    title: string;
    description?: string;
  }
}

export {};
