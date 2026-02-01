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

    lastPriorityCalcAt: {
      type: Date,
    },
    // Time management
    startDate: {
      type: Date,
    },
    startTime: {
      type: Date,
      required: true,
      index: true,
    },

    endTime: {
      type: Date,
      required: true,
      index: true,
    },
    week: {
      type: Number, // ISO week 1–53
      required: true,
      index: true,
    },

    year: {
      type: Number,
      required: true,
      index: true,
    },

    dayOfWeek: {
      type: Number, // 1 (Mon) → 7 (Sun)
      required: true,
      index: true,
    },
    hasConflict: {
      type: Boolean,
      default: false,
      index: true,
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

TaskSchema.pre("validate", function () {
  if (this.startTime >= this.endTime) {
    throw new Error("startTime must be before endTime");
  }
});

TaskSchema.pre("save", async function () {
  if (!this.isModified("startTime") && !this.isModified("endTime")) return;

  const conflicts = await model("Task").find({
    _id: { $ne: this._id },
    userId: this.userId,
    week: this.week,
    year: this.year,
    dayOfWeek: this.dayOfWeek,
    isDeleted: false,
    startTime: { $lt: this.endTime },
    endTime: { $gt: this.startTime },
  });

  this.hasConflict = conflicts.length > 0;
});

const Task = models.Task || model("Task", TaskSchema);

export default Task;
