import path from "node:path";
import fs from "fs-extra";
import { packageRoot } from "../utils/paths.js";

const referenceFiles = [
  "production-workflows.md",
  "spoken-scriptwriting.md",
  "captions-audio.md",
  "sourcing.md",
  "qc-and-fallbacks.md",
  "hyperframes-motion.md",
  "jianying-integration.md",
];

export async function loadReferenceContext(files = referenceFiles) {
  const chunks = [];
  for (const file of files) {
    const fullPath = path.join(packageRoot, "references", file);
    if (await fs.pathExists(fullPath)) {
      const content = await fs.readFile(fullPath, "utf8");
      chunks.push(`## ${file}\n\n${content.trim()}`);
    }
  }
  return chunks.join("\n\n---\n\n");
}
