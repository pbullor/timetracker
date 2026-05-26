import Link from "next/link";
import { Button } from "@/components/ui/button";

export function PublicHeader() {
  return (
    <header className="border-b border-border/50">
      <div className="mx-auto max-w-6xl px-4 flex items-center justify-between h-14">
        <Link href="/" className="font-semibold text-lg tracking-tight">
          Multick
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/extension" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Extension
          </Link>
          <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Pricing
          </Link>
          <Link href="/login">
            <Button variant="outline" size="sm">Log in</Button>
          </Link>
          <Link href="/login">
            <Button size="sm">Sign up</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
