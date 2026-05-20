"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clock, FolderOpen, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Dashboard", icon: Clock },
  { href: "/projects", label: "Projects", icon: FolderOpen },
  { href: "/reports", label: "Reports", icon: BarChart3 },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto max-w-6xl px-4 flex items-center justify-between h-14">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-semibold text-lg tracking-tight">
            TimeTracker
          </Link>
          <nav className="flex items-center gap-1">
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors",
                  pathname === href
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <EmailSetter />
      </div>
    </header>
  );
}

function EmailSetter() {
  return (
    <div className="flex items-center gap-2">
      <input
        type="email"
        placeholder="your@email.com"
        className="h-8 w-52 rounded-md border border-input bg-background px-2 text-sm"
        defaultValue={typeof window !== "undefined" ? localStorage.getItem("tt-user-email") ?? "" : ""}
        onChange={(e) => {
          if (e.target.value.includes("@")) {
            localStorage.setItem("tt-user-email", e.target.value);
          }
        }}
      />
    </div>
  );
}
