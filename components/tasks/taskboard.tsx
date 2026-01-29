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
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Archive, GoalIcon, GripVertical, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyDemo } from "@/components/tasks/skeleton/EmptyTask";

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
    w-full            
    group relative
    rounded-sm border bg-card p-4 mt-10
    shadow-sm hover:shadow-md
    transition-shadow
    pointer-events-auto
  "
    >
      {/* Archive button – NOT draggable */}
      <div
        className="flex absolute top-2 right-2 z-10
        opacity-0 group-hover:opacity-100
        group-focus-within:opacity-100
        focus-visible:opacity-100
        transition-opacity
        text-xs rounded-full"
      >
        <Button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onArchive?.(task._id);
          }}
          variant={"ghost"}
          className="
        
        "
        >
          <Archive size={14} />
        </Button>
        <div {...listeners} className="cursor-grab active:cursor-grabbing">
          <Button variant={"outline"} type="button">
            <GripVertical />
          </Button>
        </div>
      </div>

      {/* Drag handle */}
      <div className=" py-1 flex gap-3 items-center">
        <h3 className="font-semibold ">{task.title}</h3>
        <div className="bg-primary/20 rounded-md px-4 py-0.5 text-sm text-primary text-center">
          <p>
            {task.categoryId?.icon}
            {task.categoryId?.name ?? "Uncategorized"}
          </p>
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
  const { setNodeRef, isOver } = useSortable({
    id: status,
    data: {
      type: "column",
    },
  });

  const taskIds = tasks.map((t) => t._id);

  return (
    <div
      ref={setNodeRef}
      className={`
        flex flex-col bg-background flex-1 min-w-[320px] h-130   
        rounded border p-4 transition-all
        ${isOver ? "bg-muted/50 border-primary ring-2 ring-primary/20" : ""}
      `}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-lg">{title}</h2>
        <span className="text-sm font-semibold">{tasks.length}</span>
      </div>
      {/* TASK LIST = DROP ZONE CHÍNH */}
      <div className="flex-1 overflow-y-auto scrollbar-primary pr-2">
        {" "}
        {/* 🔥 chiếm hết chiều cao còn lại */}
        <SortableContext
          id={status}
          items={taskIds}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex-1 overflow-y-auto">
            {tasks.map((task) => (
              <TaskCard key={task._id} task={task} onArchive={onArchive} />
            ))}
          </div>
        </SortableContext>
        {/* PLACEHOLDER khi kéo vào column */}
        {isOver && (
          <div className="absolute inset-x-4 top-16 h-6 rounded border border-dashed bg-muted/30 pointer-events-none" />
        )}
      </div>
      {/* EMPTY */}
      {tasks.length === 0 && (
        <div className="text-center bg-card h-full text-muted-foreground text-sm">
          <EmptyDemo />
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
    const overId = over.id as string;

    // Determine the new status - either the droppable column or the container of a sortable item
    let newValidStatus: Task["status"] | undefined;

    // Check if dropped directly on a column
    if (VALID_STATUSES.includes(overId as Task["status"])) {
      newValidStatus = overId as Task["status"];
    }
    // Check if dropped on another task (get its container)
    else {
      newValidStatus = over.data.current?.sortable?.containerId as
        | Task["status"]
        | undefined;
    }

    if (!newValidStatus || !VALID_STATUSES.includes(newValidStatus)) return;

    const task = tasks.find((t) => t._id === taskId);
    if (!task || task.status === newValidStatus) return;

    // optimistic update
    setTasks((prev) =>
      prev.map((t) =>
        t._id === taskId ? { ...t, status: newValidStatus } : t,
      ),
    );

    try {
      await onTaskUpdate?.(taskId, newValidStatus);
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
      <div className="flex gap-4 overflow-x-auto items-stretch">
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
          <div className="opacity-60 rotate-2 ">
            <TaskCard task={activeTask} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
