"use client";

import { pinyinToZhuyin } from "pinyin-zhuyin";

import { PracticeChar } from "@/types";

const ResultPanel = ({ session }: { session: PracticeChar[] }) => {
  const missedCount =
    session.length -
    session.filter((character) => character.typed === character.cj).length;
  return (
    <div className="flex flex-col gap-10">
      <div className="grid grid-cols-2 gap-4">
        {session.map((character, index) => (
          <div className="border-border border-2 p-4" key={index}>
            <div className="flex justify-between">
              <span className="flex gap-4">
                <h2>{character.char}</h2>
                <div className="flex gap-2">
                  <p>{character.pinyin}</p>
                  <p>{pinyinToZhuyin(character.pinyin)}</p>
                </div>
              </span>
              <span className="flex">{character.cj}</span>
            </div>

            <h2 className="truncate">You typed: {character.typed}</h2>
            <h2>{character.definition}</h2>
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        <button className="bg-elevated border-border hover:bg-foreground/5 hover:border-accent hover:text-accent h-12 flex-1 cursor-pointer rounded-sm border px-4 transition-all">
          Retry
        </button>
        {missedCount > 0 && (
          <button className="bg-elevated border-border hover:bg-foreground/5 hover:border-accent hover:text-accent h-12 flex-1 cursor-pointer rounded-sm border px-4 transition-all">
            Retry Missed ({missedCount})
          </button>
        )}
      </div>
    </div>
  );
};

export default ResultPanel;
