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
import { GoalIcon, Zap } from "lucide-react";

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

interface TaskCardProps {
  task: Task;
}

function TaskCard({ task }: TaskCardProps) {
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

  const getPriorityBars = (priority: "low" | "medium" | "high") => {
    const bars = {
      low: 1,
      medium: 2,
      high: 3,
    };

    const colors = {
      low: "bg-blue-500",
      medium: "bg-yellow-500",
      high: "bg-red-500",
    };
    return (
      <div className="flex gap-1 items-center">
        {[1, 2, 3].map((index) => (
          <div
            key={index}
            className={`w-1 h-4 rounded-full transition-all ${
              index <= bars[priority] ? colors[priority] : "bg-muted"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className=" rounded-sm border bg-card p-4 mb-3 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold  flex-1">{task.title}</h3>
        <div className="ml-2" title={`Priority: ${task.priority}`}>
          {getPriorityBars(task.priority)}
        </div>
      </div>

      {task.description && (
        <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
      )}

      <div className="flex flex-wrap gap-2 items-center">
        {task.categoryId && (
          <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">
            {task.categoryId.name}
          </span>
        )}

        {task.tags && task.tags.length > 0 && (
          <>
            {task.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-muted border text-muted-foreground rounded text-xs"
              >
                #{tag}
              </span>
            ))}
          </>
        )}
      </div>

      {(task.energyLevel !== undefined || task.focusLevel !== undefined) && (
        <div className="mt-3 pt-3 border-t flex justify-between items-center gap-4 text-xs text-muted-foreground">
          {task.dueDate && (
            <span className="text-xs text-accent-foreground">
              Due: {new Date(task.dueDate).toLocaleDateString()}
            </span>
          )}
          <div className="flex gap-2">
            {task.energyLevel !== undefined && (
              <div className="flex items-center gap-1">
                <span>
                  <Zap color="yellow" />
                </span>
                <span>{task.energyLevel}/5</span>
              </div>
            )}
            {task.focusLevel !== undefined && (
              <div className="flex items-center gap-1">
                <span>
                  <GoalIcon color="red" />
                </span>
                <span>{task.focusLevel}/5</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface TaskColumnProps {
  status: "todo" | "in-progress" | "done";
  title: string;
  tasks: Task[];
}

function TaskColumn({ title, tasks }: TaskColumnProps) {
  const taskIds = tasks.map((task) => task._id);

  return (
    <div className={`flex-1 min-w-[320px] bg-background rounded border p-4`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-lg ">{title}</h2>
        <span className=" px-2 py-1 rounded-full text-sm font-semibold ">
          {tasks.length}
        </span>
      </div>

      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {tasks.map((task) => (
            <TaskCard key={task._id} task={task} />
          ))}
        </div>
      </SortableContext>

      {tasks.length === 0 && (
        <div className="text-center py-8 text-muted-foreground text-sm">
          No tasks yet
        </div>
      )}
    </div>
  );
}

interface TaskBoardProps {
  initialTasks: Task[];
  onTaskUpdate?: (taskId: string, newStatus: Task["status"]) => Promise<void>;
}

export default function TaskBoard({
  initialTasks,
  onTaskUpdate,
}: TaskBoardProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t._id === active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as Task["status"];

    const task = tasks.find((t) => t._id === taskId);
    if (!task || task.status === newStatus) return;

    // Optimistic update
    setTasks((prevTasks) =>
      prevTasks.map((t) =>
        t._id === taskId ? { ...t, status: newStatus } : t,
      ),
    );

    // Call the API to update the task
    if (onTaskUpdate) {
      try {
        await onTaskUpdate(taskId, newStatus);
      } catch (error) {
        // Revert on error
        setTasks((prevTasks) =>
          prevTasks.map((t) =>
            t._id === taskId ? { ...t, status: task.status } : t,
          ),
        );
        console.error("Failed to update task:", error);
      }
    }
  };

  const todoTasks = tasks.filter((task) => task.status === "todo");
  const inProgressTasks = tasks.filter((task) => task.status === "in-progress");
  const doneTasks = tasks.filter((task) => task.status === "done");

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex  gap-6 overflow-x-auto pb-4">
        <SortableContext
          items={["todo", "in-progress", "done"]}
          strategy={verticalListSortingStrategy}
        >
          <TaskColumn status="todo" title="To Do" tasks={todoTasks} />
          <TaskColumn
            status="in-progress"
            title="In Progress"
            tasks={inProgressTasks}
          />
          <TaskColumn status="done" title="Done" tasks={doneTasks} />
        </SortableContext>
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="opacity-90 rotate-3 scale-105">
            <TaskCard task={activeTask} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
