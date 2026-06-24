import path from "node:path";
import fs from "fs-extra";
import { composeBaseVideo } from "../media/compose.js";
import { downloadFootage } from "../sourcing/download.js";
import { writeFootageManifest } from "../sourcing/manifest.js";
import { extractSearchQuery, searchFootage } from "../sourcing/search.js";

export async function sourceProjectFootage({ projectDir, query, count = 5, ratio = "16:9", duration = 90 }) {
  const brief = await readOptional(path.join(projectDir, "brief.md"));
  const shotPlan = await readOptional(path.join(projectDir, "shot_plan.md"));
  const searchQuery = extractSearchQuery({ query, brief, shotPlan });
  const search = await searchFootage({ query: searchQuery, count, ratio });
  const downloads = search.results.length > 0
    ? await downloadFootage({ projectDir, items: search.results })
    : [];

  const manifest = await writeFootageManifest({
    projectDir,
    query: searchQuery,
    downloads,
    providerResults: search.providerResults,
    fallbackSources: search.fallbackSources,
  });

  const baseVideo = downloads.some((item) => item.ok)
    ? await composeBaseVideo({
      clips: downloads,
      output: path.join(projectDir, "render", "base.mp4"),
      ratio,
      duration,
    })
    : null;

  return { query: searchQuery, downloads, manifest, baseVideo };
}

async function readOptional(file) {
  return (await fs.pathExists(file)) ? fs.readFile(file, "utf8") : "";
}
