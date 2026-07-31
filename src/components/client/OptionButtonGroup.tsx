"use client";

import { cn } from "@/lib";

const BUTTON_CLASS =
  "bg-elevated h-10 sm:h-12 cursor-pointer rounded-sm border text-xs sm:text-sm transition-all outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent";

const BUTTON_STATE_CLASS = (active: boolean) =>
  active
    ? "border-accent bg-accent/10 text-accent"
    : "border-border text-foreground/60 hover:text-foreground hover:border-foreground/30";

/**
 * A labeled row (or grid) of option buttons, with selected ones highlighted.
 *
 * Support single-select or multi-select through `isSelected`.
 *
 * @param label - Text shown above the buttons.
 * @param options - Buttons to render, each with a display label and value.
 * @param isSelected - Check if a given option's value is currently selected.
 * @param onSelect - Called with an option's value when clicked.
 * @param layoutClassName - Classes for arranging the buttons. Default to an evenly-spaced flex row.
 * @param getButtonClassName - Optional per-option class override.
 */
const OptionButtonGroup = <T,>({
  label,
  options,
  isSelected,
  onSelect,
  layoutClassName = "flex gap-2",
  getButtonClassName,
}: {
  label: React.ReactNode;
  options: readonly { label: string; value: T }[];
  isSelected: (value: T) => boolean;
  onSelect: (value: T) => void;
  layoutClassName?: string;
  getButtonClassName?: (option: { label: string; value: T }) => string;
}) => {
  return (
    <div className="flex flex-col gap-1 sm:gap-2">
      <span className="text-foreground/50 text-xs font-semibold tracking-wider uppercase sm:text-sm">
        {label}
      </span>
      <div className={layoutClassName}>
        {options.map((option, index) => (
          <button
            className={cn(
              BUTTON_CLASS,
              !getButtonClassName && "flex-1",
              getButtonClassName?.(option),
              BUTTON_STATE_CLASS(isSelected(option.value))
            )}
            key={index}
            onClick={() => onSelect(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default OptionButtonGroup;
