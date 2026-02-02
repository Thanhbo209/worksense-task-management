"use client";

import { useEffect, useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Trash2 } from "lucide-react";

export default function ArchivedTasksPage() {
  const [tasks, setTasks] = useState<ArchivedTaskProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/tasks?status=archived");
        if (!res.ok) throw new Error("Failed to load archived tasks");
        const data = await res.json();
        if (!cancelled) setTasks(data);
      } catch (err) {
        if (!cancelled) setError("Failed to load archived tasks");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleDelete = async (taskId: string) => {
    const confirmed = confirm("Delete this task permanently?");
    if (!confirmed) return;

    const res = await fetch(`/api/tasks/${taskId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      setError("Failed to delete task. Please try again.");
      return;
    }
    setTasks((prev) => prev.filter((t) => t._id !== taskId));
  };
  if (error) {
    return <p className="text-destructive text-sm">{error}</p>;
  }
  if (loading) return <p>Loading...</p>;

  if (tasks.length === 0) {
    return <p className="text-muted-foreground text-sm">No archived tasks</p>;
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <div
          key={task._id}
          className="bg-background rounded p-4 flex justify-between items-start"
        >
          <div>
            <h3 className="font-semibold">{task.title}</h3>
            {task.description && (
              <p className="text-sm text-muted-foreground">
                {task.description}
              </p>
            )}
          </div>

          <Button
            variant="destructive"
            size="icon"
            onClick={() => handleDelete(task._id)}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      ))}
    </div>
  );
}
