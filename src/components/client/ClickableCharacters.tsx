"use client";

const ClickableCharacters = ({
  text,
  test,
  onCharacterClick,
}: {
  text: string;
  test: (character: string) => boolean;
  onCharacterClick: (character: string) => void;
}) => {
  return (
    <span>
      {[...text].map((character, index) =>
        test(character) ? (
          <span
            className="hover:text-accent focus-visible:text-accent focus-visible:ring-accent cursor-pointer rounded-sm transition-colors outline-none focus-visible:ring-2"
            key={index}
            role="button"
            tabIndex={0}
            onClick={() => onCharacterClick(character)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onCharacterClick(character);
              }
            }}
          >
            {character}
          </span>
        ) : (
          character
        )
      )}
    </span>
  );
};

export default ClickableCharacters;
