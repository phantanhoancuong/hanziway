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
    <>
      {[...text].map((character, index) =>
        test(character) ? (
          <span
            className="hover:text-red-500 transition-colors cursor-pointer"
            key={index}
            onClick={() => onCharacterClick(character)}
          >
            {character}
          </span>
        ) : (
          <span key={index}>{character}</span>
        ),
      )}
    </>
  );
};

export default ClickableCharacters;
