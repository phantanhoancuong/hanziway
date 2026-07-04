"use client";

import { ControlKey, LetterKey } from "@/components/client";

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
        <ControlKey label="Back" onClick={onBack} />
        {BOTTOM_LETTERS.map((letter) => (
          <LetterKey key={letter} letter={letter} onChar={onChar} />
        ))}
        <ControlKey label="Enter" onClick={onEnter} />
      </div>
    </div>
  );
};

export default CangjieKeyboard;
