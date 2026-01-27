"use client";

import { cn } from "@/lib/utils";

interface NavbarProps {
  onToggleSidebar?: () => void;
  title?: string;
}

export default function Navbar({ title }: NavbarProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-14 items-center justify-between border-b",
        " bg-sidebar px-4",
      )}
    >
      {/* Left */}
      <div className="flex items-center gap-3">
        <h3 className="text-sm font-semibold text-foreground">
          {title ?? "Dashboard"}
        </h3>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Slot: Dark mode / Notification / User menu */}
        <div className="h-8 w-8 rounded-full bg-muted" />
      </div>
    </header>
  );
}
