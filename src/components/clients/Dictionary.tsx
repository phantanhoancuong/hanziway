"use client";

import { useState } from "react";

const colClasses = {
  1: "flex flex-col gap-1",
  2: "grid grid-cols-1 sm:grid-cols-2 gap-1",
} as const;

/**
 * Display a labelled content block.
 *
 * @param props.label - Section heading displayed above the content.
 * @param propos.children - Content rendered within the section body.
 */
export const Section = ({
  label,
  children,
  colCount = 1,
}: {
  label: string;
  children: React.ReactNode;
  colCount?: 1 | 2;
}) => (
  <div className="flex flex-col gap-1">
    <span className="text-xs font-semibold opacity-40 uppercase tracking-wider">
      {label}
    </span>

    <div className={colClasses[colCount]}>{children}</div>
  </div>
);

/**
 * Display a labelled content block but it's able to be expanded or hidden.
 *
 * @param props.label - Section heading displayed in the toggle button.
 * @param props.children - Content conditionally rendered when expanded.
 */
export const CollapsibleSection = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => {
  const [open, setOpen] = useState(true);

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 text-xs font-semibold opacity-40 uppercase tracking-wider cursor-pointer hover:opacity-70 transition-opacity w-fit"
      >
        <span>{open ? "▼" : "▶"}</span>
        <span>{label}</span>
      </button>
      {open && (
        <div className="flex flex-col gap-1 sm:grid sm:grid-cols-2">
          {children}
        </div>
      )}
    </div>
  );
};

/**
 * Display a single data field as a label-value pair.
 *
 * @param props.label - Descriptor shown before the value.
 * @param props.value - Rendered field value.
 */
export const Row = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex flex-col flex-base gap-0.5">
    <span className="text-xs opacity-40">{label}</span>
    <div className="text-sm">{value}</div>
  </div>
);
