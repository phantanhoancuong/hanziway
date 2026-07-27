export type CharacterReading = {
  /** Mandarin pinyin with diacritic tone marks. */
  m: string;
  /** English definition. Cross-references use the format of `word [pinyin]`. */
  d: string[];
};

/** A character entry from the dictionary. */
export type CharacterEntry = {
  /** List of readings (mandarin pronunciation and definition pairs) for the character. */
  r: CharacterReading[];
  /** Cantonese Jyutping romanization. */
  c?: string;
  /** Japanese on'yomi in romaji, space-separated. */
  on?: string;
  /** Japanese kun'yomi in romaji, space-separated. */
  kun?: string;
  /** Korean Hangul reading. */
  k?: string;
  /** Vietnamese Hán-Việt reading. */
  v?: string;

  /** Total stroke count. */
  sc?: string;
  /**
   * Related variant forms of this character.
   * Omitted when the character has no known variants.
   */
  var?: string[];
  /**
   * Common compounds containing this character, sourced from CC-CEDICT and filtered to HSK and TOCFL word lists.
   * Each tuple is `[word, pinyin, definition]` in the same script as the entry.
   */
  cp?: [string, string, string][];

  /** Cangjie input code (e.g. `ETLO`). Omitted when unavailable. */
  cj?: string;
  /** HSK level (1–7, where 7 means HSK 7-9). Omitted when none. */
  hsk?: number;
  /** TOCFL level (1–6). Omitted when none. */
  tocfl?: number;
};

type Dictionary = Record<string, CharacterEntry>;

let dictionary: Dictionary | null = null;

/**
 * Fetch and cache the dictionary from `/dictionary.json`.
 *
 * @returns Promise resolving to the dictionary data.
 */
export const getDictionary = async (): Promise<Dictionary> => {
  if (dictionary) return dictionary;
  const response = await fetch("/dictionary.json");
  dictionary = await response.json();
  return dictionary!;
};

/**
 * Look up a single character in the dictionary. Accept both traditional and simplified forms.
 *
 * @param character - The Chinese character to look up.
 * @returns The lookup result containing the key and character entry data, or `null` if not found.
 */
export const lookupCharacter = async (
  character: string
): Promise<CharacterEntry | null> => {
  const dict = await getDictionary();
  return dict[character] ?? null;
};

/**
 * Get all characters matching the given HSK and TOCFL levels.
 *
 * @param hskLevels - HSK levels to include (1-9).
 * @param tocflLevels - TOCFL levels to include (1-6).
 * @param requireCangjie - If true, only include characters that have a Cangjie code. Defaults to true.
 * @returns Array of matching character entries with their characters.
 */
export const getCharactersByLevel = async (
  hskLevels: number[],
  tocflLevels: number[],
  requireCangjie: boolean = true
): Promise<{ char: string; entry: CharacterEntry }[]> => {
  const dict = await getDictionary();
  const hskSet = new Set(hskLevels);
  const tocflSet = new Set(tocflLevels);

  return Object.entries(dict)
    .filter(
      ([, entry]) =>
        (!requireCangjie || entry.cj !== undefined) &&
        ((entry.hsk !== undefined && hskSet.has(entry.hsk)) ||
          (entry.tocfl !== undefined && tocflSet.has(entry.tocfl)))
    )
    .map(([char, entry]) => ({ char, entry }));
};

/**
 * Match a single CJK ideograph.
 * Use with single characters only.
 */
export const CJK_RE = /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/u;
