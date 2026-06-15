export type CangjieKey = {
  letter: string;
  radical: string;
  name: string;
};

export const CANGJIE_KEYS: CangjieKey[] = [
  { letter: "A", radical: "日", name: "Sun" },
  { letter: "B", radical: "月", name: "Moon" },
  { letter: "C", radical: "金", name: "Gold" },
  { letter: "D", radical: "木", name: "Wood" },
  { letter: "E", radical: "水", name: "Water" },
  { letter: "F", radical: "火", name: "Fire" },
  { letter: "G", radical: "土", name: "Earth" },
  { letter: "H", radical: "竹", name: "Bamboo" },
  { letter: "I", radical: "戈", name: "Spear" },
  { letter: "J", radical: "十", name: "Ten" },
  { letter: "K", radical: "大", name: "Big" },
  { letter: "L", radical: "中", name: "Middle" },
  { letter: "M", radical: "一", name: "One" },
  { letter: "N", radical: "弓", name: "Bow" },
  { letter: "O", radical: "人", name: "Person" },
  { letter: "P", radical: "心", name: "Heart" },
  { letter: "Q", radical: "手", name: "Hand" },
  { letter: "R", radical: "口", name: "Mouth" },
  { letter: "S", radical: "尸", name: "Body" },
  { letter: "T", radical: "廿", name: "Twenty" },
  { letter: "U", radical: "山", name: "Mountain" },
  { letter: "V", radical: "女", name: "Woman" },
  { letter: "W", radical: "田", name: "Field" },
  { letter: "Y", radical: "卜", name: "Divination" },
];

export const LETTER_TO_KEY = new Map<string, CangjieKey>(
  CANGJIE_KEYS.map((k) => [k.letter, k])
);

export const RADICAL_TO_KEY = new Map<string, CangjieKey>(
  CANGJIE_KEYS.map((k) => [k.radical, k])
);

/**
 * Normalize a raw Cangjie input string to uppercase letters.
 *
 * Support either Latin characters (`etlo`) or radical characters (`水廿中人`) produced by a Cangjie IME.
 *
 * Return the uppercase letter sequence (`ETLO`).
 *
 * @param input- Raw string from a keyboard or IME.
 * @returns Uppercase Cangjie letter sequence.
 */
export const normalizeCangjieInput = (input: string): string =>
  [...input]
    .map((char) => {
      const upper = char.toUpperCase();
      if (LETTER_TO_KEY.has(upper)) return upper;
      if (RADICAL_TO_KEY.has(char)) return RADICAL_TO_KEY.get(char)!.letter;
      return null;
    })
    .filter(Boolean)
    .join("");
