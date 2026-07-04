"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib";

const TABS = [
  { href: "/", label: "Lookup" },
  { href: "/practice", label: "Practice" },
] as const;

const Header = () => {
  const pathname = usePathname();

  return (
    <header className="bg-background/80 border-border sticky top-0 z-50 flex h-16 items-center justify-between border-b px-6 backdrop-blur-sm">
      <Link href="/" className="flex cursor-pointer flex-col">
        <span className="text-accent text-2xl font-bold tracking-tight">
          hanziway
        </span>
        <span className="text-accent text-xs">漢字道</span>
      </Link>

      <nav className="flex gap-1">
        {TABS.map(({ href, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "rounded-sm px-3 py-1.5 text-sm transition-colors",
                active
                  ? "text-accent font-medium"
                  : "text-foreground/40 hover:text-foreground"
              )}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
};
export default Header;
