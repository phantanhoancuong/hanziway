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
            className="cursor-pointer transition-colors hover:text-red-500"
            key={index}
            onClick={() => onCharacterClick(character)}
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
