import path from "node:path";
import fs from "fs-extra";
import ora from "ora";
import { generateVideoPlan } from "../ai/openai.js";
import { burnSubtitles, fitAudioToVideo } from "../media/ffmpeg.js";
import { scriptToSrt } from "../media/subtitles.js";
import { synthesizeIndexTts } from "../media/tts.js";
import { readValueOrFile, writeTextFile, printJson } from "../utils/io.js";
import { resolvePath } from "../utils/paths.js";
import { createProject } from "../workflow/project.js";
import { sourceProjectFootage } from "../workflow/source.js";

export function registerAuto(program) {
  program
    .command("auto")
    .description("Plan, source footage, subtitle, and render as much of a video as local assets allow")
    .requiredOption("--brief <textOrFile>", "brief text or path to a brief file")
    .option("--out <dir>", "output project directory", "make-video-project")
    .option("--duration <seconds>", "target duration", "90")
    .option("--ratio <ratio>", "target aspect ratio", "9:16")
    .option("--language <code>", "language", "zh-CN")
    .option("--provider <provider>", "AI provider: openai, deepseek, glm, minimax, claude", "openai")
    .option("--model <model>", "AI model name")
    .option("--api-key <key>", "AI provider API key")
    .option("--base-url <url>", "OpenAI-compatible base URL override")
    .option("--query <text>", "override footage search query")
    .option("--count <number>", "maximum clips to download", "5")
    .option("--voice <file>", "voice reference for IndexTTS automatic voiceover")
    .option("--tts-device <device>", "IndexTTS device, for example mps or cpu", "mps")
    .option("--skip-tts", "skip automatic IndexTTS voiceover generation")
    .action(async (options) => {
      const projectDir = resolvePath(options.out);
      const brief = await readValueOrFile(options.brief);
      const duration = Number.parseFloat(options.duration);
      await createProject(projectDir, { goal: brief, duration, ratio: options.ratio, language: options.language });

      const spinner = ora(`Generating video plan with ${options.provider}...`).start();
      try {
        const plan = await generateVideoPlan({
          brief,
          language: options.language,
          model: options.model,
          provider: options.provider,
          apiKey: options.apiKey,
          baseURL: options.baseUrl,
        });
        await writeTextFile(path.join(projectDir, "brief.md"), plan.brief);
        await writeTextFile(path.join(projectDir, "script.md"), plan.script);
        const narration = path.join(projectDir, "narration.txt");
        await writeTextFile(narration, plan.script);
        await writeTextFile(path.join(projectDir, "shot_plan.md"), plan.shot_plan);
        await writeTextFile(path.join(projectDir, "subtitle_notes.md"), plan.subtitle_notes);
        await writeTextFile(path.join(projectDir, "production_notes.md"), plan.production_notes);
        spinner.succeed("Video plan written");

        const source = await sourceProjectFootage({
          projectDir,
          query: options.query,
          count: Number.parseInt(options.count, 10),
          ratio: options.ratio,
          duration,
        });

        const subtitles = path.join(projectDir, "subtitles.srt");
        await writeTextFile(subtitles, scriptToSrt(plan.script, duration));

        let audio = await firstExisting([
          path.join(projectDir, "audio", "final_mix.wav"),
          path.join(projectDir, "audio", "voiceover.wav"),
          path.join(projectDir, "voiceover.wav"),
        ]);
        let tts = null;
        if (!audio && !options.skipTts) {
          tts = await synthesizeIndexTts({
            textFile: narration,
            output: path.join(projectDir, "audio", "voiceover.wav"),
            voice: options.voice && resolvePath(options.voice),
            device: options.ttsDevice,
          });
          if (tts.ok) {
            audio = tts.output;
          }
        }

        const baseVideo = source.baseVideo?.output;
        let final = null;
        if (baseVideo && audio) {
          const withSubtitles = path.join(projectDir, "render", "with_subtitles.mp4");
          await burnSubtitles({ video: baseVideo, subtitles, output: withSubtitles });
          final = await fitAudioToVideo({
            video: withSubtitles,
            audio,
            output: path.join(projectDir, "exports", "final.mp4"),
          });
        } else if (baseVideo) {
          const preview = path.join(projectDir, "exports", "final.mp4");
          const metadata = await burnSubtitles({ video: baseVideo, subtitles, output: preview });
          final = { output: preview, metadata, previewOnly: true };
        }

        printJson({ projectDir, source, subtitles, tts, audio, final, nextStep: nextStep({ baseVideo, audio, tts }) });
      } catch (error) {
        spinner.fail("Failed to auto-generate video project");
        throw error;
      }
    });
}

async function firstExisting(candidates) {
  for (const candidate of candidates) {
    if (await fs.pathExists(candidate)) return candidate;
  }
  return null;
}

function nextStep({ baseVideo, audio, tts }) {
  if (!baseVideo) return "Set PEXELS_API_KEY or PIXABAY_API_KEY, then rerun source/auto to download footage.";
  if (!audio && tts?.reason) return `${tts.reason} A subtitle-only preview was rendered; configure TTS and rerun auto for voiced output.`;
  if (!audio) return "A subtitle-only preview was rendered; configure IndexTTS or pass --voice to enable automatic voiceover.";
  return "Final video rendered.";
}
