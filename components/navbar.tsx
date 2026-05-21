"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clock, FolderOpen, BarChart3, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Dashboard", icon: Clock },
  { href: "/projects", label: "Projects", icon: FolderOpen },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Navbar({ userName, userImage }: { userName?: string | null; userImage?: string | null }) {
  const pathname = usePathname();

  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto max-w-6xl px-4 flex items-center justify-between h-14">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-semibold text-lg tracking-tight">
            Multick
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
        <div className="flex items-center gap-3">
          {userImage && (
            <img src={userImage} alt="" className="h-7 w-7 rounded-full" />
          )}
          <span className="text-sm text-muted-foreground">{userName}</span>
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
