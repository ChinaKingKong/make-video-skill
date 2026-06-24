import { ffprobeJson } from "../media/ffmpeg.js";
import { printJson } from "../utils/io.js";
import { resolvePath } from "../utils/paths.js";

export function registerProbe(program) {
  program
    .command("probe")
    .description("Inspect a media file with ffprobe")
    .argument("<file>", "media file")
    .action(async (file) => {
      printJson(await ffprobeJson(resolvePath(file)));
    });
}
