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

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
};

type Category = {
  _id: string;
  name: string;
};

export default function CreateTaskModal({ open, onClose, onCreated }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    categoryId: "",
    status: "todo",
    startDate: undefined as Date | undefined,
    dueDate: undefined as Date | undefined,
    estimatedMinutes: "",
    tags: "",
    energyLevel: 3,
    focusLevel: 3,
  });

  useEffect(() => {
    if (!open) return;

    const fetchCategories = async () => {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data);
    };

    fetchCategories();
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.title || !form.categoryId) {
      setError("Title và Category là bắt buộc");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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
        }),
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
          className="space-y-4 max-h-[70vh] overflow-y-auto px-4 pb-4"
        >
          {/* Title */}
          <div>
            <Label>Title *</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          {/* Description */}
          <div>
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={3}
            />
          </div>

          {/* Status + Priority */}
          <div className="grid grid-cols-3 gap-4">
            {/* Category */}
            <div>
              <Label>Category *</Label>

              <Select
                value={form.categoryId}
                onValueChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    categoryId: value,
                  }))
                }
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
                onValueChange={(value) => setForm({ ...form, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Status</SelectLabel>
                    <SelectItem value="todo">Todo</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <DatePicker
              label="Start Date"
              date={form.startDate}
              onChange={(date) => setForm({ ...form, startDate: date })}
            />
            <DatePicker
              label="Due Date"
              date={form.dueDate}
              onChange={(date) => setForm({ ...form, dueDate: date })}
            />
          </div>

          {/* Estimate */}
          <div>
            <Label>Estimated Minutes</Label>
            <Input
              type="number"
              value={form.estimatedMinutes}
              onChange={(e) =>
                setForm({ ...form, estimatedMinutes: e.target.value })
              }
            />
          </div>

          {/* Tags */}
          <div>
            <Label>Tags</Label>
            <Input
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="work, study"
            />
          </div>

          {/* Error */}
          {error && <p className="text-sm text-red-500">{error}</p>}

          {/* Actions */}
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

/* ---------------- DatePicker Reusable ---------------- */

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
