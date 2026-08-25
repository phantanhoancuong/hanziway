"use client";

import { useEffect, useRef, useState } from "react";

import { Point, Stroke } from "@/types";

const CANVAS_SIZE = 400;
const STROKE_WIDTH = 16;

export default function DrawingCanvas({
  onRecognize,
}: {
  onRecognize: (canvas: HTMLCanvasElement) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const currentStroke = useRef<Stroke>([]);
  const isDrawing = useRef(false);

  /** Redraw completed strokes. */
  const redraw = (): void => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#000000";
    ctx.lineWidth = STROKE_WIDTH;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    for (const stroke of strokes) {
      if (stroke.length < 2) continue;

      ctx.beginPath();
      ctx.moveTo(stroke[0].x, stroke[0].y);

      for (const point of stroke.slice(1)) {
        ctx.lineTo(point.x, point.y);
      }

      ctx.stroke();
    }
  };

  useEffect(redraw, [strokes]);

  /**
   * Get the pointer's position relative to the canvas, in canvas coordinates.
   *
   * @param e - The pointer event.
   * @returns The point in canvas coordinates.
   */
  const getCanvasPoint = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  /**
   * Start a new stroke and capture the pointer.
   *
   * @param e - The pointer event.
   */
  const handlePointerDown = (
    e: React.PointerEvent<HTMLCanvasElement>
  ): void => {
    canvasRef.current?.setPointerCapture(e.pointerId);
    isDrawing.current = true;
    currentStroke.current = [getCanvasPoint(e)];
  };

  /**
   * Append the new point to the in-progress stroke, then draw only the newest line segment onto the canvas.
   *
   * The stroke is not committed to `strokes` state until `pointer-up`.
   *
   * @param e - The pointer event.
   */
  const handlePointerMove = (
    e: React.PointerEvent<HTMLCanvasElement>
  ): void => {
    if (!isDrawing.current) return;

    currentStroke.current = [...currentStroke.current, getCanvasPoint(e)];

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || currentStroke.current.length < 2) return;

    const points = currentStroke.current;

    ctx.strokeStyle = "#000000";
    ctx.lineWidth = STROKE_WIDTH;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.beginPath();
    ctx.moveTo(points[points.length - 2].x, points[points.length - 2].y);
    ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
    ctx.stroke();
  };

  /**
   * Finish the in-progress stroke and commit it to `strokes`.
   *
   * Capture the stroke into a local variable before resetting the ref because `setStroke`'s updater is async.
   *
   * @param e The pointer event.
   */
  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;

    isDrawing.current = false;

    const finishedStroke = currentStroke.current;
    currentStroke.current = [];

    if (finishedStroke.length > 0) {
      setStrokes((prev) => [...prev, finishedStroke]);
    }

    canvasRef.current?.releasePointerCapture(e.pointerId);
  };

  /** Clearing the canvas by removing every strokes. */
  const handleClear = (): void => setStrokes([]);

  /** Remove the most recently completed stroke. */
  const handleUndo = () => {
    setStrokes((prev) => prev.slice(0, -1));
  };

  const handleRecognize = () => {
    if (canvasRef.current) onRecognize(canvasRef.current);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="border-border touch-none rounded-lg border-2"
        style={{
          width: "min(80vw, 320px)",
          height: "min(80vw, 320px)",
        }}
        role="img"
        aria-label="Drawing canvas for handwritten character recognition"
      />
      <p className="text-foreground/60 text-sm">
        Only simplified characters are supported for now
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleUndo}
          disabled={strokes.length === 0}
          className="bg-elevated border-border text-foreground hover:bg-foreground/5 hover:border-foreground/30 focus-visible:ring-accent cursor-pointer rounded-full border px-4 py-2 text-sm font-medium transition-all outline-none focus-visible:ring-2 focus-visible:ring-inset disabled:cursor-default disabled:opacity-30"
        >
          Undo
        </button>
        <button
          type="button"
          onClick={handleClear}
          disabled={strokes.length === 0}
          className="bg-elevated border-border text-foreground hover:bg-foreground/5 hover:border-foreground/30 focus-visible:ring-accent cursor-pointer rounded-full border px-4 py-2 text-sm font-medium transition-all outline-none focus-visible:ring-2 focus-visible:ring-inset disabled:cursor-default disabled:opacity-30"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={handleRecognize}
          disabled={strokes.length === 0}
          className="bg-accent text-background focus-visible:ring-accent cursor-pointer rounded-full px-6 py-2 text-sm font-semibold transition-all outline-none hover:opacity-90 focus-visible:ring-2 disabled:cursor-default disabled:opacity-30"
        >
          Recognize
        </button>
      </div>
    </div>
  );
}
