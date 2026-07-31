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
      className="border-border bg-elevated hover:bg-foreground/5 hover:border-foreground/30 text-foreground flex-2 cursor-pointer border-2 transition-colors"
      onClick={onClick}
      onMouseDown={(e) => e.preventDefault()}
    >
      {label}
    </button>
  );
};

export default ControlKey;
