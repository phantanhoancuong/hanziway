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
    <div className="flex max-h-dvh min-h-0 flex-1 flex-col justify-start gap-4 overflow-y-auto p-2 pt-8 sm:pt-16 lg:px-6">
      <div className="border-foreground/10 flex h-48 w-full items-center justify-center gap-4 overflow-hidden rounded-sm border-2 p-2 sm:p-6">
        <div className="flex w-[30%] shrink-0 flex-col items-center">
          <div className="text-7xl leading-none font-light">
            {currentChar.char}
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
          "border-border bg-background sticky bottom-2 flex w-full justify-center sm:static sm:bg-transparent",
          inputShake && "animate-shake"
        )}
      >
        <input
          className="bg-elevated border-border placeholder:text-foreground/40 text-foreground focus:border-accent hover:border-foreground/40 w-full max-w-xl cursor-text rounded-2xl border p-2 pl-4 text-lg transition-colors outline-none"
          type="text"
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
  );
};

export default PinyinPracticePanel;
