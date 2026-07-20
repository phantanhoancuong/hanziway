"use client";

import { useState } from "react";

import { cn, getCharactersByLevel, isPracticeCorrect } from "@/lib";

import {
  CangjieReferencePanel,
  LevelSelector,
  PinyinPracticePanel,
  PracticePanel,
  ResultPanel,
} from "@/components/client";

import { PracticeChar, PracticeMode } from "@/types";

import {
  PRACTICE_MODE_OPTIONS,
  SESSION_SIZE_OPTIONS,
  TONE_PREFERENCE_OPTIONS,
} from "@/constants";

/**
 * Return a new array containing a random subset of `arr`, shuffled.
 *
 * Use Fisher-Yates shuffle but only the last `n` positions are randomized and returned when `n` is smaller than `arr.length`.
 *
 * @param arr - Source array. It is not modified.
 * @param n - Number of elements to return. Default to `arr.length`.
 * @returns A new array of length `min(n, arr.length)` in randomized order.
 */
const shuffle = <T,>(arr: T[], n?: number): T[] => {
  const shuffled = [...arr];
  const limit = n !== undefined ? Math.min(n, arr.length) : arr.length;
  for (let i = arr.length - 1; i >= arr.length - limit; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(arr.length - limit);
};

/**
 * Practice page.
 *
 * Orchestrate three phases:
 * - "select": the user picks the HSK / TOCFL levels through `LevelSelector`.
 * - "practice": the user works through the generated `session` through `PracticePanel` (Cangjie mode) or `PinyinPracticePanel` (pinyin mode).
 * - "result": the user views their results and can retry missed characters or just a new session.
 */
export default function PracticePage() {
  const [selectedLevels, setSelectedLevels] = useState<Set<string>>(new Set());
  const [phase, setPhase] = useState<"select" | "practice" | "result">(
    "select"
  );
  const [session, setSession] = useState<PracticeChar[]>([]);
  const [sessionSize, setSessionSize] = useState<number>(
    SESSION_SIZE_OPTIONS[3]
  );
  const [sessionIndex, setSessionIndex] = useState<number>(0);
  const [isReferenceOpen, setIsReferenceOpen] = useState<boolean>(false);
  const [practiceMode, setPracticeMode] = useState<PracticeMode>("cangjie");
  const [tonePreference, setTonePreference] = useState<boolean>(true);

  /**
   * Add `id` to `selectedLevels` if absent, remove it if present.
   *
   * @param id - Level `id` to toggle.
   */
  const toggleLevel = (id: string): void => {
    setSelectedLevels((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  /**
   * Build a new practice session from the selected levels and start it.
   *
   * Fetch the character pool for the given levels, shuffle, and trim it to `requestedSessionSize`.
   *
   * Map each entry into `PracticeChar` and advance `phase` to "practice".
   *
   * @param hskLevels - Selected HSK level numbers (1 to 7).
   * @param tocflLevels - Selected TOCFL level numbers (1 to 6).
   * @param requestedSessionSize - Number of characters to include in the session, as chosen in `LevelSelector`.
   * @returns A promise that resolves once `session` and `phase` are updated.
   */
  const handleStart = async (
    hskLevels: number[],
    tocflLevels: number[],
    requestedSessionSize: number
  ): Promise<void> => {
    const requireCangjie = practiceMode === "cangjie";
    const allCharacters = await getCharactersByLevel(
      hskLevels,
      tocflLevels,
      requireCangjie
    );
    const characters = shuffle(allCharacters, requestedSessionSize);
    setSessionIndex(0);
    setSession(
      characters.map((character) => {
        const bestReading = [...character.entry.r].sort(
          (a, b) => b.d.length - a.d.length
        )[0];

        return {
          char: character.char,
          cj: character.entry.cj ?? "",
          pinyin: bestReading.m,
          definition: bestReading.d,
        };
      })
    );

    setPhase("practice");
  };

  /**
   * Record the result of a single character submission into `session`.
   *
   * Also conditionally advance to the next character or to the result phase if it's the last character.
   *
   * @param typed - The text the user submitted for this character.
   */
  const handleSubmit = (typed: string): void => {
    setSession((prev) =>
      prev.map(
        (c, i): PracticeChar => (i === sessionIndex ? { ...c, typed } : c)
      )
    );
    if (sessionIndex + 1 >= session.length) return setPhase("result");
    setSessionIndex((prev) => prev + 1);
  };

  /**
   * Restart the practice phase with only the characters the user missed (also shuffled).
   *
   * Does nothing if every character was answered correctly.
   */
  const handleRetryMissed = (): void => {
    const missed = session.filter(
      (character) => !isPracticeCorrect(character, practiceMode, tonePreference)
    );
    if (missed.length === 0) return;
    setSessionIndex(0);
    setSession(
      shuffle(missed.map((character) => ({ ...character, typed: "" })))
    );
    setPhase("practice");
  };

  return (
    <div className="flex h-full gap-8">
      {phase === "select" && (
        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 p-6">
          <LevelSelector
            selectedPracticeMode={practiceMode}
            selectedSessionSize={sessionSize}
            selectedTonePreference={tonePreference}
            onSelectPracticeMode={(option: PracticeMode) =>
              setPracticeMode(option)
            }
            onSelectSessionSize={(option: number) => setSessionSize(option)}
            onSelectTonePreference={(option: boolean) =>
              setTonePreference(option)
            }
            practiceModeOptions={PRACTICE_MODE_OPTIONS}
            sessionSizeOptions={SESSION_SIZE_OPTIONS}
            tonePreferenceOptions={TONE_PREFERENCE_OPTIONS}
            selectedLevels={selectedLevels}
            onStart={handleStart}
            onToggle={toggleLevel}
          />
        </div>
      )}

      {phase === "practice" &&
        (() => {
          const currentChar: PracticeChar = session[sessionIndex];

          if (practiceMode === "pinyin") {
            return (
              <div className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col overflow-hidden">
                <PinyinPracticePanel
                  currentChar={currentChar}
                  onSubmit={handleSubmit}
                />
              </div>
            );
          }

          return (
            <>
              <div
                className={cn(
                  "mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col overflow-hidden transition-all duration-300",
                  isReferenceOpen && "hidden lg:flex"
                )}
              >
                <PracticePanel
                  isReferenceOpen={isReferenceOpen}
                  currentChar={currentChar}
                  onSubmit={handleSubmit}
                  onToggleReferenceOpen={() =>
                    setIsReferenceOpen((prev) => !prev)
                  }
                />
              </div>
              <div
                className={cn(
                  "min-h-0 flex-col overflow-hidden lg:transition-all lg:duration-300",
                  isReferenceOpen
                    ? "flex w-full lg:w-1/2 lg:translate-x-0 lg:opacity-100"
                    : "pointer-events-none hidden lg:flex lg:w-0 lg:translate-x-full lg:opacity-0"
                )}
              >
                <div className="h-full overflow-y-auto">
                  <CangjieReferencePanel
                    currentChar={currentChar}
                    onClose={() => setIsReferenceOpen(false)}
                  />
                </div>
              </div>
            </>
          );
        })()}

      {phase === "result" && (
        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 p-6">
          <ResultPanel
            session={session}
            practiceMode={practiceMode}
            tonePreference={tonePreference}
            onRetry={() => setPhase("select")}
            onRetryMissed={handleRetryMissed}
          />
        </div>
      )}
    </div>
  );
}
