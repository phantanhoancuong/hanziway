"use client";

import { cn } from "@/lib";

const ClickableCharacters = ({
  text,
  test,
  onCharacterClick,
  heading = false,
}: {
  text: string;
  test: (character: string) => boolean;
  onCharacterClick: (character: string) => void;
  heading?: boolean;
}) => {
  return (
    <span>
      {[...text].map((character, index) =>
        test(character) ? (
          <button
            type="button"
            key={index}
            onClick={() => onCharacterClick(character)}
            aria-label={`Look up ${character}`}
            className={cn(
              "focus-visible:text-accent focus-visible:ring-accent font-inherit inline cursor-pointer rounded-sm border-none bg-transparent p-0 text-inherit transition-colors outline-none focus-visible:ring-2",
              heading ? "hover:text-accent" : "text-accent hover:text-accent/80"
            )}
          >
            {character}
          </button>
        ) : (
          character
        )
      )}
    </span>
  );
};

export default ClickableCharacters;
