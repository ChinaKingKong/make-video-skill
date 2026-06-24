import path from "node:path";
import fs from "fs-extra";
import { composeBaseVideo } from "../media/compose.js";
import { downloadFootage } from "../sourcing/download.js";
import { writeFootageManifest } from "../sourcing/manifest.js";
import { extractSearchQuery, searchFootage } from "../sourcing/search.js";

export async function sourceProjectFootage({
  projectDir,
  query,
  count = 5,
  ratio = "16:9",
  duration = 90,
  localAssetDirs = [],
  cover,
} = {}) {
  const brief = await readOptional(path.join(projectDir, "brief.md"));
  const shotPlan = await readOptional(path.join(projectDir, "shot_plan.md"));
  const searchQuery = extractSearchQuery({ query, brief, shotPlan });
  const search = await searchFootage({ query: searchQuery, count, ratio });
  const downloads = search.results.length > 0
    ? await downloadFootage({ projectDir, items: search.results })
    : [];
  const localAssets = await collectLocalAssets(localAssetDirs);
  const clips = [...downloads, ...localAssets];

  const manifest = await writeFootageManifest({
    projectDir,
    query: searchQuery,
    downloads,
    localAssets,
    cover,
    providerResults: search.providerResults,
    fallbackSources: search.fallbackSources,
  });

  const baseVideo = clips.some((item) => item.ok) || cover
    ? await composeBaseVideo({
      clips,
      cover,
      output: path.join(projectDir, "render", "base.mp4"),
      ratio,
      duration,
    })
    : null;

  return { query: searchQuery, downloads, localAssets, cover, manifest, baseVideo };
}

async function readOptional(file) {
  return (await fs.pathExists(file)) ? fs.readFile(file, "utf8") : "";
}

async function collectLocalAssets(dirs) {
  const assets = [];
  for (const dir of dirs.filter(Boolean)) {
    if (!(await fs.pathExists(dir))) continue;
    const entries = await fs.readdir(dir);
    for (const entry of entries) {
      const file = path.join(dir, entry);
      const stat = await fs.stat(file);
      if (!stat.isFile() || !isVisualAsset(file)) continue;
      assets.push({
        ok: true,
        provider: "local",
        id: path.basename(file),
        file,
        pageUrl: file,
        author: "local",
        license: "local user-provided asset; verify rights before distribution",
      });
    }
  }
  return assets;
}

function isVisualAsset(file) {
  return /\.(mp4|mov|m4v|webm|png|jpe?g|webp|gif|bmp|tiff?)$/i.test(file);
}
