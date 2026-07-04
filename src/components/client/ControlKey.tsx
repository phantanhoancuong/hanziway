"use client";

const ControlKey = ({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) => {
  return (
    <button
      className="border-border bg-elevated hover:bg-foreground/5 flex-2 cursor-pointer border-2"
      onClick={onClick}
      onMouseDown={(e) => e.preventDefault()}
    >
      {label}
    </button>
  );
};

export default ControlKey;
