"use client";

import { useEffect, useRef, useState } from "react";

import HanziWriter from "hanzi-writer";

import { cn } from "@/lib";

// Native render size tiers.
const SIZE_TIERS: { minWidth: number; size: number }[] = [
  { minWidth: 1024, size: 1200 },
  { minWidth: 640, size: 600 },
  { minWidth: 400, size: 400 },
  { minWidth: 0, size: 250 },
];

// Ceiling on the final size after the DPR multiplier.
const MAX_WRITER_SIZE = 1600;

// Core count treated like a heuristics for low power devices to downscale the rendering size.
const LOW_POWER_CORE_THRESHOLD = 4;
const LOW_POWER_MULTIPLIER = 0.5;

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

  const [writerSize, setWriterSize] = useState<number>(SIZE_TIERS[0].size);

  // Gate `HanziWriter.create()` until `writerSize` is calculated.
  // Start `false` so it doesn't affect hydration.
  const [sizeReady, setSizeReady] = useState(false);

  useEffect(() => {
    const width = typeof window !== "undefined" ? window.innerWidth : 1024;
    const tierSize =
      SIZE_TIERS.find((tier) => width >= tier.minWidth)?.size ??
      SIZE_TIERS[SIZE_TIERS.length - 1].size;

    const isLowPower =
      typeof navigator !== "undefined" &&
      "hardwareConcurrency" in navigator &&
      navigator.hardwareConcurrency <= LOW_POWER_CORE_THRESHOLD;

    // Screens with high DPR need more native resolution to stay sharp.
    const dpr =
      typeof window !== "undefined" ? (window.devicePixelRatio ?? 1) : 1;
    const dprMultiplier = Math.min(dpr, 3);

    const targetSize = isLowPower
      ? Math.round(tierSize * LOW_POWER_MULTIPLIER)
      : Math.min(Math.round(tierSize * dprMultiplier), MAX_WRITER_SIZE);

    setWriterSize(targetSize);
    setSizeReady(true);
  }, []);

  // Track the container's width to compute the scale factor.
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(([entry]) => {
      const newScale = entry.contentRect.width / writerSize;
      setScale((prev) => (prev === newScale ? prev : newScale));
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [writerSize]);

  useEffect(() => {
    setLoadFailed(false);
  }, [character]);

  useEffect(() => {
    if (!sizeReady || !targetDivRef.current) return;

    hanziWriterRef.current = HanziWriter.create(
      targetDivRef.current,
      character,
      {
        width: writerSize,
        height: writerSize,
        padding: 5,
        strokeColor: highlight ? "#ef4444" : "#0c0a09",
        showCharacter: !highlight,
        renderer: "canvas",
        delayBetweenStrokes: 700,
        onLoadCharDataError: () => setLoadFailed(true),
      }
    );

    if (isLoop) hanziWriterRef.current.loopCharacterAnimation();

    return () => {
      if (targetDivRef.current) targetDivRef.current.innerHTML = "";
    };
  }, [character, writerSize, highlight, isLoop, sizeReady]);

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label={`Stroke order animation for ${character}`}
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
          style={{ fontSize: `${writerSize * scale * 0.35}px` }}
          aria-hidden="true"
        >
          {character}
        </span>
      ) : (
        <div
          className="absolute top-0 left-0 z-10"
          aria-hidden="true"
          style={{
            width: writerSize,
            height: writerSize,
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
