"use client";
import { useEffect, useRef, useState } from "react";

import HanziWriter from "hanzi-writer";

import { cn } from "@/lib";

/**
 * Display and animate a Chinese character.
 *
 * Size itself to 80% of its container width.
 * Fall back to displaying the character as text if `HanziWriter` does not have stroke data for it.
 *
 * @param props.character - The Chinese character to display.
 * @param props.isLoop - Whether to loop the stroke animation. Default to `true`.
 * @param props.highlight - Whether to show a red border. Default to `true`.
 */
const CharacterWriter = ({
  character,
  isLoop = true,
  highlight = true,
}: {
  character: string;
  isLoop?: boolean;
  highlight?: boolean;
}) => {
  // `HanziWriter` performs imperative DOM rendering outside React, so we have to use a direct element reference.
  const targetDivRef = useRef<HTMLDivElement>(null);
  // The writer instance is mutable and must not trigger React re-renders so we use a ref.
  const hanziWriterRef = useRef<HanziWriter>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<number>(0);
  const [loadFailed, setLoadFailed] = useState(false);

  // Observe the container and derive the writer size from its width.
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(([entry]) => {
      setSize(Math.floor(entry.contentRect.width * 0.8));
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Reset load failure state when character changes.
  useEffect(() => {
    setLoadFailed(false);
  }, [character]);

  useEffect(() => {
    if (!targetDivRef.current || size === 0 || loadFailed) return;

    hanziWriterRef.current = HanziWriter.create(
      targetDivRef.current,
      character,
      {
        width: size,
        height: size,
        padding: 5,
        strokeColor: highlight ? "#ef4444" : "#0c0a09",
        showCharacter: !highlight,
        onLoadCharDataError: () => setLoadFailed(true),
      }
    );

    if (isLoop) hanziWriterRef.current.loopCharacterAnimation();

    return () => {
      if (targetDivRef.current) targetDivRef.current.innerHTML = "";
    };
  }, [character, size, loadFailed]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex aspect-square w-full items-center justify-center rounded-lg border-2",
        highlight ? "border-accent" : "border-border",
        size === 0 && "invisible"
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
        <span className="relative z-10" style={{ fontSize: size * 0.7 }}>
          {character}
        </span>
      ) : (
        <div className="relative z-10" ref={targetDivRef} />
      )}
    </div>
  );
};

export default CharacterWriter;
