"use client";

import { useState } from "react";

import { getCharactersByLevel } from "@/lib";

import {
  LevelSelector,
  PracticePanel,
  ResultPanel,
} from "@/components/clients";

import { PracticeChar } from "@/types";

const SESSION_SIZE = 5;

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
 * - "practice": the user works through the generated `session` through `PracticePanel`.
 * - "result": session is complete (UI not yet implemented).
 */
export default function PracticePage() {
  const [phase, setPhase] = useState<"select" | "practice" | "result">(
    "select"
  );
  const [session, setSession] = useState<PracticeChar[]>([]);

  /**
   * Build a new practice session from the selected levels and start it.
   *
   * Fetch the character pool for the given levels, shuffle, and trim it. to `SESSION_SIZE`.
   *
   * Map each entry into `PracticeChar` and advance `phase` to "practice".
   *
   * @param hskLevels - Selected HSK level numbers (1 to 7).
   * @param tocflLevels - Selected TOCFL level numbers (1 to 6).
   * @returns A promise that resolves once `session` and `phase` are updated.
   */
  const handleStart = async (
    hskLevels: number[],
    tocflLevels: number[]
  ): Promise<void> => {
    const allCharacters = await getCharactersByLevel(hskLevels, tocflLevels);
    const characters = shuffle(allCharacters, SESSION_SIZE);

    setSession(
      characters.map((character) => {
        const bestReading = [...character.entry.r].sort(
          (a, b) => b.d.length - a.d.length
        )[0];

        return {
          char: character.char,
          cj: character.entry.cj!,
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
   * @param index - Position of the character within `session`.
   * @param typed - The text the user submitted for this character.
   */
  const handleSubmit = (index: number, typed: string) => {
    setSession((prev) =>
      prev.map((c, i): PracticeChar => (i === index ? { ...c, typed } : c))
    );
  };

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 p-6">
      {phase === "select" && <LevelSelector onStart={handleStart} />}
      {phase === "practice" && (
        <PracticePanel
          session={session}
          onSubmit={handleSubmit}
          onComplete={() => setPhase("result")}
        />
      )}
      {phase === "result" && <ResultPanel session={session} />}
    </main>
  );
}
