"use client";

import { useEffect, useRef, useState } from "react";

import HanziWriter from "hanzi-writer";

import { cn } from "@/lib";

// Fixed rendering size for HanziWriter.
const WRITER_SIZE = 1200;

const CharacterWriter = ({
  character,
  isLoop = true,
  highlight = true,
}: {
  character: string;
  isLoop?: boolean;
  highlight?: boolean;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const targetDivRef = useRef<HTMLDivElement>(null);
  const hanziWriterRef = useRef<HanziWriter>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [scale, setScale] = useState(1);

  /** Track the container's width to compute the scale factor. */
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(([entry]) => {
      const newScale = entry.contentRect.width / WRITER_SIZE;
      setScale((prev) => (prev === newScale ? prev : newScale));
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

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
        renderer: "canvas",
        onLoadCharDataError: () => setLoadFailed(true),
      }
    );

    if (isLoop) hanziWriterRef.current.loopCharacterAnimation();

    return () => {
      if (targetDivRef.current) targetDivRef.current.innerHTML = "";
    };
  }, [character, loadFailed]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative aspect-square w-full overflow-hidden rounded-lg border-2",
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
        <span
          className="absolute inset-0 z-10 flex items-center justify-center"
          style={{ fontSize: WRITER_SIZE * scale * 0.56 }}
        >
          {character}
        </span>
      ) : (
        <div
          className="absolute top-0 left-0 z-10"
          style={{
            width: WRITER_SIZE,
            height: WRITER_SIZE,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          <div ref={targetDivRef} />
        </div>
      )}
    </div>
  );
};

export default CharacterWriter;
