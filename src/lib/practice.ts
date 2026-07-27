import { isPinyinCorrect } from "./pinyin";
import { PracticeChar, PracticeMode } from "@/types";

/**
 * Check whether a practice session character was answered correctly, using
 * the correctness rule for whichever practice mode was active.
 *
 * @param character - The session character to check.
 * @param practiceMode - Which practice mode was active.
 * @param tonePreference - Whether tone must match, when practiceMode is "pinyin".
 * @returns Whether the character's typed answer counts as correct.
 */
export const isPracticeCorrect = (
  character: PracticeChar,
  practiceMode: PracticeMode,
  tonePreference: boolean
): boolean =>
  practiceMode === "cangjie"
    ? character.cj === character.typed
    : isPinyinCorrect(character.typed ?? "", character.pinyin, tonePreference);
