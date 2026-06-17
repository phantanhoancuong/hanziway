"use client";

import { useRef, useState } from "react";

import { cn } from "@/lib";

const HSK_LEVELS = [
  { n: 1, label: "HSK 1" },
  { n: 2, label: "HSK 2" },
  { n: 3, label: "HSK 3" },
  { n: 4, label: "HSK 4" },
  { n: 5, label: "HSK 5" },
  { n: 6, label: "HSK 6" },
  { n: 7, label: "HSK 7 – 9" },
];

const TOCFL_LEVELS = [
  { n: 1, label: "Novice 1" },
  { n: 2, label: "Novice 2" },
  { n: 3, label: "Intermediate 1" },
  { n: 4, label: "Intermediate 2" },
  { n: 5, label: "Advanced 1" },
  { n: 6, label: "Advanced 2" },
];

/**
 * Let the user pick one or more HSK / TOCFL levels and start a practice session.
 *
 * @param onStart - Called with the selected HSK and TOCFL level numbers when the user clicks Start.
 */
const LevelSelector = ({
  onStart,
}: {
  onStart: (hskLevels: number[], tocflLevels: number[]) => Promise<void>;
}) => {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  /**
   * Add `id` to `selected` if absent, remove it if present.
   *
   * @param id - Level `id` to toggle.
   */
  const toggle = (id: string): void => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  /** Hold the most recent non-zero selection count. So the Start button's label doesn't read "0 levels selected" while it's fading out. */
  const lastSelectedSize = useRef(0);
  if (selected.size > 0) lastSelectedSize.current = selected.size;

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-foreground/40 self-center text-lg font-semibold tracking-wider uppercase">
        Cangjie Practice
      </h1>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <span className="text-foreground/40 text-sm font-semibold tracking-wider uppercase">
            HSK
          </span>
          <div className="grid grid-cols-3 gap-2">
            {HSK_LEVELS.map((level) => {
              const id = `hsk:${level.n}`;
              return (
                <button
                  className={cn(
                    "bg-elevated h-12 cursor-pointer rounded-sm border text-sm transition-all outline-none",
                    level.n === 7 && "col-span-3",
                    selected.has(id)
                      ? "border-accent text-accent"
                      : "border-border text-foreground/40 hover:text-foreground hover:border-foreground/40"
                  )}
                  key={id}
                  onClick={() => toggle(id)}
                >
                  {level.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-foreground/40 text-sm font-semibold tracking-wider uppercase">
            TOCFL
          </span>
          <div className="grid grid-cols-2 gap-2">
            {TOCFL_LEVELS.map((level) => {
              const id = `tocfl:${level.n}`;
              return (
                <button
                  className={cn(
                    "bg-elevated h-12 cursor-pointer rounded-sm border text-sm transition-all outline-none",
                    selected.has(id)
                      ? "border-accent text-accent"
                      : "border-border text-foreground/40 hover:text-foreground hover:border-foreground/40"
                  )}
                  key={id}
                  onClick={() => toggle(id)}
                >
                  {level.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <button
        className={cn(
          "bg-elevated border-border hover:bg-foreground/5 hover:border-accent hover:text-accent h-12 cursor-pointer rounded-sm border px-4 transition-all",
          selected.size > 0 ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => {
          const levels = [...selected];
          const hskLevels = levels
            .filter((level) => level.startsWith("hsk:"))
            .map((level) => parseInt(level.slice(4)));
          const tocflLevels = levels
            .filter((level) => level.startsWith("tocfl:"))
            .map((level) => parseInt(level.slice(6)));
          onStart(hskLevels, tocflLevels);
        }}
      >
        Start — {lastSelectedSize.current} level
        {lastSelectedSize.current === 1 ? "" : "s"} selected
      </button>
    </div>
  );
};

export default LevelSelector;
