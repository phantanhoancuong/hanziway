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
              "focus-visible:ring-accent group relative min-h-9 w-16 cursor-pointer rounded-full border transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-inset",
              active ? "border-accent" : "border-transparent"
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
                "text-foreground relative z-10 text-xs font-medium transition-opacity duration-200",
                active
                  ? "text-accent opacity-100"
                  : "opacity-60 group-hover:opacity-100"
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
