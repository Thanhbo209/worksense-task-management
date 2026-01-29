"use client";

import { useEffect, useState } from "react";
import TaskBoard from "@/components/tasks/taskboard";

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
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(err?.message || "Failed to update task");
      }

      const updatedTask = await response.json();

      setTasks((prev) =>
        prev.map((task) => (task._id === updatedTask._id ? updatedTask : task)),
      );
    } catch (error) {
      console.error("Update task failed:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className=" p-8 rounded-sm">
      <div className="w-full mx-auto">
        <TaskBoard initialTasks={tasks} onTaskUpdate={handleTaskUpdate} />
      </div>
    </div>
  );
}
