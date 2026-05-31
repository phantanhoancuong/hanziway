/**
 * A character entry from the dictionary
 */
export type CharacterEntry = {
  /** Mandarin pinyin with diacritic tone marks. */
  m?: string;
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
  /** English definition. Cross-references use the format of `word [pinyin]`. */
  d?: string;
  /** Total stroke count. */
  sc?: string;
  /** Simplified Chinese variant of this character. Omitted when the character is script-neutral. */
  s?: string;
  /**
   * Common compounds containing this character, sourced from CC-CEDICT and filtered to HSK 3.0 and TOCFL word lists. Each tuple is either:
   * - `[word, pinyin, definition]` for script-neutral compound.
   * - `[trad, simp, pinyin, definition]`.
   */
  cp?: ([string, string, string] | [string, string, string, string])[];
};

/**
 * Result of a character lookup, the key is returned to determine the script form that is being inspected.
 */
export type CharacterLookupResult = {
  key: string;
  entry: CharacterEntry;
};

type Dictionary = Record<string, CharacterEntry>;

let dictionary: Dictionary | null = null;

let index: Map<string, string> | null = null;

/**
 * Fetch and cache the dictionary from `/dictionary.json`.
 *
 * Build the trad/simp reverse index on first load.
 */
const getDictionary = async (): Promise<Dictionary> => {
  if (dictionary) return dictionary;
  const response = await fetch("/dictionary.json");
  dictionary = await response.json();

  index = new Map();
  for (const [trad, entry] of Object.entries(dictionary!)) {
    index.set(trad, trad);
    if (entry.s) index.set(entry.s, trad);
  }

  return dictionary!;
};

/**
 * Look up a single character in the dictionary. Accept both traditional and simplified forms.
 *
 * @param character - The Chinese character to look up.
 * @returns The lookup result containing the key and character entry data, or `null` if not found.
 */
export const lookupCharacter = async (
  character: string,
): Promise<CharacterLookupResult | null> => {
  const dictionary = await getDictionary();
  const key = index!.get(character);
  if (!key) return null;
  return { key, entry: dictionary[key] };
};

/**
 * Match a single CJK ideograph.
 * Use with single characters only.
 */
export const CJK_RE = /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/u;
