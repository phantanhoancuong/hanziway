import Link from "next/link";

import { Header } from "@/components/client";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-dvh flex-col">
      <Header />
      <main className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
        {children}
      </main>
      <footer className="border-border text-foreground/40 flex shrink-0 items-center justify-center gap-2 border-t px-6 py-1 text-xs">
        <span>v{process.env.NEXT_PUBLIC_APP_VERSION}</span>
        <span>·</span>
        <Link href="/privacy" className="hover:text-foreground/70">
          Privacy
        </Link>
        <span>·</span>
        <Link href="/licenses" className="hover:text-foreground/70">
          Licenses
        </Link>
      </footer>
    </div>
  );
}
