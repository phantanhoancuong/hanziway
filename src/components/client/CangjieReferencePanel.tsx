"use client";

import { pinyinToZhuyin } from "pinyin-zhuyin";

import { Icon } from "@/components/server";

import { LETTER_TO_KEY, glyphTree } from "@/lib";

import { PracticeChar } from "@/types";
const CangjieReferencePanel = ({
  currentChar,
  onClose,
}: {
  currentChar: PracticeChar;
  onClose: () => void;
}) => {
  return (
    <div className="flex flex-1 flex-col gap-2 px-4 pb-10">
      <div className="bg-background sticky top-0 z-10 pt-6 pb-2 lg:pt-10">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-medium">Key References</h1>
          <button
            className="text-foreground/40 border-border bg-elevated hover:bg-foreground/5 cursor-pointer rounded-sm border-2 px-2 py-1 text-sm"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <div className="border-foreground/10 mt-2 flex w-fit items-center gap-3 rounded-sm border-2 px-3 py-2 lg:hidden">
          <span className="text-foreground/40 text-xs font-semibold tracking-wider uppercase">
            Current
          </span>
          <span className="text-3xl leading-none font-light">
            {currentChar.char}
          </span>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{currentChar.pinyin}</span>
            <span className="text-foreground/60 text-xs">
              ({pinyinToZhuyin(currentChar.pinyin)})
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-6">
        {Object.entries(glyphTree).map(([letter, groups]) => (
          <div key={letter} className="flex flex-col gap-2">
            <span className="text-foreground/40 pl-2 text-base font-semibold tracking-wider uppercase">
              {letter} {`(${LETTER_TO_KEY.get(letter)!.radical})`}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(groups).map(([group, svgs], i, arr) => (
                <div
                  key={group}
                  className="flex flex-wrap items-center gap-1.5"
                >
                  {svgs.map((src, index) =>
                    src ? (
                      <div
                        key={index}
                        className="bg-elevated border-border flex size-9 items-center justify-center rounded-sm border"
                      >
                        <Icon src={src} className="text-foreground h-7 w-7" />
                      </div>
                    ) : null
                  )}
                  {i < arr.length - 1 && (
                    <div className="bg-border mx-1 h-6 w-px" />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CangjieReferencePanel;
