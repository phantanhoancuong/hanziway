"use client";

import { cn } from "@/lib";

import { SearchMode } from "@/types";

const MODES: { value: SearchMode; label: string; ariaLabel: string }[] = [
  { value: "character", label: "Char", ariaLabel: "Search by character" },
  { value: "pinyin", label: "Pin", ariaLabel: "Search by pinyin" },
];

export default function SearchModeToggle({
  mode,
  onChange,
}: {
  mode: SearchMode;
  onChange: (mode: SearchMode) => void;
}) {
  return (
    <div className="bg-elevated border-border inline-flex w-fit gap-0.5 self-start rounded-full border p-0.5">
      {MODES.map(({ value, label, ariaLabel }) => {
        const active = mode === value;
        return (
          <button
            key={value}
            type="button"
            aria-label={ariaLabel}
            aria-pressed={active}
            className={cn(
              "focus-visible:ring-accent relative min-h-9 w-16 cursor-pointer rounded-full border text-xs font-medium transition-colors duration-500 outline-none focus-visible:ring-2 focus-visible:ring-inset",
              active
                ? "border-accent"
                : "text-foreground/60 hover:text-foreground border-transparent"
            )}
            onClick={() => onChange(value)}
          >
            <span
              className={cn(
                "bg-accent absolute inset-0 rounded-full transition-opacity duration-200",
                active ? "opacity-10" : "opacity-0"
              )}
              aria-hidden
            />
            <span
              className={cn(
                "relative z-10 transition-colors duration-200",
                active && "text-accent"
              )}
            >
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
