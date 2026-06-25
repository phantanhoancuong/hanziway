"use client";

import { useRef } from "react";

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
 * Let the user pick a session size, one or more HSK / TOCFL levels, and start a practice session.
 *
 * @param selectedSessionSize - Currently selected session size, one of `sessionSizeOptions`.
 * @param onSelectSessionSize - Called with a session size when one of the size buttons is clicked.
 * @param sessionSizeOptions - The session sizes offered as buttons.
 * @param selectedLevels - Currently selected level ids, e.g. `"hsk:3"` or `"tocfl:2"`.
 * @param onToggle - Called with a level id when its button is clicked.
 * @param onStart - Called with the selected HSK and TOCFL level numbers and the selected session size when the user clicks Start.
 */
const LevelSelector = ({
  selectedSessionSize,
  onSelectSessionSize,
  sessionSizeOptions,
  selectedLevels,
  onStart,
  onToggle,
}: {
  selectedSessionSize: number;
  onSelectSessionSize: (sessionSize: number) => void;
  sessionSizeOptions: number[];
  selectedLevels: Set<string>;
  onStart: (
    hskLevels: number[],
    tocflLevels: number[],
    sessionSize: number
  ) => Promise<void>;
  onToggle: (id: string) => void;
}) => {
  /** Hold the most recent non-zero selection count. So the Start button's label doesn't read "0 levels selected" while it's fading out. */
  const lastSelectedSize = useRef(0);
  if (selectedLevels.size > 0) lastSelectedSize.current = selectedLevels.size;

  return (
    <div className="flex flex-col gap-8">
      <div className="text-foreground/40 flex flex-col items-center self-center text-lg font-semibold tracking-wider uppercase">
        <div>Cangjie Practice </div>
        <div>(Work In Progress)</div>
      </div>

      <div className="flex flex-col gap-3">
        <span className="text-foreground/70 text-base font-bold tracking-wider uppercase">
          Settings
        </span>

        <div className="flex flex-col gap-2">
          <span className="text-foreground/40 text-sm font-semibold tracking-wider uppercase">
            Session size
            <br />
            (how many characters per practice)
          </span>
          <div className="flex gap-2">
            {sessionSizeOptions.map((option, index) => (
              <button
                className={cn(
                  "bg-elevated h-12 flex-1 cursor-pointer rounded-sm border text-sm transition-all outline-none",
                  selectedSessionSize === option
                    ? "border-accent text-accent"
                    : "border-border text-foreground/40 hover:text-foreground hover:border-foreground/40"
                )}
                key={index}
                onClick={() => onSelectSessionSize(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="border-border border-t" />

      <div className="flex flex-col gap-3">
        <span className="text-foreground/70 text-base font-bold tracking-wider uppercase">
          Levels
        </span>

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
                      selectedLevels.has(id)
                        ? "border-accent text-accent"
                        : "border-border text-foreground/40 hover:text-foreground hover:border-foreground/40"
                    )}
                    key={id}
                    onClick={() => onToggle(id)}
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
                      selectedLevels.has(id)
                        ? "border-accent text-accent"
                        : "border-border text-foreground/40 hover:text-foreground hover:border-foreground/40"
                    )}
                    key={id}
                    onClick={() => onToggle(id)}
                  >
                    {level.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <button
        className={cn(
          "bg-elevated border-border hover:bg-foreground/5 hover:border-accent hover:text-accent h-12 cursor-pointer rounded-sm border px-4 transition-all",
          selectedLevels.size > 0
            ? "opacity-100"
            : "pointer-events-none opacity-0"
        )}
        onClick={() => {
          const levels = [...selectedLevels];
          const hskLevels = levels
            .filter((level) => level.startsWith("hsk:"))
            .map((level) => parseInt(level.slice(4)));
          const tocflLevels = levels
            .filter((level) => level.startsWith("tocfl:"))
            .map((level) => parseInt(level.slice(6)));
          onStart(hskLevels, tocflLevels, selectedSessionSize);
        }}
      >
        Start — {lastSelectedSize.current} level
        {lastSelectedSize.current === 1 ? "" : "s"} selected
      </button>
    </div>
  );
};

export default LevelSelector;
