export type CangjieKey = {
  letter: string;
  radical: string;
  name: string;
  nameChinese: string;
};

export const CANGJIE_KEYS: CangjieKey[] = [
  { letter: "A", radical: "日", name: "Sun", nameChinese: "日" },
  { letter: "B", radical: "月", name: "Moon", nameChinese: "月" },
  { letter: "C", radical: "金", name: "Gold", nameChinese: "金" },
  { letter: "D", radical: "木", name: "Wood", nameChinese: "木" },
  { letter: "E", radical: "水", name: "Water", nameChinese: "水" },
  { letter: "F", radical: "火", name: "Fire", nameChinese: "火" },
  { letter: "G", radical: "土", name: "Earth", nameChinese: "土" },
  { letter: "H", radical: "竹", name: "Bamboo", nameChinese: "竹" },
  { letter: "I", radical: "戈", name: "Spear", nameChinese: "戈" },
  { letter: "J", radical: "十", name: "Ten", nameChinese: "十" },
  { letter: "K", radical: "大", name: "Big", nameChinese: "大" },
  { letter: "L", radical: "中", name: "Middle", nameChinese: "中" },
  { letter: "M", radical: "一", name: "One", nameChinese: "一" },
  { letter: "N", radical: "弓", name: "Bow", nameChinese: "弓" },
  { letter: "O", radical: "人", name: "Person", nameChinese: "人" },
  { letter: "P", radical: "心", name: "Heart", nameChinese: "心" },
  { letter: "Q", radical: "手", name: "Hand", nameChinese: "手" },
  { letter: "R", radical: "口", name: "Mouth", nameChinese: "口" },
  { letter: "S", radical: "尸", name: "Body", nameChinese: "尸" },
  { letter: "T", radical: "廿", name: "Twenty", nameChinese: "廿" },
  { letter: "U", radical: "山", name: "Mountain", nameChinese: "山" },
  { letter: "V", radical: "女", name: "Woman", nameChinese: "女" },
  { letter: "W", radical: "田", name: "Field", nameChinese: "田" },
  { letter: "Y", radical: "卜", name: "Divination", nameChinese: "卜" },
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
