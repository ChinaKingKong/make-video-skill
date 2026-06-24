import path from "node:path";
import fs from "fs-extra";
import { execa } from "execa";
import { configuredProviders } from "../ai/providers.js";

export async function detectBackends() {
  const [ffmpeg, ffprobe, indexTts, hyperframes, jianying] = await Promise.all([
    detectCommand("ffmpeg", ["-version"], { required: true }),
    detectCommand("ffprobe", ["-version"], { required: true }),
    detectIndexTts(),
    detectHyperFrames(),
    detectJianYing(),
  ]);

  const backends = {
    ffmpeg,
    ffprobe,
    aiProviders: configuredProviders(),
    indexTts,
    hyperframes,
    jianying,
  };

  return {
    ...backends,
    requiredOk: [ffmpeg, ffprobe].every((backend) => backend.ok),
  };
}

async function detectCommand(command, args, options = {}) {
  try {
    const { stdout } = await execa(command, args);
    return {
      ok: true,
      required: Boolean(options.required),
      detail: firstLine(stdout) || `${command} available`,
    };
  } catch (error) {
    return {
      ok: false,
      required: Boolean(options.required),
      detail: commandInstallHint(command, error),
    };
  }
}

async function detectIndexTts() {
  const home = process.env.INDEXTTS_HOME || "/Users/lizhigang/Library/index-tts";
  const cli = path.join(home, "indextts", "cli_v2.py");
  const ok = await fs.pathExists(cli);
  return {
    ok,
    required: false,
    home,
    cli,
    detail: ok
      ? `IndexTTS2 CLI found at ${cli}`
      : "IndexTTS is optional. Set INDEXTTS_HOME to a checkout containing indextts/cli_v2.py when TTS voiceover is needed.",
    installHint:
      "Install or clone IndexTTS/IndexTTS2, download checkpoints, verify it can synthesize a short WAV, then export INDEXTTS_HOME=/path/to/index-tts.",
    degradation: "Without IndexTTS, make-video can still generate scripts, subtitles, project plans, and use user-provided audio for muxing.",
  };
}

async function detectHyperFrames() {
  const home = process.env.HYPERFRAMES_HOME || "/Users/lizhigang/Documents/Works/Agents/Handle/html-video";
  const cli = path.join(home, "packages", "cli", "dist", "bin.js");
  const ok = await fs.pathExists(cli);
  return {
    ok,
    required: false,
    home,
    cli,
    detail: ok
      ? `HyperFrames/html-video CLI found at ${cli}`
      : "HyperFrames is optional. Set HYPERFRAMES_HOME to a built html-video checkout.",
    degradation: "Without HyperFrames, make-video falls back to FFmpeg subtitle filters or programmatic overlay assets.",
  };
}

async function detectJianYing() {
  const home = process.env.JIANYING_HOME || process.env.JIANYING_EDITOR_HOME || "";
  if (!home) {
    return {
      ok: false,
      required: false,
      detail: "JianYing is optional. Set JIANYING_HOME or JIANYING_EDITOR_HOME when an automation backend is installed.",
      degradation: "Without JianYing, make-video can still export local MP4 files but cannot create editable JianYing drafts.",
    };
  }
  const ok = await fs.pathExists(home);
  return {
    ok,
    required: false,
    home,
    detail: ok ? `JianYing backend path found at ${home}` : `JianYing backend path not found: ${home}`,
    degradation: "Without JianYing, make-video can still export local MP4 files but cannot create editable JianYing drafts.",
  };
}

function firstLine(value) {
  return value.split(/\r?\n/).find(Boolean);
}

function commandInstallHint(command, error) {
  if (error?.code === "ENOENT") {
    return `${command} not found. Install it and ensure it is on PATH.`;
  }
  return `${command} check failed.`;
}
