import { fitAudioToVideo } from "../media/ffmpeg.js";
import { printJson } from "../utils/io.js";
import { resolvePath } from "../utils/paths.js";

export function registerMux(program) {
  program
    .command("mux")
    .description("Fit a voiceover to a video and replace the audio track")
    .requiredOption("--video <file>", "base video")
    .requiredOption("--audio <file>", "voiceover WAV/MP3/audio file")
    .requiredOption("--out <file>", "output video")
    .option("--tolerance <seconds>", "duration tolerance before fitting", "0.25")
    .action(async (options) => {
      const result = await fitAudioToVideo({
        video: resolvePath(options.video),
        audio: resolvePath(options.audio),
        output: resolvePath(options.out),
        tolerance: Number.parseFloat(options.tolerance),
      });
      printJson(result);
    });
}
