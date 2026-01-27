import CreateTaskButton from "@/components/tasks/CreateTaskButton";
import TasksPage from "@/components/tasks/tasksection";
import { Button } from "@/components/ui/button";
import { Archive } from "lucide-react";

const page = () => {
  return (
    <section className="mt-6">
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-2">
          <h1>Your Tasks</h1>
          <p className="text-muted-foreground">
            Drag and drop tasks to update their status
          </p>
        </div>
        <div className="flex gap-2">
          <CreateTaskButton />
          <Button variant={"secondary"}>
            <Archive />
          </Button>
        </div>
      </div>
      <TasksPage />
    </section>
  );
};

export default page;
