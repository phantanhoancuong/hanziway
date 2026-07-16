import { PRACTICE_MODE_OPTIONS } from "@/constants";

/** A character within an active or completed practice session. */
export type PracticeChar = {
  char: string;
  cj: string;
  pinyin: string;
  definition: string[];
  typed?: string;
};

/** Modes for the practice page. */
export type PracticeMode = (typeof PRACTICE_MODE_OPTIONS)[number]["value"];
