"use client";

const PracticeCharacterCard = ({
  character,
  definitions,
  hint,
  heightClass = "h-64",
}: {
  character: string;
  definitions: string[];
  hint?: React.ReactNode;
  heightClass?: string;
}) => {
  return (
    <div
      className={`border-foreground/10 flex ${heightClass} w-full items-center justify-center gap-4 overflow-hidden rounded-sm border-2 p-2 sm:p-6`}
    >
      <div className="flex w-[30%] shrink-0 flex-col items-center">
        <div className="text-7xl leading-none font-light">{character}</div>
        {hint}
      </div>

      <div className="items-left flex min-w-0 flex-1 flex-col gap-1 overflow-hidden">
        <ol className="line-clamp-8 list-none">
          {definitions.map((def, j) => (
            <li key={j} className="text-sm sm:text-base">
              <span className="font-mono opacity-40">{j + 1}.</span> {def}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export default PracticeCharacterCard;
