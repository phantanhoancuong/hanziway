/**
 * Compare two "major.minor.patch" version strings numerically.
 *
 * @param a - First version.
 * @param b - Second version.
 * @returns Negative if `a < b`, positive if `a > b`, 0 if equal.
 */
export const compareVersions = (a: string, b: string): number => {
  const partsA = a.split(".").map(Number);
  const partsB = b.split(".").map(Number);

  for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
    const diff = (partsA[i] ?? 0) - (partsB[i] ?? 0);
    if (diff !== 0) return diff;
  }

  return 0;
};
