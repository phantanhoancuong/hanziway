import type { StaticImageData } from "next/image";

import * as AuxiliaryGlyphs from "@/assets/auxiliary_glyphs";

/** Nested lookup of auxiliary glyph SVGs, keyed by Cangjie letter, then group, holding an ordered array of glyphs. */
type GlyphTree = Record<string, Record<string, StaticImageData[]>>;

/**
 * Reconstruct the letter/group/index structure from the flat barrel export names into a nested lookup tree.
 *
 * Every key in `namespace` must follow `Letter_Group_Index` convention produced by `generate-icon-index.mjs`.
 *
 * @param namespace - The flat namespace import of all glyph SVGs.
 * @returns A nested tree keyed by letter, then group, holding ordered SVG arrays.
 */
const buildGlyphTree = (
  namespace: Record<string, StaticImageData>
): GlyphTree => {
  const tree: GlyphTree = {};
  for (const [key, src] of Object.entries(namespace)) {
    const [letter, group, index] = key.split("_");

    tree[letter] ??= {};
    tree[letter][group] ??= [];
    tree[letter][group][Number(index)] = src;
  }
  return tree;
};

/** Precomputed glyph tree, built at module load. */
export const glyphTree = buildGlyphTree(AuxiliaryGlyphs);
