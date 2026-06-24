import { scriptToSrt } from "../media/subtitles.js";
import { readTextFile, writeTextFile } from "../utils/io.js";
import { outputPath, resolvePath } from "../utils/paths.js";

export function registerSubtitles(program) {
  program
    .command("subtitles")
    .description("Generate a basic SRT file from a narration script")
    .requiredOption("--script <file>", "narration script")
    .requiredOption("--duration <seconds>", "target media duration in seconds")
    .option("--out <file>", "output SRT file", "subtitles.srt")
    .action(async (options) => {
      const script = await readTextFile(resolvePath(options.script));
      const duration = Number.parseFloat(options.duration);
      if (!Number.isFinite(duration) || duration <= 0) {
        throw new Error("--duration must be a positive number.");
      }
      const out = outputPath(options.out, "subtitles.srt");
      await writeTextFile(out, scriptToSrt(script, duration));
      console.log(`Subtitles written to ${out}`);
    });
}
