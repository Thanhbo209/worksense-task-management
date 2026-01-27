import type mongoose from "mongoose";

declare global {
  var mongoose:
    | {
        conn: mongoose.Connection | null;
        promise: Promise<mongoose.Connection> | null;
      }
    | undefined;

  interface Task {
    _id: string;
    title: string;
    description?: string;
    status: "todo" | "in-progress" | "done";
    priority: "low" | "medium" | "high";
    categoryId?: {
      _id: string;
      name: string;
    };
    dueDate?: string;
    tags?: string[];
    energyLevel?: number;
    focusLevel?: number;
  }
}

export {};
