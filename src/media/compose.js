import path from "node:path";
import fs from "fs-extra";
import { execa } from "execa";
import { ffprobeJson } from "./ffmpeg.js";

export async function composeBaseVideo({ clips, output, ratio = "16:9", duration = 90 }) {
  const usable = clips.filter((clip) => clip.ok && clip.file);
  if (usable.length === 0) return null;

  await fs.ensureDir(path.dirname(output));
  const tmpDir = path.join(path.dirname(output), ".make-video-compose");
  await fs.emptyDir(tmpDir);

  const { width, height } = dimensionsForRatio(ratio);
  const segmentDuration = Math.max(2, Number(duration) / usable.length);
  const normalized = [];

  for (const [index, clip] of usable.entries()) {
    const file = path.join(tmpDir, `clip-${String(index).padStart(3, "0")}.mp4`);
    await execa(
      "ffmpeg",
      [
        "-y",
        "-stream_loop",
        "-1",
        "-i",
        clip.file,
        "-t",
        String(segmentDuration),
        "-vf",
        `scale=${width}:${height}:force_original_aspect_ratio=increase,crop=${width}:${height},setsar=1,fps=30`,
        "-an",
        "-c:v",
        "libx264",
        "-preset",
        "veryfast",
        "-crf",
        "24",
        file,
      ],
      { stdio: "inherit" },
    );
    normalized.push(file);
  }

  const concatList = path.join(tmpDir, "concat.txt");
  await fs.writeFile(concatList, normalized.map((file) => `file '${file.replaceAll("'", "'\\''")}'`).join("\n"));
  await execa(
    "ffmpeg",
    ["-y", "-f", "concat", "-safe", "0", "-i", concatList, "-c", "copy", output],
    { stdio: "inherit" },
  );
  await fs.remove(tmpDir);
  return { output, metadata: await ffprobeJson(output) };
}

function dimensionsForRatio(ratio) {
  if (ratio === "9:16") return { width: 1080, height: 1920 };
  if (ratio === "1:1") return { width: 1080, height: 1080 };
  if (ratio === "4:5") return { width: 1080, height: 1350 };
  return { width: 1920, height: 1080 };
}
