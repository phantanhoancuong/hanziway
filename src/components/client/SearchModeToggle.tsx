"use client";

import { cn } from "@/lib";

import { SearchMode } from "@/types";

const MODES: { value: SearchMode; label: string }[] = [
  { value: "character", label: "Character" },
  { value: "pinyin", label: "Pinyin" },
];

export default function SearchModeToggle({
  mode,
  onChange,
}: {
  mode: SearchMode;
  onChange: (mode: SearchMode) => void;
}) {
  return (
    <div className="inline-grid grid-cols-2 gap-2 self-start">
      {MODES.map(({ value, label }) => (
        <button
          key={value}
          className={cn(
            "bg-elevated border-border w-24 cursor-pointer rounded-sm border px-3 py-1 text-xs transition-all outline-none",
            mode === value
              ? "border-accent text-accent"
              : "text-foreground/40 hover:text-foreground hover:border-foreground/40"
          )}
          onClick={() => onChange(value)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
