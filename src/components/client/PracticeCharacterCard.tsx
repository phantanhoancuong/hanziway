"use client";

import { cn } from "@/lib";

const PracticeCharacterCard = ({
  character,
  definitions,
  hint,
  heightClass = "h-64",
  mergeBottom = false,
}: {
  character: string;
  definitions: string[];
  hint?: React.ReactNode;
  heightClass?: string;
  mergeBottom?: boolean;
}) => {
  return (
    <div
      className={cn(
        "border-foreground/10 flex w-full items-center justify-center gap-4 overflow-hidden rounded-sm border-2 p-2 sm:p-6",
        heightClass,
        mergeBottom && "sm:rounded-b-none sm:border-b-0"
      )}
    >
      <div className="flex w-[30%] shrink-0 flex-col items-center">
        <div className="text-7xl leading-none font-light">{character}</div>
        {hint}
      </div>

      <div className="definitions-scroll items-left flex min-w-0 flex-1 flex-col self-stretch overflow-y-auto">
        <div className="m-auto">
          <ol className="list-none">
            {definitions.map((def, j) => (
              <li key={j} className="text-sm sm:text-base">
                <span className="font-mono opacity-40">{j + 1}.</span> {def}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
};

export default PracticeCharacterCard;
