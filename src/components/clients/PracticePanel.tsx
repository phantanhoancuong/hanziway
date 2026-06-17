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

  return (
    <div className="flex flex-col gap-4">
      <div className="border-foreground/10 flex min-h-64 w-full flex-col items-center justify-center gap-4 rounded-sm border-2 p-6">
        <span className="text-8xl leading-none font-light">
          {session[index].char}
        </span>

        <div className="flex flex-col items-center gap-1">
          <div className="flex items-baseline gap-3">
            <span className="text-base font-medium">
              {session[index].pinyin}
            </span>
            <span className="text-foreground/60 text-sm">
              ({pinyinToZhuyin(session[index].pinyin)})
            </span>
          </div>
          <div className="text-foreground/60 text-sm">
            {session[index].definition}
          </div>
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
          if (inputText.trim().length == 0) {
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
          autoFocus={true}
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
