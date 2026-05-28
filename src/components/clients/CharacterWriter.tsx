"use client";
import { useEffect, useRef } from "react";

import HanziWriter from "hanzi-writer";

/**
 * Display and animate a Hanzi character.
 */
const CharacterWriter = ({ character }: { character: string }) => {
  // HanziWriter performs imperative DOM rendering outside React, so we have to use a direct element reference.
  const targetDivRef = useRef<HTMLDivElement>(null);
  // The writer instance is mutable and must not trigger React re-renders so we use a ref.
  const hanziWriterRef = useRef<HanziWriter>(null);

  useEffect(() => {
    if (!targetDivRef.current) return;

    hanziWriterRef.current = HanziWriter.create(
      targetDivRef.current,
      character,
      {
        width: 100,
        height: 100,
        padding: 5,
        strokeColor: `#ff0000`,
      },
    );

    hanziWriterRef.current.loopCharacterAnimation();

    return () => {
      if (targetDivRef.current) targetDivRef.current.innerHTML = "";
    };
  }, [character]);

  return <div ref={targetDivRef} />;
};

export default CharacterWriter;
