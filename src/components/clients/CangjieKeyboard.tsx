"use client";

import { LetterKey } from "@/components/clients";

const ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
];

/** The bottom row has special characters so they're handled differently */
const BOTTOM_LETTERS = ["X", "C", "V", "B", "N", "M"];

const ROW_WIDTHS = ["w-full", "w-[90%]"];

const CangjieKeyboard = ({
  onChar,
  onBack,
  onEnter,
}: {
  onChar: (char: string) => void;
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
          {row.map((letter) => (
            <LetterKey key={letter} letter={letter} onChar={onChar} />
          ))}
        </div>
      ))}
      <div className="flex w-full justify-center gap-1">
        <button
          className="border-border bg-elevated hover:bg-foreground/5 flex-2 cursor-pointer border-2"
          onClick={onBack}
          onMouseDown={(e) => e.preventDefault()}
        >
          Back
        </button>
        {BOTTOM_LETTERS.map((letter) => (
          <LetterKey key={letter} letter={letter} onChar={onChar} />
        ))}
        <button
          className="border-border bg-elevated hover:bg-foreground/5 flex-2 cursor-pointer border-2"
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
