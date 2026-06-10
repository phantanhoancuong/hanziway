import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes and resolve conflicts.
 *
 * @param inputs - Class names, conditionals, or objects to merge.
 * @returns A merged class string.
 */
export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs));
