"use client";

import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Archive, GoalIcon, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

/* =======================
   Task Card
======================= */

function TaskCard({ task, onArchive }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="
        group relative
        rounded-sm border bg-card p-4
        shadow-sm hover:shadow-md
        transition-shadow
      "
    >
      {/* Archive button – NOT draggable */}
      <Button
        type="button"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          onArchive?.(task._id);
        }}
        variant={"ghost"}
        className="
          absolute top-2 right-2 z-10
          opacity-0 group-hover:opacity-100
          group-focus-within:opacity-100
          focus-visible:opacity-100
          transition-opacity
          text-xs rounded-full
        "
      >
        <Archive size={14} />
      </Button>

      {/* Drag handle */}
      <div
        {...listeners}
        className="cursor-grab active:cursor-grabbing py-1 flex gap-3 items-center"
      >
        <h3 className="font-semibold ">{task.title}</h3>
        <div className="bg-primary/20 rounded-md px-4 py-0.5 text-sm text-primary text-center">
          {task.categoryId?.name ?? "Uncategorized"}
        </div>
      </div>

      {task.description && (
        <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
      )}

      <div className="flex flex-wrap gap-2 text-xs">
        {task.tags?.map((tag, idx) => (
          <span
            key={idx}
            className="px-2 py-1 bg-muted border rounded text-muted-foreground"
          >
            #{tag}
          </span>
        ))}
      </div>

      {(task.energyLevel !== undefined || task.focusLevel !== undefined) && (
        <div className="mt-3 pt-3 gap-2 border-t flex justify-between text-xs text-muted-foreground">
          <div className="">{task.dueDate}</div>
          <div className="flex gap-2">
            {task.energyLevel !== undefined && (
              <p className="flex items-center gap-1">
                <Zap size={20} color="yellow" /> {task.energyLevel}/5
              </p>
            )}
            {task.focusLevel !== undefined && (
              <p className="flex items-center gap-1">
                <GoalIcon size={20} color="red" /> {task.focusLevel}/5
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* =======================
   Task Column
======================= */

function TaskColumn({ status, title, tasks, onArchive }: TaskColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  const taskIds = tasks.map((t) => t._id);

  return (
    <div
      ref={setNodeRef}
      className={`
        flex-1 min-w-[320px] rounded border p-4
        transition-all duration-200
        ${isOver ? "bg-muted/50 border-primary shadow-md" : "bg-background"}
      `}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-lg">{title}</h2>
        <span className="text-sm font-semibold">{tasks.length}</span>
      </div>

      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {tasks.map((task) => (
            <TaskCard key={task._id} task={task} onArchive={onArchive} />
          ))}
        </div>
      </SortableContext>

      {tasks.length === 0 && (
        <div className="text-center py-8 text-muted-foreground text-sm">
          Drop task here
        </div>
      )}
    </div>
  );
}

/* =======================
   Task Board
======================= */

const VALID_STATUSES: Task["status"][] = [
  "todo",
  "in_progress",
  "done",
  "archived",
];

export default function TaskBoard({
  initialTasks,
  onTaskUpdate,
}: TaskBoardProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const handleArchive = async (taskId: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "archived" }),
      });

      if (!res.ok) {
        throw new Error("Failed to archive task");
      }

      // Update local state
      setTasks((prev) =>
        prev.map((task) =>
          task._id === taskId ? { ...task, status: "archived" } : task,
        ),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t._id === event.active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as Task["status"];

    const overId = over.id as string;
    const newValidStatus = VALID_STATUSES.includes(overId as Task["status"])
      ? (overId as Task["status"])
      : (over.data.current?.sortable?.containerId as
          | Task["status"]
          | undefined);
    if (!newValidStatus || !VALID_STATUSES.includes(newValidStatus)) return;

    const task = tasks.find((t) => t._id === taskId);
    if (!task || task.status === newStatus) return;

    // optimistic update
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t)),
    );

    try {
      await onTaskUpdate?.(taskId, newStatus);
    } catch (err) {
      // rollback
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, status: task.status } : t)),
      );
      console.error(err);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-6 overflow-x-auto pb-4">
        <TaskColumn
          status="todo"
          title="To Do"
          tasks={tasks.filter((t) => t.status === "todo")}
          onArchive={handleArchive}
        />
        <TaskColumn
          status="in_progress"
          title="In Progress"
          tasks={tasks.filter((t) => t.status === "in_progress")}
          onArchive={handleArchive}
        />
        <TaskColumn
          status="done"
          title="Done"
          tasks={tasks.filter((t) => t.status === "done")}
          onArchive={handleArchive}
        />
      </div>

      <DragOverlay>
        {activeTask && (
          <div className="opacity-90 rotate-3 scale-105">
            <TaskCard task={activeTask} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
