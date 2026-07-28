"use client";

import { useRef } from "react";

import { cn } from "@/lib";
import { OptionButtonGroup } from "@/components/client";
import { PracticeMode } from "@/types";

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

const SECTION_CLASS =
  "border-foreground/10 flex flex-col gap-2 rounded-sm border-2 p-4 sm:gap-3";

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
  selectedPracticeMode,
  selectedSessionSize,
  selectedTonePreference,
  onSelectPracticeMode,
  onSelectSessionSize,
  onSelectTonePreference,
  practiceModeOptions,
  sessionSizeOptions,
  tonePreferenceOptions,
  selectedLevels,
  onStart,
  onToggle,
}: {
  selectedPracticeMode: PracticeMode;
  selectedSessionSize: number;
  selectedTonePreference: boolean;
  onSelectPracticeMode: (practiceMode: PracticeMode) => void;
  onSelectSessionSize: (sessionSize: number) => void;
  onSelectTonePreference: (tonePreference: boolean) => void;
  practiceModeOptions: readonly { label: string; value: PracticeMode }[];
  sessionSizeOptions: number[];
  tonePreferenceOptions: readonly { label: string; value: boolean }[];
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

  const sessionSizeButtonOptions = sessionSizeOptions.map((n) => ({
    label: String(n),
    value: n,
  }));

  const hskButtonOptions = HSK_LEVELS.map((level) => ({
    label: level.label,
    value: `hsk:${level.n}`,
  }));

  const tocflButtonOptions = TOCFL_LEVELS.map((level) => ({
    label: level.label,
    value: `tocfl:${level.n}`,
  }));

  return (
    <div className="flex flex-col gap-4 pb-8 sm:gap-6 lg:gap-8">
      <div className="text-foreground/40 flex flex-col items-center self-center text-base font-semibold tracking-wider uppercase sm:text-lg">
        <div>Typing Practice</div>
      </div>

      <div className={SECTION_CLASS}>
        <span className="text-foreground/70 text-sm font-bold tracking-wider uppercase sm:text-base">
          Practice Mode
        </span>

        <OptionButtonGroup
          label="Method"
          options={practiceModeOptions}
          isSelected={(value) => selectedPracticeMode === value}
          onSelect={onSelectPracticeMode}
        />
      </div>

      <div className={SECTION_CLASS}>
        <span className="text-foreground/70 text-sm font-bold tracking-wider uppercase sm:text-base">
          Settings
        </span>

        <div
          className={cn(
            "grid transition-all duration-300",
            selectedPracticeMode === "pinyin"
              ? "grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0"
          )}
          inert={selectedPracticeMode !== "pinyin" ? true : undefined}
        >
          <div className="overflow-hidden">
            <OptionButtonGroup
              label="Tones"
              options={tonePreferenceOptions}
              isSelected={(value) => selectedTonePreference === value}
              onSelect={onSelectTonePreference}
            />
          </div>
        </div>

        <OptionButtonGroup
          label={
            <>
              Session size
              <br />
              (how many characters per practice)
            </>
          }
          options={sessionSizeButtonOptions}
          isSelected={(value) => selectedSessionSize === value}
          onSelect={onSelectSessionSize}
        />
      </div>

      <div className={SECTION_CLASS}>
        <span className="text-foreground/70 text-sm font-bold tracking-wider uppercase sm:text-base">
          Levels
        </span>

        <div className="flex flex-col gap-2 sm:gap-3">
          <OptionButtonGroup
            label="HSK"
            options={hskButtonOptions}
            isSelected={(value) => selectedLevels.has(value)}
            onSelect={onToggle}
            layoutClassName="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-7"
            getButtonClassName={(option) =>
              option.value === "hsk:7"
                ? "col-span-2 sm:col-span-3 lg:col-span-1"
                : ""
            }
          />

          <OptionButtonGroup
            label="TOCFL"
            options={tocflButtonOptions}
            isSelected={(value) => selectedLevels.has(value)}
            onSelect={onToggle}
            layoutClassName="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6"
          />
        </div>
      </div>

      <button
        className={cn(
          "bg-elevated border-border hover:bg-foreground/5 hover:border-accent hover:text-accent focus-visible:ring-accent h-10 cursor-pointer rounded-sm border px-4 text-sm transition-all outline-none focus-visible:ring-2 focus-visible:ring-inset sm:h-12 sm:text-base",
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
