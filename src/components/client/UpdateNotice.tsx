"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import { compareVersions } from "@/lib";

import { ChangelogEntry } from "@/types";

const LAST_SEEN_KEY = "hanziway:lastSeenVersion";

export default function UpdateNotice() {
  const [entry, setEntry] = useState<ChangelogEntry | null>(null);

  useEffect(() => {
    fetch("/changelog.json")
      .then((r) => r.json())
      .then((changelog: ChangelogEntry[]) => {
        const latest = [...changelog].sort((a, b) =>
          compareVersions(b.version, a.version)
        )[0];
        if (!latest) return;

        const lastSeen = localStorage.getItem(LAST_SEEN_KEY);
        const alreadySeen =
          lastSeen !== null && compareVersions(lastSeen, latest.version) >= 0;

        if (!alreadySeen) setEntry(latest);
        localStorage.setItem(LAST_SEEN_KEY, latest.version);
      })
      .catch((err) => {
        console.error("Failed to load changelog:", err);
      });
  }, []);

  if (!entry) return null;

  const added = entry.added ?? [];
  const fixed = entry.fixed ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="bg-elevated border-border flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border">
        <div className="flex flex-col gap-2 px-6 pt-6 pb-4">
          <span className="bg-accent/10 text-accent w-fit rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide uppercase">
            v{entry.version}
          </span>
          <h2 className="text-foreground text-2xl font-bold tracking-tight">
            What's new
          </h2>
          {entry.summary && (
            <p className="text-foreground/60 text-sm leading-relaxed">
              {entry.summary}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-2 overflow-y-auto px-6 pb-2 sm:grid-cols-2">
          {added.map((item, i) => (
            <div
              key={`added-${i}`}
              className="bg-background border-border/60 flex items-start gap-2.5 rounded-xl border p-3"
            >
              <span className="bg-accent mt-0.5 size-1.5 shrink-0 rounded-full" />
              <span className="text-foreground text-sm leading-snug">
                {item}
              </span>
            </div>
          ))}
          {fixed.map((item, i) => (
            <div
              key={`fixed-${i}`}
              className="bg-background border-border/60 flex items-start gap-2.5 rounded-xl border p-3"
            >
              <span className="bg-foreground/30 mt-0.5 size-1.5 shrink-0 rounded-full" />
              <span className="text-foreground/60 text-sm leading-snug">
                {item}
              </span>
            </div>
          ))}
        </div>

        <div className="p-6 pt-4">
          <button
            className="bg-accent text-background w-full cursor-pointer rounded-xl py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
            onClick={() => setEntry(null)}
          >
            Got it
          </button>
          <Link
            href="/changelog"
            onClick={() => setEntry(null)}
            className="text-foreground/60 hover:text-foreground w-full py-1 text-center text-xs transition-colors"
          >
            See full changelog
          </Link>
        </div>
      </div>
    </div>
  );
}
