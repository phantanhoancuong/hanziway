import { cn } from "@/lib/cn";

/**
 * Display a labelled content block.
 *
 * @param props.label - Section heading displayed above the content.
 * @param props.children - Content rendered within the section body.
 * @param props.className - Additional class names for the content container.
 * @returns
 */
export const Section = ({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className="flex flex-col gap-1">
    <span className="text-base font-semibold tracking-wider uppercase opacity-40">
      {label}
    </span>
    <div className={cn("grid gap-1", className)}>{children}</div>
  </div>
);
