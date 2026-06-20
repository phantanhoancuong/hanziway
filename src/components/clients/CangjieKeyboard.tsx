"use client";

import { LETTER_TO_KEY } from "@/lib/cangjie";

const ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
];

/** The bottom row has special characters so they're handled differently */
const BOTTOM_LETTERS = ["X", "C", "V", "B", "N", "M"];

const ROW_WIDTHS = ["w-full", "w-[90%]"];

const CangjieKeyboard = ({
  onKey,
  onBack,
  onEnter,
}: {
  onKey: (key: string) => void;
  onBack: () => void;
  onEnter: () => void;
}) => {
  return (
    <div className="flex flex-col items-center gap-1">
      {ROWS.map((row, rowIndex) => (
        <div
          className={`flex justify-center ${ROW_WIDTHS[rowIndex]} gap-1`}
          key={rowIndex}
        >
          {row.map((letter) => {
            const key = LETTER_TO_KEY.get(letter);
            return (
              <button
                className="border-border flex-1 cursor-pointer border-2"
                key={letter}
                onClick={() => onKey(letter)}
                onMouseDown={(e) => e.preventDefault()}
              >
                <div className="flex flex-col items-center justify-center">
                  <div className="flex-2">{key!.letter}</div>
                  <div className="text-foreground/40 flex flex-1 items-center text-lg">
                    {key!.radical}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      ))}
      <div className={`flex w-full justify-center gap-1`}>
        <button
          className="border-border flex-2 cursor-pointer border-2"
          onClick={onBack}
          onMouseDown={(e) => e.preventDefault()}
        >
          Back
        </button>
        {BOTTOM_LETTERS.map((letter) => {
          const key = LETTER_TO_KEY.get(letter);
          return (
            <button
              className="border-border flex-1 cursor-pointer border-2"
              key={letter}
              onClick={() => onKey(letter)}
              onMouseDown={(e) => e.preventDefault()}
            >
              <div className="flex flex-col">
                <div className="flex-1 text-xl">{key!.letter}</div>
                <div className="text-foreground/40 flex-1 text-lg">
                  {key!.radical}
                </div>
              </div>
            </button>
          );
        })}
        <button
          className="border-border flex-2 cursor-pointer border-2"
          onClick={onEnter}
          onMouseDown={(e) => e.preventDefault()}
        >
          Enter
        </button>
      </div>
    </div>
  );
};

export default CangjieKeyboard;
