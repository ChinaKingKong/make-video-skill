import path from "node:path";
import fs from "fs-extra";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

export async function downloadFootage({ projectDir, items }) {
  const footageDir = path.join(projectDir, "assets", "footage");
  await fs.ensureDir(footageDir);

  const downloads = [];
  for (const item of items) {
    const file = path.join(footageDir, `${safeName(item.provider)}-${safeName(item.id)}.mp4`);
    if (!(await fs.pathExists(file))) {
      const response = await fetch(item.downloadUrl);
      if (!response.ok || !response.body) {
        downloads.push({ ...item, ok: false, error: `download failed: ${response.status}` });
        continue;
      }
      await pipeline(Readable.fromWeb(response.body), fs.createWriteStream(file));
    }
    downloads.push({ ...item, ok: true, file });
  }
  return downloads;
}

function safeName(value) {
  return String(value || "clip").replace(/[^a-z0-9_-]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();
}
