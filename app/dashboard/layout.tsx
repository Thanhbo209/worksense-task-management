import Sidebar from "@/app/components/ui/sidebar";
import Navbar from "@/app/components/ui/navbar";
import Breadcrumbs from "@/app/components/ui/breadcrumbs";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <div className="flex flex-1 flex-col">
        <Navbar title="WorkSense" />

        <main className="flex-1 overflow-y-auto p-6">
          <Breadcrumbs />
          {children}
        </main>
      </div>
    </div>
  );
}
