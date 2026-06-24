import path from "node:path";
import { writeTextFile } from "../utils/io.js";

export async function writeFootageManifest({ projectDir, query, downloads, localAssets = [], cover, providerResults, fallbackSources }) {
  const lines = [
    "# Footage Manifest",
    "",
    `Generated at: ${new Date().toISOString()}`,
    `Search query: ${query}`,
    "",
    "## Downloaded Footage",
    "",
  ];

  const successful = downloads.filter((item) => item.ok);
  if (successful.length === 0) {
    lines.push("No footage was downloaded automatically.", "");
  } else {
    for (const item of successful) {
      lines.push(`### ${item.provider}:${item.id}`);
      lines.push("");
      lines.push(`- File: \`${path.relative(projectDir, item.file)}\``);
      lines.push(`- Source: ${item.pageUrl}`);
      lines.push(`- Author: ${item.author}`);
      lines.push(`- License note: ${item.license}`);
      lines.push(`- Reuse caveat: verify current source terms before commercial reuse.`);
      lines.push("");
    }
  }

  lines.push("## Local Visual Assets", "");
  if (cover) {
    lines.push(`- Cover: \`${path.relative(projectDir, cover)}\``);
  }
  if (localAssets.length === 0) {
    lines.push("No local visual assets were imported.", "");
  } else {
    for (const item of localAssets) {
      lines.push(`- \`${item.file}\` — ${item.license}`);
    }
    lines.push("");
  }

  lines.push("## Provider Status", "");
  for (const result of providerResults) {
    lines.push(`- ${result.provider}: ${providerSummary(result)}`);
  }

  lines.push("", "## Manual Fallback Sources", "");
  for (const source of fallbackSources) {
    lines.push(`- ${source.name}: ${source.url} — ${source.note}`);
  }

  const file = path.join(projectDir, "footage_manifest.md");
  await writeTextFile(file, lines.join("\n"));
  return file;
}

function providerSummary(result) {
  if (result.ok) return `${result.results.length} result(s)`;
  if (result.missingKey) return `missing ${result.missingKey}`;
  return result.error || "unavailable";
}
