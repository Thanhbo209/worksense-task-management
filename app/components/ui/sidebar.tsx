"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/app/lib/utils";
import {
  LayoutDashboard,
  CheckSquare,
  Tags,
  Settings,
  LogOut,
  PanelsTopLeft,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/dashboard/categories", label: "Categories", icon: Tags },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
      });
      if (res.ok) {
        // Handle successful logout
        window.location.href = "/login";
      } else {
        // Handle error
        const data = await res.json().catch(() => ({}));
        alert(data.message || "Logout failed");
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  return (
    <aside
      className={cn(
        "relative h-screen border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Toggle button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute right-4.5 top-6 z-10 flex h-7 w-7 items-center justify-center rounded-md hover:bg-muted bg-sidebar shadow"
      >
        <PanelsTopLeft className="h-4 w-4" />
      </button>

      {/* Nav */}
      <nav className="flex flex-col gap-3 pt-10 p-3">
        {/* Logo */}
        <div className="mb-6 flex items-center gap-2 text-lg font-semibold">
          {!collapsed && <span>Task Manager</span>}
        </div>

        {navItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded px-2.5 py-2 text-sm transition-colors",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "hover:bg-sidebar-accent hover:text-sidebar-primary",
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5",
                  active
                    ? "text-sidebar-primary-foreground"
                    : "text-muted-foreground ",
                )}
              />

              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <Button
          aria-label="Logout"
          variant={"outline"}
          onClick={handleLogout}
          className="flex w-full justify-center"
        >
          <div className="flex items-center gap-2">
            {!collapsed ? <span>Logout</span> : <LogOut className="h-4 w-4" />}
          </div>
        </Button>
      </div>
    </aside>
  );
}
