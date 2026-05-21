"use client";

import { useState, useEffect } from "react";
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
  const [email, setEmail] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setEmail(localStorage.getItem("tt-user-email") ?? "");
    setSaved(!!localStorage.getItem("tt-user-email"));
  }, []);

  function handleSave() {
    if (email.includes("@")) {
      localStorage.setItem("tt-user-email", email);
      setSaved(true);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="email"
        placeholder="your@email.com"
        className={cn(
          "h-8 w-52 rounded-md border bg-background px-2 text-sm",
          saved ? "border-emerald-500/50" : "border-input"
        )}
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setSaved(false);
        }}
        onBlur={handleSave}
        onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
      />
      {saved ? (
        <span className="text-xs text-emerald-500">Connected</span>
      ) : (
        <span className="text-xs text-destructive">Enter email + press Enter</span>
      )}
    </div>
  );
}
