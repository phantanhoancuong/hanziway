import Link from "next/link";

import { CURRENT_VERSION } from "@/lib";

export default function Footer() {
  return (
    <footer className="border-border text-foreground/40 flex shrink-0 items-center justify-center gap-2 border-t px-6 py-1 text-xs">
      <span>v{CURRENT_VERSION}</span>
      <span>·</span>
      <Link href="/privacy" className="hover:text-foreground/70">
        Privacy
      </Link>
      <span>·</span>
      <Link href="/licenses" className="hover:text-foreground/70">
        Licenses
      </Link>
      <span>·</span>
      <Link href="/changelog" className="hover:text-foreground/70">
        Changelog
      </Link>
    </footer>
  );
}
