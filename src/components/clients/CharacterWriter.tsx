"use client";
import { useEffect, useRef, useState } from "react";

import HanziWriter from "hanzi-writer";

/**
 * Display and animate a Hanzi character.
 *
 * The Hanzi character sizes itself to 80% of its container width.
 *
 * @param props.character - The Chinese character to display.
 */
const CharacterWriter = ({ character }: { character: string }) => {
  // HanziWriter performs imperative DOM rendering outside React, so we have to use a direct element reference.
  const targetDivRef = useRef<HTMLDivElement>(null);
  // The writer instance is mutable and must not trigger React re-renders so we use a ref.
  const hanziWriterRef = useRef<HanziWriter>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<number>(0);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(([entry]) => {
      setSize(Math.floor(entry.contentRect.width * 0.8));
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!targetDivRef.current || size === 0) return;

    hanziWriterRef.current = HanziWriter.create(
      targetDivRef.current,
      character,
      {
        width: size,
        height: size,
        padding: 5,
        strokeColor: `#ff0000`,
      },
    );

    hanziWriterRef.current.loopCharacterAnimation();

    return () => {
      if (targetDivRef.current) targetDivRef.current.innerHTML = "";
    };
  }, [character, size]);

  return (
    <div
      ref={containerRef}
      className="w-full aspect-square flex items-center justify-center border-2 border-red-500"
    >
      <div ref={targetDivRef} />
    </div>
  );
};

export default CharacterWriter;
