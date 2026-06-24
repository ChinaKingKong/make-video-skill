import path from "node:path";
import fs from "fs-extra";
import { execa } from "execa";

export const defaultIndexTtsHome = "/Users/lizhigang/Library/index-tts";
export const defaultVoiceReference = "/Users/lizhigang/Downloads/Voices/新闻-铿锵.mp3";

export async function synthesizeIndexTts({
  textFile,
  output,
  voice,
  home = process.env.INDEXTTS_HOME || defaultIndexTtsHome,
  device = process.env.INDEXTTS_DEVICE || "mps",
  modelDir = process.env.INDEXTTS_MODEL_DIR || "checkpoints",
} = {}) {
  const cli = path.join(home, "indextts", "cli_v2.py");
  const voiceReference = voice || process.env.INDEXTTS_VOICE || process.env.MAKE_VIDEO_TTS_VOICE || defaultVoiceReference;

  if (!(await fs.pathExists(cli))) {
    return {
      ok: false,
      skipped: true,
      reason: `IndexTTS CLI not found at ${cli}. Set INDEXTTS_HOME to enable automatic voiceover.`,
      cli,
      home,
    };
  }

  if (!(await fs.pathExists(voiceReference))) {
    return {
      ok: false,
      skipped: true,
      reason: `Voice reference not found at ${voiceReference}. Pass --voice or set INDEXTTS_VOICE.`,
      cli,
      home,
      voice: voiceReference,
    };
  }

  await fs.ensureDir(path.dirname(output));

  const firstAttempt = await runIndexTts({
    home,
    cli,
    textFile,
    output,
    voice: voiceReference,
    modelDir,
    device,
  });
  if (firstAttempt.ok || device === "cpu") return firstAttempt;

  const retry = await runIndexTts({
    home,
    cli,
    textFile,
    output,
    voice: voiceReference,
    modelDir,
    device: "cpu",
  });

  return {
    ...retry,
    firstAttempt: {
      ok: false,
      device,
      reason: firstAttempt.reason,
    },
  };
}

async function runIndexTts({ home, cli, textFile, output, voice, modelDir, device }) {
  const args = [
    "run",
    "python",
    cli,
    "synth",
    "--text-file",
    textFile,
    "--voice",
    voice,
    "--output",
    output,
    "--model-dir",
    modelDir,
    "--device",
    device,
    "--no-fp16",
    "--no-deepspeed",
    "--no-cuda-kernel",
    "--force",
    "--verbose",
  ];

  try {
    await execa("uv", args, { cwd: home, stdio: "inherit" });
    return {
      ok: true,
      output,
      voice,
      home,
      cli,
      modelDir,
      device,
    };
  } catch (error) {
    return {
      ok: false,
      output,
      voice,
      home,
      cli,
      modelDir,
      device,
      reason: error?.shortMessage || error?.message || "IndexTTS synthesis failed.",
    };
  }
}
