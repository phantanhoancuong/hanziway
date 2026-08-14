"use client";

import { useEffect, useState } from "react";

import { ClickableCharacters } from "@/components/client";
import { CJK_RE, CompoundMatch, lookupCharacter } from "@/lib";

export default function CompoundDetail({
  word,
  match,
  onCharacterClick,
}: {
  word: string;
  match: CompoundMatch | undefined;
  onCharacterClick: (character: string) => void;
}) {
  const [charPinyin, setCharPinyin] = useState<Map<string, string>>(new Map());

  const uniqueChars = [
    ...new Set([...word].filter((char) => CJK_RE.test(char))),
  ];

  useEffect(() => {
    Promise.all(
      uniqueChars.map(async (char) => {
        const entry = await lookupCharacter(char);
        return [char, entry?.r[0]?.m ?? ""] as const;
      })
    ).then((pairs) => setCharPinyin(new Map(pairs)));
  }, [word]);

  if (!match) {
    return <p className="text-foreground/60 text-sm">No entry found</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="text-4xl font-bold">
          <ClickableCharacters
            text={word}
            test={(char) => CJK_RE.test(char)}
            onCharacterClick={onCharacterClick}
            heading
          />
        </div>
        <div className="text-foreground/60 text-lg">{match.pinyin}</div>
        <div className="text-base">{match.definition}</div>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-foreground/40 text-xs font-semibold tracking-wider uppercase">
          Characters
        </span>
        <div className="flex flex-wrap gap-2">
          {uniqueChars.map((char, i) => (
            <button
              key={i}
              onClick={() => onCharacterClick(char)}
              className="bg-elevated border-border hover:border-foreground/40 flex w-20 cursor-pointer flex-col items-center gap-0.5 rounded-lg border p-3 text-left transition-colors outline-none"
            >
              <span className="text-2xl">{char}</span>
              <span className="text-foreground/60 text-xs">
                {charPinyin.get(char) ?? ""}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
