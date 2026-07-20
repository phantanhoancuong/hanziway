"use client";

import { useState } from "react";

import { cn } from "@/lib";

import { PracticeChar } from "@/types";

const PinyinPracticePanel = ({
  currentChar,
  onSubmit,
}: {
  currentChar: PracticeChar;
  onSubmit: (typed: string) => void;
}) => {
  const [inputText, setInputText] = useState<string>("");
  const [inputShake, setInputShake] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed) {
      setInputShake(true);
      setTimeout(() => setInputShake(false), 500);
      return;
    }
    onSubmit(trimmed);
    setInputText("");
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex min-h-0 flex-1 flex-col justify-center gap-4 overflow-hidden p-2 lg:px-6">
        <div className="border-foreground/10 flex h-64 min-h-0 w-full items-center justify-center gap-4 overflow-hidden rounded-sm border-2 p-2 sm:p-6">
          {" "}
          <div className="flex w-[30%] shrink-0 flex-col items-center">
            <div className="text-7xl leading-none font-light">
              {currentChar.char}
            </div>
            <div className="flex flex-col items-center opacity-0" aria-hidden>
              <span className="text-base font-medium">placeholder</span>
              <span className="text-sm">placeholder</span>
            </div>
          </div>
          <div className="items-left flex min-w-0 flex-1 flex-col gap-1 overflow-hidden">
            <ol className="line-clamp-8 list-none">
              {currentChar.definition.map((def, j) => (
                <li key={j} className="text-sm sm:text-base">
                  <span className="font-mono opacity-40">{j + 1}.</span> {def}
                </li>
              ))}
            </ol>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className={cn(
            "border-border flex min-h-16 w-full justify-center",
            inputShake && "animate-shake"
          )}
        >
          <input
            className="bg-elevated border-border focus:border-accent hover:border-foreground/40 w-full max-w-xl rounded-sm border-2 p-2 text-center text-lg transition-colors outline-none"
            type="text"
            autoFocus
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type the pinyin . . ."
          />
        </form>
      </div>

      <div
        className="invisible flex shrink-0 flex-col justify-center gap-1 p-2 lg:px-6"
        aria-hidden
      >
        <div className="h-8" />
        <div className="h-40" />
      </div>
    </div>
  );
};

export default PinyinPracticePanel;
