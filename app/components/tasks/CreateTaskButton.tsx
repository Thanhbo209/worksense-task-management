"use client";
import CreateTaskModal from "@/app/components/tasks/CreateTaskModal";
import { Button } from "@/app/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";

const CreateTaskButton = () => {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <Button onClick={() => setOpen(true)}>
        <Plus />
        Add New Task
      </Button>

      <CreateTaskModal
        open={open}
        onClose={() => setOpen(false)}
        onCreated={() => {
          // refetch task list ở đây
        }}
      />
    </div>
  );
};

export default CreateTaskButton;
