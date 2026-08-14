"use client";

import { useEffect, useRef, useState } from "react";

import { pinyinToZhuyin } from "pinyin-zhuyin";

import { LETTER_TO_KEY, cn } from "@/lib";

import { MAX_CANGJIE_LENGTH } from "@/constants";

import { CangjieKeyboard, PracticeCharacterCard } from "@/components/client";
import { Icon } from "@/components/server";

import { PracticeChar } from "@/types";

import { HelpCenterIcon } from "@/assets";

/**
 * Render the current character and collect the user's typed Cangjie input for it.
 *
 * @param isReferenceOpen - Whether the reference panel is currently open.
 * @param currentChar - The current character in the practice session.
 * @param onSubmit - Called with the typed input when the user submits an answer to record the result.
 * @param onToggleReferenceOpen - Called to open or close the reference panel.
 * @returns
 */
const PracticePanel = ({
  currentChar,
  isReferenceOpen,
  onSubmit,
  onToggleReferenceOpen,
}: {
  currentChar: PracticeChar;
  isReferenceOpen: boolean;
  onSubmit: (typed: string) => void;
  onToggleReferenceOpen: () => void;
}) => {
  const [inputShake, setInputShake] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>("");
  const shakeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Trigger the input slots' shake animation to signal invalid input. */
  const shakeInput = (): void => {
    if (inputShake) return;
    setInputShake(true);
    shakeTimeoutRef.current = setTimeout(() => setInputShake(false), 500);
  };

  useEffect(() => {
    return () => {
      if (shakeTimeoutRef.current) clearTimeout(shakeTimeoutRef.current);
    };
  }, []);

  /** Remove the last typed letter, or shake the input if it's already empty. */
  const handleBackspace = (): void => {
    if (inputText.length === 0) return shakeInput();
    setInputText((prev) => prev.slice(0, -1));
  };

  /**
   * Submit the current input and clear the input slots.
   *
   * Shake the input if nothing has been typed yet.
   */
  const handleEnter = (): void => {
    if (inputText.length === 0) return shakeInput();
    onSubmit(inputText);
    setInputText("");
  };

  /**
   * Append a capitalized letter to the current input.
   *
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
     * Route any keydown with a modifier held (Ctrl, Alt, etc.) so browser/OS shortcuts aren't interpreted as letter input.
     *
     * @param e - The keyboard event.
     */
    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      const key = e.key.toUpperCase();
      if (key === "BACKSPACE") return handleBackspace();
      if (key === "ENTER") return handleEnter();
      if (key.length !== 1) return;
      handleChar(key);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [inputText]);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden p-2 pt-8 sm:pt-16 lg:px-6">
        <PracticeCharacterCard
          character={currentChar.char}
          definitions={currentChar.definition}
          hint={
            <div className="flex flex-col items-center">
              <span className="text-base font-medium">
                {currentChar.pinyin}
              </span>
              <span className="text-foreground/60 text-sm">
                ({pinyinToZhuyin(currentChar.pinyin)})
              </span>
            </div>
          }
        />

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
                <span className="flex flex-1 items-center text-sm">
                  {inputText[index]}
                </span>
                <span className="text-foreground/60 flex flex-1 items-center text-xs">
                  {LETTER_TO_KEY.get(inputText[index])?.radical}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 flex-col gap-1 p-2 lg:px-6">
        <button
          className="text-foreground border-border bg-elevated hover:bg-foreground/5 hover:border-foreground/30 focus-visible:ring-accent m-1.5 mr-0 cursor-pointer self-end rounded-sm border px-1.5 py-0.5 pr-0 transition-all outline-none focus-visible:ring-2 focus-visible:ring-inset"
          onClick={onToggleReferenceOpen}
          aria-expanded={isReferenceOpen}
        >
          <span className="flex items-center gap-1">
            Key References
            <Icon src={HelpCenterIcon} />
          </span>
        </button>
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
