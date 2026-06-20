"use client";

import { useEffect, useRef, useState } from "react";

import { pinyinToZhuyin } from "pinyin-zhuyin";

import { cn } from "@/lib";

import { PracticeChar } from "@/types";
import CangjieKeyboard from "./CangjieKeyboard";
import { LETTER_TO_KEY } from "@/lib/cangjie";

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
  const [index, setIndex] = useState<number>(0);
  const current = session[index];

  const shakeInput = () => {
    if (inputShake) return;
    setInputShake(true);
    setTimeout(() => setInputShake(false), 500);
  };

  const handleBackspace = () => {
    if (inputText.length === 0) return shakeInput();
    setInputText((prev) => prev.slice(0, -1));
  };

  const handleEnter = () => {
    if (inputText.length === 0) return shakeInput();
    onSubmit(index, inputText);
    if (index + 1 >= session.length) return onComplete();
    setIndex((prev) => prev + 1);
    setInputText("");
  };

  useEffect(() => {
    const handleInput = (e: KeyboardEvent) => {
      const character = e.key.toUpperCase();
      if (character === "BACKSPACE") return handleBackspace();
      if (character === "ENTER") return handleEnter();
      if (character.length !== 1) return;
      if (!LETTER_TO_KEY.has(character)) return shakeInput();
      if (inputText.length >= 5) return shakeInput();

      setInputText((prev) => prev + character);
    };
    window.addEventListener("keydown", handleInput);
    return () => window.removeEventListener("keydown", handleInput);
  }, [inputText]);

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex h-[70%] flex-col justify-center gap-4 p-2 lg:px-6">
        <div className="border-foreground/10 flex min-h-64 w-full items-center justify-center gap-4 rounded-sm border-2 p-6">
          <div className="flex w-[30%] flex-1 flex-col items-center">
            <div className="text-7xl leading-none font-light">
              {current.char}
            </div>
            <div className="flex flex-col items-center">
              <span className="text-base font-medium">{current.pinyin}</span>
              <span className="text-foreground/60 text-sm">
                ({pinyinToZhuyin(current.pinyin)})
              </span>
            </div>
          </div>

          <div className="items-left flex w-[70%] flex-1 flex-col gap-1">
            <ol className="flex list-none flex-col gap-1 text-ellipsis">
              {current.definition.slice(0, 3).map((def, j) => (
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
              {current.definition.length > 3 && (
                <li className="flex gap-2 text-sm sm:text-base">
                  <span className="w-6 shrink-0 text-right font-mono text-sm opacity-40" />
                  <div>. . .</div>
                </li>
              )}
            </ol>
          </div>
        </div>
        <div
          className={cn(
            "border-border flex w-full justify-center gap-2",
            inputShake && "animate-shake"
          )}
        >
          <div className="flex w-full max-w-xl gap-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                className="border-border flex min-h-16 w-[20%] flex-col items-center justify-center border-2 p-2 text-nowrap"
                key={index}
              >
                <span className="flex flex-2 items-center text-sm">
                  {inputText[index]}
                </span>
                <span className="text-foreground/40 flex flex-1 items-center text-xs">
                  {LETTER_TO_KEY.get(inputText[index])?.radical}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex h-[30%] flex-col justify-end p-2 md:justify-center lg:px-6">
        <CangjieKeyboard
          onKey={(letter: string) => {
            setInputText((prev) => prev + letter);
          }}
          onBack={handleBackspace}
          onEnter={handleEnter}
        />
      </div>
    </div>
  );
};

export default PracticePanel;
