"use client";

import { useEffect, useState } from "react";
import TaskBoard from "@/components/tasks/taskboard";

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

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch("/api/tasks");
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskUpdate = async (
    taskId: string,
    newStatus: Task["status"],
  ) => {
    const response = await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: newStatus }),
    });

    if (!response.ok) {
      throw new Error("Failed to update task");
    }

    // Update local state
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task._id === taskId ? { ...task, status: newStatus } : task,
      ),
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 rounded-sm">
      <div className="w-full mx-auto">
        <TaskBoard initialTasks={tasks} onTaskUpdate={handleTaskUpdate} />
      </div>
    </div>
  );
}
