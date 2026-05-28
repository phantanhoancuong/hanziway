"use client";

import { useState } from "react";

/**
 * Display a labelled content block.
 *
 * @param props.label - Section heading displayed above the content.
 * @param propos.children - Content rendered within the section body.
 */
export const Section = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-1">
    <span className="text-xs font-semibold opacity-40 uppercase tracking-wider">
      {label}
    </span>
    <div className="flex flex-col gap-0.5">{children}</div>
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
      {open && <div className="flex flex-col gap-0.5">{children}</div>}
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
  <p className="text-sm">
    <span className="opacity-60">{label}</span> {value}
  </p>
);
