"use client";

import { Icon } from "@/components/server";

import { LETTER_TO_KEY } from "@/lib";
import { glyphTree } from "@/lib/auxiliary-glyphs";

const CangjieReferencePanel = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className="flex flex-1 flex-col gap-2 px-4 pb-10">
      <div className="bg-background sticky top-0 z-10 flex items-center justify-between pt-6 pb-2 lg:pt-10">
        <h1 className="text-lg font-medium">Key References</h1>
        <button
          className="text-foreground/40 border-border bg-elevated hover:bg-foreground/5 cursor-pointer rounded-sm border-2 px-2 py-1 text-sm"
          onClick={onClose}
        >
          Close
        </button>
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
