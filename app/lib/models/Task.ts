import { Schema, model, models, Types } from "mongoose";

const TaskSchema = new Schema(
  {
    // Owner
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: ["todo", "in_progress", "done", "archived"],
      default: "todo",
      index: true,
    },

    priorityScore: {
      type: Number,
      default: 0,
      index: true,
    },
    // Priority (manual + computed later)
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },

    // Time management
    startDate: {
      type: Date,
    },

    dueDate: {
      type: Date,
      index: true,
    },

    estimatedMinutes: {
      type: Number,
      min: 0,
    },

    actualMinutes: {
      type: Number, // dùng cho analytics sau này
      min: 0,
    },

    // Planning & organization
    tags: {
      type: [String],
      index: true,
    },

    categoryId: {
      type: Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    // Productivity insight
    energyLevel: { type: Number, min: 1, max: 5 },
    focusLevel: { type: Number, min: 1, max: 5 },
    // Soft delete
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    completedAt: Date,
  },
  {
    timestamps: true, // createdAt, updatedAt
  },
);

TaskSchema.pre("save", async function () {
  if (this.isModified("status") && this.status === "done") {
    this.completedAt = new Date();
  } else if (this.isModified("status") && this.status !== "done") {
    this.completedAt = undefined;
  }
});

const Task = models.Task || model("Task", TaskSchema);

export default Task;
