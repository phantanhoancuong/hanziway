import { CharacterEntry, getDictionary } from "@/lib";

/**
 * Map each NFD combining tone-mark character to its tone number.
 *
 * "5" is preserved for the neutral tone (no diacritic).
 */
const TONE_MARKS: Record<string, string> = {
  "\u0304": "1", // macron  ā
  "\u0301": "2", // acute   á
  "\u030c": "3", // caron   ǎ
  "\u0300": "4", // grave   à
};

/**
 * Map each toned ü variant to its ASCII "v" substitute plus tone digit.
 *
 * Each of these is a single precomposed Unicode character, so converting straight to a bare "v" would. Appending the digit here preserves it.
 */
const U_TONE_MAP: Record<string, string> = {
  ü: "v",
  ǖ: "v1",
  ǘ: "v2",
  ǚ: "v3",
  ǜ: "v4",
};

/**
 * Split a pinyin syllable into its toneless spelling and tone number.
 *
 * ü (and its toned forms) is converted to "v" (plus its tone digit, if any) before diacritic stripping, since ü's mark decomposes into
 * the same Unicode block as tone marks and would otherwise be silently stripped along with them, merging ü and u.
 *
 * @param pinyin - A pinyin syllable with or without diacritics, "v" for ü, or a trailing tone digit (1-5).
 * @returns The toneless, lowercase spelling and its tone ("1"-"4", or "5" for neutral).
 */
const decomposePinyin = (
  pinyin: string
): { toneless: string; tone: string } => {
  const withV = pinyin.toLowerCase().replace(/[üǖǘǚǜ]/g, (m) => U_TONE_MAP[m]);
  const withoutDigit = withV.replace(/[1-5]$/, "");
  const decomposed = withoutDigit.normalize("NFD");

  let tone = "5";
  for (const [mark, t] of Object.entries(TONE_MARKS)) {
    if (decomposed.includes(mark)) {
      tone = t;
      break;
    }
  }

  const explicitDigit = withV.match(/[1-5]$/)?.[0];
  if (explicitDigit) tone = explicitDigit;

  const toneless = decomposed.replace(/[\u0300-\u036f]/g, "");
  return { toneless, tone };
};

// Keyed by toneless syllable, then by tone number ("1"-"5").
type PinyinMap = Record<string, Record<string, Set<string>>>;

let pinyinMap: PinyinMap | null = null;

/**
 * Build and cache the pinyin reverse index map from the dictionary.
 *
 * @returns The pinyin reverse index.
 */
const getPinyinMap = async (): Promise<PinyinMap> => {
  if (pinyinMap) return pinyinMap;
  const dict = await getDictionary();
  const map: PinyinMap = {};

  for (const [char, entry] of Object.entries(dict)) {
    for (const reading of entry.r) {
      const { toneless, tone } = decomposePinyin(reading.m);

      map[toneless] ??= {};
      map[toneless][tone] ??= new Set();
      map[toneless][tone].add(char);
    }
  }

  pinyinMap = map;
  return map;
};

/**
 * Look up all characters matching a pinyin syllable.
 *
 * If the query includes a tone, only characters with that exact tone are returned.
 *
 * Otherwise, characters across all tones are returned.
 *
 * @param pinyin - Pinyin query, with or without diacritics, "v" for ü, or a trailing tone digit (1-5).
 * @returns Array of matching characters with their entries, sorted by commonness (lower HSK/TOCFL first). Empty if none match.
 */
export const searchByPinyin = async (
  pinyin: string
): Promise<{ char: string; entry: CharacterEntry }[]> => {
  const map = await getPinyinMap();
  const dict = await getDictionary();

  const hasExplicitTone =
    /[1-5]$/.test(pinyin) || pinyin !== decomposePinyin(pinyin).toneless;
  const { toneless, tone } = decomposePinyin(pinyin);
  const toneMap = map[toneless] ?? {};

  const chars = hasExplicitTone
    ? [...(toneMap[tone] ?? [])]
    : [...new Set(Object.values(toneMap).flatMap((set) => [...set]))];

  const rank = (entry: CharacterEntry): number =>
    Math.min(entry.hsk ?? Infinity, entry.tocfl ?? Infinity);

  return chars
    .map((char) => ({ char, entry: dict[char] }))
    .sort((a, b) => rank(a.entry) - rank(b.entry));
};

/**
 * Check whether typed pinyin matches a character's reading.
 *
 * @param typed - What the user typed (diacritics, digits, or "v" for ü all accepted).
 * @param correct - The character's actual reading, with diacritics.
 * @param tonePreference - Whether tone must match; false ignores tone entirely.
 * @returns Whether the typed answer counts as correct.
 */
export const isPinyinCorrect = (
  typed: string,
  correct: string,
  tonePreference: boolean
) => {
  const typedDecomposed = decomposePinyin(typed);
  const correctDecomposed = decomposePinyin(correct);

  if (typedDecomposed.toneless !== correctDecomposed.toneless) return false;

  if (!tonePreference) return true;

  return typedDecomposed.tone === correctDecomposed.tone;
};

/**
 * Format a pinyin reading as its digit-tone notation, e.g. "nǐ" -> "ni3".
 *
 * @param pinyin - Pinyin with diacritics.
 * @returns The same syllable in toneless-plus-digit form.
 */
export const toDigitPinyin = (pinyin: string): string => {
  const { toneless, tone } = decomposePinyin(pinyin);
  return `${toneless}${tone}`;
};
