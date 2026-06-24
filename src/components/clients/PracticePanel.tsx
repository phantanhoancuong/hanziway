"use client";

import { useEffect, useState } from "react";

import { pinyinToZhuyin } from "pinyin-zhuyin";

import { LETTER_TO_KEY, cn } from "@/lib";

import { MAX_CANGJIE_LENGTH } from "@/constants";

import { CangjieKeyboard } from "@/components/clients";

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
  onSubmit: (sessionIndex: number, typed: string) => void;
  onComplete: () => void;
}) => {
  const [inputShake, setInputShake] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>("");
  const [sessionIndex, setSessionIndex] = useState<number>(0);
  const current = session[sessionIndex];

  /** Trigger the input slots' shake animation to signal invalid input. */
  const shakeInput = (): void => {
    if (inputShake) return;
    setInputShake(true);
    setTimeout(() => setInputShake(false), 500);
  };

  /** Remove the last typed letter, or shake the input if it's already empty. */
  const handleBackspace = (): void => {
    if (inputText.length === 0) return shakeInput();
    setInputText((prev) => prev.slice(0, -1));
  };

  /**
   * Submit the current input as the answer for the active character.
   * Advance to the next character or call `onComplete()` if it's the last one.
   * Shake the input if nothing has been typed yet.
   */
  const handleEnter = (): void => {
    if (inputText.length === 0) return shakeInput();
    onSubmit(sessionIndex, inputText);
    if (sessionIndex + 1 >= session.length) return onComplete();
    setSessionIndex((prev) => prev + 1);
    setInputText("");
  };

  /**
   * Append a capitalized letter to the current input.
   * Shake the input if the letter isn't a valid Cangjie key or the slots are full.
   *
   * @param char - The letter to append.
   */
  const handleChar = (char: string): void => {
    const normChar = char.toUpperCase();
    if (!LETTER_TO_KEY.has(normChar)) return shakeInput();
    if (inputText.length >= MAX_CANGJIE_LENGTH) return shakeInput();
    setInputText((prev) => prev + normChar);
  };

  useEffect(() => {
    /**
     * Route the keydown event to the matching handler.
     *
     * @param e - The keyboard event.
     */
    const onKeyDown = (e: KeyboardEvent): void => {
      const key = e.key.toUpperCase();
      if (key === "BACKSPACE") return handleBackspace();
      if (key === "ENTER") return handleEnter();
      if (key.length !== 1) return;
      handleChar(key);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [inputText, sessionIndex, session]);

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex h-[70%] flex-col justify-center gap-4 p-2 lg:px-6">
        <div className="border-foreground/10 flex max-h-64 min-h-64 w-full items-center justify-center gap-4 overflow-hidden rounded-sm border-2 p-2 sm:p-6">
          <div className="flex w-[30%] shrink-0 flex-col items-center">
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

          <div className="items-left flex min-w-0 flex-1 flex-col gap-1 overflow-hidden">
            <ol className="line-clamp-8 list-none">
              {current.definition.map((def, j) => (
                <li key={j} className="text-sm sm:text-base">
                  <span className="font-mono opacity-40">{j + 1}.</span> {def}
                </li>
              ))}
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
            {Array.from({ length: MAX_CANGJIE_LENGTH }).map((_, index) => (
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
          onChar={handleChar}
          onBack={handleBackspace}
          onEnter={handleEnter}
        />
      </div>
    </div>
  );
};

export default PracticePanel;
