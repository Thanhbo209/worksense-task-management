"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface ArchivedTaskProps {
  _id: string;
  title: string;
  description?: string;
}

export default function ArchivedTasksPage() {
  const [tasks, setTasks] = useState<ArchivedTaskProps[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/tasks?status=archived")
      .then((res) => res.json())
      .then((data) => {
        setTasks(data);
        setLoading(false);
      });
  }, []);

  const handleDelete = async (taskId: string) => {
    const confirmed = confirm("Delete this task permanently?");
    if (!confirmed) return;

    await fetch(`/api/tasks/${taskId}`, {
      method: "DELETE",
    });

    setTasks((prev) => prev.filter((t) => t._id !== taskId));
  };

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
