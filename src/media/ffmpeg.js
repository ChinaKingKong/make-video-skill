import path from "node:path";
import fs from "fs-extra";
import { execa } from "execa";

export async function commandExists(command) {
  try {
    await execa(command, ["-version"]);
    return true;
  } catch {
    return false;
  }
}

export async function ffprobeJson(file) {
  const { stdout } = await execa("ffprobe", [
    "-v",
    "error",
    "-show_entries",
    "stream=index,codec_type,codec_name,width,height,sample_rate,channels",
    "-show_entries",
    "format=duration,size,bit_rate,format_name",
    "-of",
    "json",
    file,
  ]);
  return JSON.parse(stdout);
}

export async function duration(file) {
  const { stdout } = await execa("ffprobe", [
    "-v",
    "error",
    "-show_entries",
    "format=duration",
    "-of",
    "default=nk=1:nw=1",
    file,
  ]);
  return Number.parseFloat(stdout.trim());
}

export function atempoChain(factor) {
  const parts = [];
  let remaining = factor;
  while (remaining > 2) {
    parts.push(2);
    remaining /= 2;
  }
  while (remaining < 0.5) {
    parts.push(0.5);
    remaining /= 0.5;
  }
  parts.push(remaining);
  return parts.map((part) => `atempo=${part.toFixed(6)}`).join(",");
}

export async function fitAudioToVideo({ video, audio, output, tolerance = 0.25 }) {
  await fs.ensureDir(path.dirname(output));
  const videoDuration = await duration(video);
  const audioDuration = await duration(audio);
  const fitted = output.replace(/(\.[^.]+)?$/, "_fit.wav");

  let fittedAudio = audio;
  let filter = null;
  if (Math.abs(videoDuration - audioDuration) > tolerance) {
    const factor = audioDuration / videoDuration;
    filter = atempoChain(factor);
    await execa("ffmpeg", ["-y", "-i", audio, "-filter:a", filter, fitted], {
      stdio: "inherit",
    });
    fittedAudio = fitted;
  }

  await execa(
    "ffmpeg",
    [
      "-y",
      "-i",
      video,
      "-i",
      fittedAudio,
      "-map",
      "0:v:0",
      "-map",
      "1:a:0",
      "-c:v",
      "copy",
      "-c:a",
      "aac",
      "-b:a",
      "160k",
      "-shortest",
      output,
    ],
    { stdio: "inherit" },
  );

  return {
    videoDuration,
    audioDuration,
    fittedAudio,
    filter,
    output,
    metadata: await ffprobeJson(output),
  };
}

export async function burnSubtitles({ video, subtitles, output }) {
  await fs.ensureDir(path.dirname(output));
  await execa(
    "ffmpeg",
    [
      "-y",
      "-i",
      video,
      "-vf",
      `subtitles=${escapeFilterPath(subtitles)}`,
      "-c:a",
      "copy",
      output,
    ],
    { stdio: "inherit" },
  );
  return ffprobeJson(output);
}

export async function copyOrTranscode({ input, output, format }) {
  await fs.ensureDir(path.dirname(output));
  const args = ["-y", "-i", input];
  if (format) args.push(...format.split(" "));
  args.push(output);
  await execa("ffmpeg", args, { stdio: "inherit" });
  return ffprobeJson(output);
}

function escapeFilterPath(value) {
  return value.replaceAll("\\", "\\\\").replaceAll(":", "\\:").replaceAll("'", "\\'");
}
