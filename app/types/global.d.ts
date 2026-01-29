import type mongoose from "mongoose";

declare global {
  var mongoose:
    | {
        conn: mongoose.Connection | null;
        promise: Promise<mongoose.Connection> | null;
      }
    | undefined;

  type TaskStatus = "todo" | "in_progress" | "done" | "archived";

  interface Task {
    _id: string;
    title: string;
    description?: string;
    status: TaskStatus;
    priority: "low" | "medium" | "high";
    categoryId?: {
      _id: string;
      name: string;
      icon: string;
    };
    dueDate?: string;
    tags?: string[];
    energyLevel?: number;
    focusLevel?: number;
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
