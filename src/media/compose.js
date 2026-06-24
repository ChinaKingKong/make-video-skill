import path from "node:path";
import fs from "fs-extra";
import { execa } from "execa";
import { ffprobeJson } from "./ffmpeg.js";

export async function composeBaseVideo({ clips, cover, output, ratio = "16:9", duration = 90 }) {
  const usable = uniqueClips([
    cover && { ok: true, file: cover, provider: "local", id: "cover", role: "cover" },
    ...clips,
  ].filter((clip) => clip?.ok && clip.file));
  if (usable.length === 0) return null;

  await fs.ensureDir(path.dirname(output));
  const tmpDir = path.join(path.dirname(output), ".make-video-compose");
  await fs.emptyDir(tmpDir);

  const { width, height } = dimensionsForRatio(ratio);
  const coverDuration = usable[0]?.role === "cover" ? Math.min(4, Math.max(2, Number(duration) * 0.015)) : 0;
  const remainingDuration = Math.max(2, Number(duration) - coverDuration);
  const nonCoverCount = Math.max(1, usable.length - (coverDuration ? 1 : 0));
  const normalized = [];

  for (const [index, clip] of usable.entries()) {
    const file = path.join(tmpDir, `clip-${String(index).padStart(3, "0")}.mp4`);
    const segmentDuration = clip.role === "cover" ? coverDuration : Math.max(2, remainingDuration / nonCoverCount);
    const inputArgs = isStillImageFile(clip.file)
      ? ["-loop", "1", "-i", clip.file]
      : ["-stream_loop", "-1", "-i", clip.file];
    await execa(
      "ffmpeg",
      [
        "-y",
        ...inputArgs,
        "-t",
        String(segmentDuration),
        "-vf",
        `scale=${width}:${height}:force_original_aspect_ratio=increase,crop=${width}:${height},setsar=1,fps=30,format=yuv420p`,
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

function isStillImageFile(file) {
  return /\.(png|jpe?g|webp|bmp|tiff?)$/i.test(file);
}

function uniqueClips(clips) {
  const seen = new Set();
  return clips.filter((clip) => {
    const key = path.resolve(clip.file);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
