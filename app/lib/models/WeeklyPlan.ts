import { Schema, model, models, Types } from "mongoose";

const WeeklyPlanSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    year: {
      type: Number,
      required: true,
      index: true,
    },

    week: {
      type: Number, // ISO week 1–53
      required: true,
      index: true,
    },

    tasks: [
      {
        type: Types.ObjectId,
        ref: "Task",
      },
    ],
    locked: {
      type: Boolean,
      default: false,
    },

    targetTasks: {
      type: Number,
      default: 0,
    },

    completedTasks: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String, // optional: ghi chú tuần
    },
  },
  { timestamps: true },
);

// 1 user chỉ có 1 weekly plan cho 1 tuần
WeeklyPlanSchema.index({ userId: 1, year: 1, week: 1 }, { unique: true });

const WeeklyPlan = models.WeeklyPlan || model("WeeklyPlan", WeeklyPlanSchema);

export default WeeklyPlan;
