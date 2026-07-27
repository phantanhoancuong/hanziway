"use client";

import { pinyinToZhuyin } from "pinyin-zhuyin";

import { cn, isPracticeCorrect, toDigitPinyin } from "@/lib";
import { PracticeChar, PracticeMode } from "@/types";

const ResultPanel = ({
  session,
  practiceMode,
  tonePreference,
  onRetry,
  onRetryMissed,
}: {
  session: PracticeChar[];
  practiceMode: PracticeMode;
  tonePreference: boolean;
  onRetry: () => void;
  onRetryMissed: () => void;
}) => {
  const missedCount = session.filter(
    (character) => !isPracticeCorrect(character, practiceMode, tonePreference)
  ).length;
  const correctCount = session.length - missedCount;

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Result</h1>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">
            {correctCount} / {session.length}
          </span>
          <span className="text-foreground/40 text-sm">correct</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {session.map((character, index) => {
          const correct = isPracticeCorrect(
            character,
            practiceMode,
            tonePreference
          );
          return (
            <div
              className={cn(
                "flex flex-col gap-4 border-2 p-4 transition-colors",
                correct ? "border-border" : "border-accent/40 bg-accent/5"
              )}
              key={index}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-baseline gap-4">
                  <h2 className="text-3xl leading-none">{character.char}</h2>
                  {practiceMode === "cangjie" && (
                    <div className="flex gap-2 text-sm">
                      <p>{character.pinyin}</p>
                      <p className="text-foreground/60">
                        {toDigitPinyin(character.pinyin)}
                      </p>
                      <p className="text-foreground/60">
                        {pinyinToZhuyin(character.pinyin)}
                      </p>
                    </div>
                  )}
                  {practiceMode === "pinyin" && (
                    <p className="text-foreground/60 text-sm">
                      {pinyinToZhuyin(character.pinyin)}
                    </p>
                  )}
                </div>
                <span
                  className={cn(
                    "rounded-sm px-2 py-1 text-xs font-semibold",
                    correct
                      ? "bg-foreground/5 text-foreground/40"
                      : "bg-accent/10 text-accent"
                  )}
                >
                  {correct ? "Correct" : "Missed"}
                </span>
              </div>

              <div className="flex flex-col gap-1 text-sm">
                <div className="flex gap-2">
                  <span className="text-foreground/40 w-20 shrink-0">
                    You typed
                  </span>
                  <span
                    className={cn(
                      "truncate font-mono",
                      !correct && "text-accent"
                    )}
                  >
                    {character.typed || "—"}
                  </span>
                </div>
                {!correct && (
                  <div className="flex gap-2">
                    <span className="text-foreground/40 w-20 shrink-0">
                      {practiceMode === "cangjie" ? "Cangjie" : "Pinyin"}
                    </span>
                    <span className="font-mono">
                      {practiceMode === "cangjie"
                        ? character.cj
                        : `${character.pinyin} (${toDigitPinyin(character.pinyin)})`}
                    </span>
                  </div>
                )}
              </div>

              <div className="items-left flex flex-1 flex-col gap-1">
                <ol className="flex list-none flex-col gap-1">
                  {character.definition.slice(0, 3).map((def, j) => (
                    <li
                      key={j}
                      className="flex items-baseline gap-2 text-sm sm:text-base"
                    >
                      <span className="w-6 shrink-0 text-right font-mono text-sm opacity-40">
                        {j + 1}.
                      </span>
                      <div>{def}</div>
                    </li>
                  ))}
                  {character.definition.length > 3 && (
                    <li className="flex gap-2 text-sm sm:text-base">
                      <span className="w-6 shrink-0 text-right font-mono text-sm opacity-40" />
                      <div>. . .</div>
                    </li>
                  )}
                </ol>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
        <button
          className="bg-elevated border-border hover:bg-foreground/5 hover:border-accent hover:text-accent h-12 flex-1 cursor-pointer rounded-sm border p-2 px-4 transition-all"
          onClick={onRetry}
        >
          Retry
        </button>
        {missedCount > 0 && (
          <button
            className="bg-elevated border-border hover:bg-foreground/5 hover:border-accent hover:text-accent h-12 flex-1 cursor-pointer rounded-sm border p-2 px-4 transition-all"
            onClick={onRetryMissed}
          >
            Retry Missed ({missedCount})
          </button>
        )}
      </div>
    </div>
  );
};

export default ResultPanel;
