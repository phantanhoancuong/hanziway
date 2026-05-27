"use client";

import HanziWriter from "hanzi-writer";
import { useEffect, useRef, useState } from "react";

const CharacterWriter = ({ character }: { character: string }) => {
  const targetDivRef = useRef<HTMLDivElement>(null);
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
