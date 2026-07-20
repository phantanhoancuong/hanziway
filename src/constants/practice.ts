export const SESSION_SIZE_OPTIONS: number[] = [5, 10, 15, 20, 25, 30];

export const PRACTICE_MODE_OPTIONS = [
  { label: "Cangjie", value: "cangjie" },
  { label: "Pinyin", value: "pinyin" },
] as const;

export const TONE_PREFERENCE_OPTIONS = [
  { label: "Tones", value: true },
  { label: "No Tones", value: false },
] as const;

export const MAX_CANGJIE_LENGTH = 5;
