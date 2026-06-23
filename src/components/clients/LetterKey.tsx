"use client";

import { LETTER_TO_KEY } from "@/lib/cangjie";

const LetterKey = ({
  letter,
  onChar,
  flexClass = "flex-1",
}: {
  letter: string;
  onChar: (char: string) => void;
  flexClass?: string;
}) => {
  const key = LETTER_TO_KEY.get(letter)!;
  return (
    <button
      className={`border-border ${flexClass} bg-elevated hover:bg-foreground/5 cursor-pointer border-2`}
      onClick={() => onChar(letter)}
      onMouseDown={(e) => e.preventDefault()}
    >
      <div className="flex flex-col items-center justify-center">
        <div className="flex-2">{key.letter}</div>
        <div className="text-foreground/40 flex flex-1 items-center text-lg">
          {key.radical}
        </div>
      </div>
    </button>
  );
};

export default LetterKey;
