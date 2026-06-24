import path from "node:path";
import fs from "fs-extra";
import { burnSubtitles, copyOrTranscode, fitAudioToVideo } from "../media/ffmpeg.js";
import { printJson } from "../utils/io.js";
import { resolvePath } from "../utils/paths.js";

export function registerRender(program) {
  program
    .command("render")
    .description("Run a basic FFmpeg render from a project directory")
    .requiredOption("--project <dir>", "project directory")
    .option("--video <file>", "base video, defaults to project/render/base.mp4 or project/base.mp4")
    .option("--audio <file>", "voiceover or final mix audio")
    .option("--subtitles <file>", "SRT/ASS subtitles to burn in")
    .option("--out <file>", "output video, defaults to project/exports/final.mp4")
    .action(async (options) => {
      const project = resolvePath(options.project);
      const video = await firstExisting([
        options.video && resolvePath(options.video),
        path.join(project, "render", "base.mp4"),
        path.join(project, "base.mp4"),
      ]);
      if (!video) {
        throw new Error("No base video found. Pass --video or create render/base.mp4.");
      }

      const out = options.out ? resolvePath(options.out) : path.join(project, "exports", "final.mp4");
      const subtitles = options.subtitles ? resolvePath(options.subtitles) : await firstExisting([
        path.join(project, "subtitles.srt"),
        path.join(project, "subtitles.ass"),
      ]);
      const audio = options.audio ? resolvePath(options.audio) : await firstExisting([
        path.join(project, "audio", "final_mix.wav"),
        path.join(project, "audio", "voiceover.wav"),
        path.join(project, "voiceover.wav"),
      ]);

      let current = video;
      const intermediate = path.join(project, "render", "with_subtitles.mp4");
      if (subtitles) {
        await burnSubtitles({ video: current, subtitles, output: intermediate });
        current = intermediate;
      }

      if (audio) {
        const result = await fitAudioToVideo({ video: current, audio, output: out });
        printJson(result);
      } else {
        const metadata = await copyOrTranscode({ input: current, output: out, format: "-c copy" });
        printJson({ output: out, metadata });
      }
    });
}

async function firstExisting(candidates) {
  for (const candidate of candidates.filter(Boolean)) {
    if (await fs.pathExists(candidate)) return candidate;
  }
  return null;
}
