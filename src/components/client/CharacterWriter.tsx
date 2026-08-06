"use client";
import { useEffect, useRef, useState } from "react";

import HanziWriter from "hanzi-writer";

import { cn } from "@/lib";

// Initial size HanziWriter renders at internally.
const WRITER_SIZE = 300;

const CharacterWriter = ({
  character,
  isLoop = true,
  highlight = true,
}: {
  character: string;
  isLoop?: boolean;
  highlight?: boolean;
}) => {
  const targetDivRef = useRef<HTMLDivElement>(null);
  const hanziWriterRef = useRef<HanziWriter>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    setLoadFailed(false);
  }, [character]);

  useEffect(() => {
    if (!targetDivRef.current || loadFailed) return;

    hanziWriterRef.current = HanziWriter.create(
      targetDivRef.current,
      character,
      {
        width: WRITER_SIZE,
        height: WRITER_SIZE,
        padding: 5,
        strokeColor: highlight ? "#ef4444" : "#0c0a09",
        showCharacter: !highlight,
        onLoadCharDataError: () => setLoadFailed(true),
      }
    );

    // HanziWriter renders a fixed-size <svg> with no viewBox.
    // I give it one matching its own size, then stretch it to fill the wrapper with CSS.
    const svg = targetDivRef.current.querySelector("svg");
    if (svg) {
      svg.setAttribute("viewBox", `0 0 ${WRITER_SIZE} ${WRITER_SIZE}`);
      svg.style.width = "100%";
      svg.style.height = "100%";
      svg.style.display = "block";
    }

    if (isLoop) hanziWriterRef.current.loopCharacterAnimation();

    return () => {
      if (targetDivRef.current) targetDivRef.current.innerHTML = "";
    };
  }, [character, loadFailed]);

  return (
    <div
      className={cn(
        "@container relative flex aspect-square w-full items-center justify-center rounded-lg border-2",
        highlight ? "border-accent" : "border-border"
      )}
    >
      {highlight && (
        <svg
          className="absolute inset-0 z-0 h-full w-full"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <line
            x1="0"
            y1="50%"
            x2="100%"
            y2="50%"
            stroke="var(--border)"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          <line
            x1="50%"
            y1="0"
            x2="50%"
            y2="100%"
            stroke="var(--border)"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          <line
            x1="0"
            y1="0"
            x2="100%"
            y2="100%"
            stroke="var(--border)"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          <line
            x1="100%"
            y1="0"
            x2="0"
            y2="100%"
            stroke="var(--border)"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
        </svg>
      )}

      {loadFailed ? (
        <span className="relative z-10 text-[56cqw]">{character}</span>
      ) : (
        <div
          className="relative z-10 aspect-square w-[80%]"
          ref={targetDivRef}
        />
      )}
    </div>
  );
};

export default CharacterWriter;
