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

/** A compound word matched by {@link searchByWord}. */
export type CompoundMatch = {
  /** The compound word. */
  word: string;
  /** Mandarin pinyin with diacritic tone marks. */
  pinyin: string;
  /** English definition. */
  definition: string;
};

type Dictionary = Record<string, CharacterEntry>;

/** A deduped index of compounds, keyed by word text. See {@link getCompoundIndex}. */
type CompoundIndex = Map<string, CompoundMatch>;

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
 * Filter characters matching the given HSK and TOCFL levels.
 *
 * @param hskLevels - HSK levels to include (1-9).
 * @param tocflLevels - TOCFL levels to include (1-6).
 * @param requireCangjie - If true, only include characters that have a Cangjie code. Defaults to true.
 * @returns Array of matching character entries with their characters.
 */
export const filterCharactersByLevel = async (
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

let compoundIndex: CompoundIndex | null = null;

/**
 * Build and cache a deduped index of every compound in the dictionary, keyed by word text.
 *
 * @returns Promise resolving to the compound index.
 */
const getCompoundIndex = async (): Promise<CompoundIndex> => {
  if (compoundIndex) return compoundIndex;

  const dict = await getDictionary();
  const index: CompoundIndex = new Map();

  for (const entry of Object.values(dict)) {
    if (!entry.cp) continue;
    for (const [word, pinyin, definition] of entry.cp) {
      if (!index.has(word)) index.set(word, { word, pinyin, definition });
    }
  }

  compoundIndex = index;
  return compoundIndex;
};

/**
 * Look up a single compound by its exact word text.
 *
 * @param word - The compound word to look up.
 * @returns The compound match, or `null` if not found.
 */
export const lookupWord = async (
  word: string
): Promise<CompoundMatch | null> => {
  const index = await getCompoundIndex();
  return index.get(word) ?? null;
};

/**
 * Strip everything except CJK characters from `text` (used in proverbs with punctuation marks).
 *
 * @param text - Text to strip.
 * @returns Only the CJK characters from `text`, in order.
 */
const stripToCjk = (text: string): string =>
  [...text].filter((char) => CJK_RE.test(char)).join("");

/**
 * Search compounds by character sequence then rank by tier:
 * 1. Exact match.
 * 2. `query` starts with the found `word`.
 * 3. The found `word` starts with `query.
 * 4. Any other overlap.
 * Shorter words rank first within the same tier.
 *
 * @param query - Character sequence to search for (2+ characters).
 * @returns Array of mathcing compounds, most relevant first.
 */
export const searchByWord = async (query: string): Promise<CompoundMatch[]> => {
  const index = await getCompoundIndex();

  const matchRank = (word: string): number => {
    if (word === query) return 0;
    if (query.startsWith(word)) return 1;
    if (word.startsWith(query)) return 2;
    return 3;
  };

  return [...index.values()]
    .filter((match) => {
      const normalized = stripToCjk(match.word);

      if (normalized.length === 0) return false;
      return normalized.includes(query) || query.includes(normalized);
    })
    .sort((a, b) => {
      const rankA = matchRank(stripToCjk(a.word));
      const rankB = matchRank(stripToCjk(b.word));
      if (rankA !== rankB) return rankA - rankB;
      return a.word.length - b.word.length;
    });
};

/** Match a CJK character. Use with single characters only. */
export const CJK_RE = /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/u;
