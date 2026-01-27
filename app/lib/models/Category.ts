// models/Category.ts
import { Schema, model, models, Types } from "mongoose";

const CategorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    key: {
      type: String, // work, study, personal
      required: true,
      unique: true,
      lowercase: true,
    },

    icon: {
      type: String, // lucide icon name
    },

    color: {
      type: String, // hex hoặc tailwind class
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    createdBy: {
      type: Types.ObjectId,
      ref: "User", // admin
    },
  },
  { timestamps: true },
);

export const Category = models.Category || model("Category", CategorySchema);
