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

    // Core info
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    // Status flow
    status: {
      type: String,
      enum: ["todo", "in_progress", "done", "archived"],
      default: "todo",
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
      type: Number, // dự đoán thời gian làm
    },

    actualMinutes: {
      type: Number, // dùng cho analytics sau này
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
  }
});

export const Task = models.Task || model("Task", TaskSchema);
