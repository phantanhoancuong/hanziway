import { readdirSync, statSync, writeFileSync } from "fs";
import { join, relative } from "path";

/**
 * Generate a barrel file (index.ts) re-exporting every SVG under a folder,
 * named by its folder path plus a 0-indexed position within that folder.
 *
 * Usage: `node generate-icon-index.mjs <folder>`.
 */
const targetDir = process.argv[2];
if (!targetDir) {
  console.error("Usage: node generate-icon-index.mjs <folder>");
  process.exit(1);
}

const OUTPUT_FILE = join(targetDir, "index.ts");

/**
 * Recusrively collect all .svg file paths under a directory.
 *
 * @param dir - Directory to scan.
 * @returns Absolute paths to every .svg file found.
 */
function collectSvgFiles(dir) {
  const results = [];

  for (const entry of readdirSync(dir).sort()) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      results.push(...collectSvgFiles(fullPath));
    } else if (entry.endsWith(".svg")) {
      results.push(fullPath);
    }
  }

  return results;
}

/**
 * Convert a folder path into a JS identifier prefix, e.g. `"A/0"` into `"A_0"`
 *
 * @param folderRelativePath - Folder path relative to the taget directory.
 * @returns A valid identifier prefix (without file index).
 */
function folderToIdentifierPrefix(folderRelativePath) {
  if (!folderRelativePath) return "";

  const segments = folderRelativePath.split(/[\\/]/);

  const parts = segments.map((segment) => {
    const words = segment.split(/[^a-zA-Z0-9]+/).filter(Boolean);
    return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join("");
  });

  return parts.join("_");
}

const allFiles = collectSvgFiles(targetDir);

if (allFiles.length === 0) {
  console.warn(`No .svg files found under ${targetDir}`);
}

// Group files by folder so each folder gets its own 0-indexed count.
const byFolder = new Map();

for (const fullPath of allFiles) {
  const folderRelPath = relative(targetDir, join(fullPath, ".."));
  const normalizedFolder = folderRelPath === "." ? "" : folderRelPath;

  if (!byFolder.has(normalizedFolder)) {
    byFolder.set(normalizedFolder, []);
  }
  byFolder.get(normalizedFolder).push(fullPath);
}

// Track identifiers to catch collisions across folders.
const seen = new Map();
const lines = [];

for (const [folderRelPath, filesInFolder] of byFolder) {
  const prefix = folderToIdentifierPrefix(folderRelPath);

  filesInFolder.forEach((fullPath, index) => {
    const relPath = relative(targetDir, fullPath);

    let identifier = prefix ? `${prefix}_${index}` : `${index}`;

    if (/^[0-9]/.test(identifier)) {
      identifier = `Icon${identifier}`;
    }

    if (seen.has(identifier)) {
      const count = seen.get(identifier) + 1;
      seen.set(identifier, count);
      console.warn(
        `Duplicate identifier "${identifier}" from "${relPath}" — suffixing with ${count}`
      );
      identifier = `${identifier}_${count}`;
    } else {
      seen.set(identifier, 1);
    }

    const importPath = `./${relPath.split("\\").join("/")}`;

    lines.push(`export { default as ${identifier} } from "${importPath}";`);
  });
}

writeFileSync(OUTPUT_FILE, lines.join("\n") + "\n");
console.log(`Generated ${allFiles.length} exports -> ${OUTPUT_FILE}`);
