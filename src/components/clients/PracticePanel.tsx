"use client";

import { useRef, useState } from "react";

import { pinyinToZhuyin } from "pinyin-zhuyin";

import { cn } from "@/lib";

import { PracticeChar } from "@/types";

/**
 * Render one character at a time from `session` and collect the user's typed Cangjie input for it.
 *
 * @param session - Ordered list of characters to practice.
 * @param onSubmit - Called once per character with the result of the submission.
 * @param onComplete - Called once after the last character has been submitted.
 * @returns
 */
const PracticePanel = ({
  session,
  onSubmit,
  onComplete,
}: {
  session: PracticeChar[];
  onSubmit: (index: number, typed: string) => void;
  onComplete: () => void;
}) => {
  const [inputShake, setInputShake] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [index, setIndex] = useState<number>(0);

  const current = session[index];

  return (
    <div className="flex flex-col gap-4">
      <div className="border-foreground/10 flex min-h-64 w-full items-center justify-center gap-4 rounded-sm border-2 p-6">
        <div className="flex flex-1 flex-col items-center">
          <div className="text-7xl leading-none font-light">{current.char}</div>
          <div className="flex flex-col items-center">
            <span className="text-base font-medium">{current.pinyin}</span>
            <span className="text-foreground/60 text-sm">
              ({pinyinToZhuyin(current.pinyin)})
            </span>
          </div>
        </div>

        <div className="flex flex-2 flex-col items-center gap-1">
          <ol className="flex list-none flex-col gap-1">
            {current.definition.slice(0, 3).map((def, j) => (
              <li key={j} className="flex gap-2 text-sm sm:text-base">
                <span className="w-6 shrink-0 text-right font-mono text-sm opacity-40">
                  {j + 1}.
                </span>
                <div>{def}</div>
              </li>
            ))}
            {current.definition.length > 3 && (
              <li className="flex gap-2 text-sm sm:text-base">
                <span className="w-6 shrink-0 text-right font-mono text-sm opacity-40" />
                <div>. . .</div>
              </li>
            )}
          </ol>
        </div>
      </div>

      <form
        className={cn(
          "border-border flex w-full",
          inputShake && "animate-shake"
        )}
        onSubmit={(e) => {
          e.preventDefault();
          if (inputShake) return;
          if (inputText.trim().length === 0) {
            setInputShake(true);
            setTimeout(() => setInputShake(false), 500);
            return;
          }
          const typed = inputText.trim();
          onSubmit(index, typed);
          setInputText("");
          if (index + 1 >= session.length) {
            onComplete();
          } else {
            setIndex((prev) => prev + 1);
          }
        }}
      >
        <input
          className="bg-elevated border-border placeholder:text-foreground/40 text-foreground focus:border-accent hover:border-foreground/40 w-full min-w-50 flex-1 cursor-text rounded-l-2xl border border-r-0 p-2 pl-4 transition-colors outline-none"
          value={inputText}
          placeholder="Type Cangjie . . ."
          autoFocus
          onChange={(e) => setInputText(e.target.value.toUpperCase())}
          ref={inputRef}
        />

        <button
          className="bg-elevated border-border hover:bg-foreground/5 cursor-pointer rounded-r-2xl border px-4 transition-colors"
          onMouseDown={(e) => e.preventDefault()}
        >
          Enter
        </button>
      </form>
    </div>
  );
};

export default PracticePanel;
