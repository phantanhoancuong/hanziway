"use client";

import { useState, useRef } from "react";

import { cn } from "@/lib";

const HSK_LEVELS = [
  { id: "hsk1", label: "HSK 1" },
  { id: "hsk2", label: "HSK 2" },
  { id: "hsk3", label: "HSK 3" },
  { id: "hsk4", label: "HSK 4" },
  { id: "hsk5", label: "HSK 5" },
  { id: "hsk6", label: "HSK 6" },
  { id: "hsk7", label: "HSK 7" },
  { id: "hsk8", label: "HSK 8" },
  { id: "hsk9", label: "HSK 9" },
];
const TOCFL_LEVELS = [
  { id: "tocfl-l1", label: "Novice 1" },
  { id: "tocfl-l2", label: "Novice 2" },
  { id: "tocfl-l3", label: "Intermediate 1" },
  { id: "tocfl-l4", label: "Intermediate 2" },
  { id: "tocfl-l5", label: "Advanced 1" },
  { id: "tocfl-l6", label: "Advanced 2" },
];

export default function PracticePage() {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const lastSelectedSize = useRef(0);
  if (selected.size > 0) lastSelectedSize.current = selected.size;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 p-6">
      <div>
        <h1>Cangjie Practice</h1>
        <p>Type the Cangjie code for each character</p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <span className="text-foreground/40 text-sm font-semibold tracking-wider uppercase">
            HSK
          </span>
          <div className="grid grid-cols-3 gap-2">
            {HSK_LEVELS.map((level) => (
              <button
                className={cn(
                  "bg-elevated h-12 cursor-pointer rounded-sm border text-sm transition-all outline-none",
                  selected.has(level.id)
                    ? "border-accent text-accent"
                    : "border-border text-foreground/40 hover:text-foreground hover:border-foreground/40"
                )}
                key={level.id}
                onClick={() => toggle(level.id)}
              >
                {level.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-foreground/40 text-sm font-semibold tracking-wider uppercase">
            TOCFL
          </span>
          <div className="grid grid-cols-2 gap-2">
            {TOCFL_LEVELS.map((level, index) => (
              <button
                className={cn(
                  "bg-elevated h-12 cursor-pointer rounded-sm border text-sm transition-all outline-none",
                  selected.has(level.id)
                    ? "border-accent text-accent cursor-default"
                    : "border-border text-foreground/40 hover:text-foreground hover:border-foreground/40"
                )}
                key={level.id}
                onClick={() => toggle(level.id)}
              >
                {level.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        className={cn(
          "bg-elevated border-border hover:bg-foreground/5 hover:border-accent hover:text-accent h-12 cursor-pointer rounded-sm border px-4 transition-all",
          selected.size > 0 ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      >
        Start — {lastSelectedSize.current} level
        {lastSelectedSize.current === 1 ? "" : "s"} selected
      </button>
    </main>
  );
}
