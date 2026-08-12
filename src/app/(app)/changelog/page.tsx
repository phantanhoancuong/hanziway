"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import { ChangelogEntry } from "@/types";

import { compareVersions } from "@/lib";

export default function ChangelogPage() {
  const [entries, setEntries] = useState<ChangelogEntry[] | null>(null);

  useEffect(() => {
    fetch("/changelog.json")
      .then((r) => r.json())
      .then((changelog: ChangelogEntry[]) => {
        setEntries(
          [...changelog].sort((a, b) => compareVersions(b.version, a.version))
        );
      })
      .catch((err) => {
        console.error("Failed to load changelog:", err);
      });
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-2 p-3 sm:p-6">
      <div className="flex flex-col gap-1">
        <Link
          href="/"
          className="text-foreground/60 hover:text-foreground w-fit text-sm transition-colors"
        >
          Back
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Changelog</h1>
      </div>

      {entries === null && (
        <p className="text-foreground/60 text-sm">Loading...</p>
      )}

      {entries?.length === 0 && (
        <p className="text-foreground/60 text-sm">No entries yet.</p>
      )}

      <div className="flex flex-col gap-8">
        {entries?.map((entry) => {
          const added = entry.added ?? [];
          const fixed = entry.fixed ?? [];
          return (
            <div key={entry.version} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <span className="bg-accent/10 text-accent w-fit rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide uppercase">
                  v{entry.version}
                </span>
                {entry.summary && (
                  <p className="text-foreground/60 text-sm leading-relaxed">
                    {entry.summary}
                  </p>
                )}
              </div>

              {(added.length > 0 || fixed.length > 0) && (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {added.map((item, i) => (
                    <div
                      key={`added-${i}`}
                      className="bg-elevated border-border/60 flex items-start gap-2.5 rounded-xl border p-3"
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
                      className="bg-elevated border-border/60 flex items-start gap-2.5 rounded-xl border p-3"
                    >
                      <span className="bg-foreground/30 mt-0.5 size-1.5 shrink-0 rounded-full" />
                      <span className="text-foreground/60 text-sm leading-snug">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
