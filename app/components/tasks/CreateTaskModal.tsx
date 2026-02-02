"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { Label } from "@/app/components/ui/label";
import { Calendar } from "@/app/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";

/* ================= TYPES ================= */

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
};

type Category = {
  _id: string;
  name: string;
};

type FormState = {
  title: string;
  description: string;
  categoryId: string;
  status: "todo" | "in_progress" | "done";

  startDate?: Date;
  dueDate?: Date;

  estimatedMinutes: string;
  tags: string;

  energyLevel: number;
  focusLevel: number;
};

/* ================= COMPONENT ================= */

export default function CreateTaskModal({ open, onClose, onCreated }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);

  const [form, setForm] = useState<FormState>({
    title: "",
    description: "",
    categoryId: "",
    status: "todo",

    startDate: undefined,
    dueDate: undefined,

    estimatedMinutes: "",
    tags: "",

    energyLevel: 3,
    focusLevel: 3,
  });

  /* ========== Helpers ========== */

  const updateForm = <K extends keyof FormState>(
    key: K,
    value: FormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  /* ========== Fetch categories ========== */

  useEffect(() => {
    if (!open) return;

    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        setCategories(data ?? []);
      } catch {
        setCategories([]);
      }
    };

    fetchCategories();
  }, [open]);

  if (!open) return null;

  /* ========== Submit ========== */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.title || !form.categoryId) {
      setError("Title và Category là bắt buộc");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        title: form.title,
        description: form.description,
        categoryId: form.categoryId,
        status: form.status,

        startDate: form.startDate?.toISOString(),
        dueDate: form.dueDate?.toISOString(),

        estimatedMinutes: form.estimatedMinutes
          ? Number(form.estimatedMinutes)
          : undefined,

        tags: form.tags ? form.tags.split(",").map((t) => t.trim()) : [],

        energyLevel: form.energyLevel,
        focusLevel: form.focusLevel,
      };

      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message || "Create task failed");
        return;
      }

      onCreated?.();
      onClose();
    } catch {
      setError("Create task failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div
        className="relative w-full max-w-2xl bg-background rounded-lg shadow-lg p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-4">Create Task</h2>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 max-h-[70vh] overflow-y-auto px-2"
        >
          {/* Title */}
          <div>
            <Label>Title *</Label>
            <Input
              value={form.title}
              onChange={(e) => updateForm("title", e.target.value)}
            />
          </div>

          {/* Description */}
          <div>
            <Label>Description</Label>
            <Textarea
              rows={3}
              value={form.description}
              onChange={(e) => updateForm("description", e.target.value)}
            />
          </div>

          {/* Category + Status */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Category *</Label>
              <Select
                value={form.categoryId}
                onValueChange={(v) => updateForm("categoryId", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Categories</SelectLabel>
                    {categories.map((cat) => (
                      <SelectItem key={cat._id} value={cat._id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) =>
                  updateForm("status", v as FormState["status"])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">Todo</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <DatePicker
              label="Start Date"
              date={form.startDate}
              onChange={(d) => updateForm("startDate", d)}
            />
            <DatePicker
              label="Due Date"
              date={form.dueDate}
              onChange={(d) => updateForm("dueDate", d)}
            />
          </div>

          {/* Estimate */}
          <div>
            <Label>Estimated Minutes</Label>
            <Input
              type="number"
              value={form.estimatedMinutes}
              onChange={(e) => updateForm("estimatedMinutes", e.target.value)}
            />
          </div>

          {/* Tags */}
          <div>
            <Label>Tags</Label>
            <Input
              placeholder="work, study"
              value={form.tags}
              onChange={(e) => updateForm("tags", e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ================= DatePicker ================= */

function DatePicker({
  label,
  date,
  onChange,
}: {
  label: string;
  date?: Date;
  onChange: (date?: Date) => void;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "yyyy-MM-dd") : "Pick a date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={onChange}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
