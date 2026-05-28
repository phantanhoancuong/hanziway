export type CharacterEntry = {
  mandarin?: string;
  cantonese?: string;
  on?: string;
  kun?: string;
  korean?: string;
  vietnamese?: string;
  definition?: string;
  strokeCount?: string;
  simplified?: string;
  traditional?: string;
};

type Dictionary = Record<string, CharacterEntry>;

let dictionary: Dictionary | null = null;

const getDictionary = async (): Promise<Dictionary> => {
  if (dictionary) return dictionary;
  const response = await fetch("/dictionary.json");
  dictionary = await response.json();
  return dictionary!;
};

export const lookupCharacter = async (
  character: string,
): Promise<CharacterEntry | null> => {
  const dictionary = await getDictionary();
  return dictionary[character] ?? null;
};
