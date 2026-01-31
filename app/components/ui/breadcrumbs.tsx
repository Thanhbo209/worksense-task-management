"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { cn } from "@/app/lib/utils";

export default function Breadcrumbs() {
  const pathname = usePathname();

  const segments = pathname.split("/").filter(Boolean); // bỏ chuỗi rỗng

  const crumbs = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");

    const label = segment
      .replace(/-/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());

    return { href, label };
  });

  return (
    <nav className="flex items-center text-sm  text-muted-foreground">
      <Link href="/" className="hover:text-foreground">
        Home
      </Link>

      {crumbs.map((crumb, index) => (
        <span key={crumb.href} className="flex items-center">
          <ChevronRight className="mx-1 h-4 w-4" />
          {index === crumbs.length - 1 ? (
            <span className="text-foreground font-medium">{crumb.label}</span>
          ) : (
            <Link href={crumb.href} className="hover:text-foreground">
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
