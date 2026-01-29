import ArchivedTasksPage from "@/app/dashboard/tasks/ArchivedTasksPage";

export default function ArchivedPage() {
  return (
    <section className="mt-6">
      <div className="mb-6">
        <h1>Archived Tasks</h1>
        <p className="text-muted-foreground">
          Tasks you have archived. You can permanently delete them here.
        </p>
      </div>

      <ArchivedTasksPage />
    </section>
  );
}
