"use client";

import { useEffect, useState } from "react";
import TaskBoard from "@/components/tasks/taskboard";
import TaskBoardSkeleton from "@/components/tasks/skeleton/TaskBoardSkeleton";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks");
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskUpdate = async (
    taskId: string,
    newStatus: Task["status"],
  ) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const updatedTask = await res.json();

      setTasks((prev) =>
        prev.map((t) => (t._id === updatedTask._id ? updatedTask : t)),
      );
    } catch (err) {
      console.error("Update task failed:", err);
    }
  };

  return (
    <div className="p-8 rounded-sm">
      <div className="w-full mx-auto">
        {loading ? (
          <TaskBoardSkeleton />
        ) : (
          <TaskBoard initialTasks={tasks} onTaskUpdate={handleTaskUpdate} />
        )}
      </div>
    </div>
  );
}
