"use client";

import { cn } from "@/lib";

const GRID_COLS = { base: 4, sm: 6, lg: 8 };
const ROWS_PER_PAGE = 3;
const PAGE_SIZE = GRID_COLS.lg * ROWS_PER_PAGE;
const PAGE_SLOTS = 7;

/**
 * Build a page list with ellipsis gaps e.g. [0, "…", 3, 4, 5, "…", 27].
 *
 * @param current - Current page (0-indexed).
 * @param total - Total number of pages.
 * @returns Page numbers (0-indexed) and "…" placeholders, in display order.
 */
const getPageList = (current: number, total: number): (number | "…")[] => {
  const edgeCount = PAGE_SLOTS - 2;
  if (total <= PAGE_SLOTS) {
    return Array.from({ length: total }, (_, i) => i);
  }

  if (current <= edgeCount - 1) {
    return [...Array.from({ length: edgeCount }, (_, i) => i), "…", total - 1];
  }

  if (current >= total - edgeCount) {
    return [
      0,
      "…",
      ...Array.from({ length: edgeCount }, (_, i) => total - edgeCount + i),
    ];
  }

  return [0, "…", current - 1, current, current + 1, "…", total - 1];
};

export default function ResultGrid({
  characters,
  captions,
  selectedChar,
  onSelect,
  page,
  onPageChange,
}: {
  characters: string[];
  captions: Map<string, string>;
  selectedChar: string | null;
  onSelect: (character: string) => void;
  page: number;
  onPageChange: (page: number) => void;
}) {
  const totalPages = Math.ceil(characters.length / PAGE_SIZE);
  const pageChars = characters.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  if (characters.length === 0) return null;

  return (
    <div className="mt-1 lg:mt-2">
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8">
        {Array.from({ length: PAGE_SIZE }, (_, index) => {
          const character = pageChars[index];
          if (!character)
            return <div className="h-14" key={index} aria-hidden />;

          return (
            <button
              className={cn(
                "bg-elevated flex h-14 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-sm border text-lg transition-all outline-none",
                selectedChar === character
                  ? "border-accent text-accent cursor-default"
                  : "border-border text-foreground/40 hover:text-foreground hover:border-foreground/40"
              )}
              key={index}
              onClick={() => onSelect(character)}
            >
              <span>{character}</span>
              {captions.get(character) && (
                <span className="text-xs">{captions.get(character)}</span>
              )}
            </button>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="mt-2 flex justify-center">
          <div className="flex min-w-[16rem] items-center justify-center gap-1">
            <button
              className="text-foreground/40 hover:text-foreground cursor-pointer px-2 py-1 text-xs transition-colors disabled:cursor-default disabled:opacity-30"
              disabled={page === 0}
              onClick={() => onPageChange(page - 1)}
            >
              Prev
            </button>
            {getPageList(page, totalPages).map((p, i) =>
              p === "…" ? (
                <span
                  key={`ellipsis-${i}`}
                  className="text-foreground/40 flex h-7 w-7 items-center justify-center text-xs"
                >
                  …
                </span>
              ) : (
                <button
                  key={p}
                  className={cn(
                    "h-7 w-7 cursor-pointer rounded-sm text-xs transition-colors",
                    page === p
                      ? "bg-accent text-background"
                      : "text-foreground/40 hover:text-foreground"
                  )}
                  onClick={() => onPageChange(p)}
                >
                  {p + 1}
                </button>
              )
            )}
            <button
              className="text-foreground/40 hover:text-foreground cursor-pointer px-2 py-1 text-xs transition-colors disabled:cursor-default disabled:opacity-30"
              disabled={page === totalPages - 1}
              onClick={() => onPageChange(page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
