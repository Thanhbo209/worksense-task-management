"use client";

import { cn } from "@/lib/utils";
import { GithubIcon } from "lucide-react";
import Link from "next/link";

interface NavbarProps {
  onToggleSidebar?: () => void;
  title?: string;
}

export default function Navbar({ title }: NavbarProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 items-center justify-between border-b",
        " bg-sidebar px-4",
      )}
    >
      {/* Left */}
      <div className="flex items-center gap-3">
        <Link
          href={"https://github.com/Thanhbo209/worksense-task-management"}
          target="_blank"
          className="bg-card p-1.5 rounded-full mt-auto hover:bg-primary"
        >
          {" "}
          <GithubIcon size={24} />
        </Link>
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
