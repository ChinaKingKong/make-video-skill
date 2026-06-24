import { Command } from "commander";
import fs from "node:fs/promises";
import path from "node:path";
import { registerAuto } from "./commands/auto.js";
import { registerDoctor } from "./commands/doctor.js";
import { registerInit } from "./commands/init.js";
import { registerMux } from "./commands/mux.js";
import { registerPlan } from "./commands/plan.js";
import { registerProbe } from "./commands/probe.js";
import { registerRender } from "./commands/render.js";
import { registerScript } from "./commands/script.js";
import { registerSource } from "./commands/source.js";
import { registerSubtitles } from "./commands/subtitles.js";
import { packageRoot } from "./utils/paths.js";

export async function runCli(argv = process.argv) {
  const program = new Command();
  const version = await readPackageVersion();

  program
    .name("make-video")
    .description("AI-assisted video production CLI for planning, scripting, subtitles, FFmpeg rendering, and optional local backends.")
    .version(version)
    .showHelpAfterError();

  registerInit(program);
  registerPlan(program);
  registerAuto(program);
  registerScript(program);
  registerSource(program);
  registerSubtitles(program);
  registerMux(program);
  registerRender(program);
  registerProbe(program);
  registerDoctor(program);

  await program.parseAsync(argv);
}

async function readPackageVersion() {
  const packageJson = JSON.parse(
    await fs.readFile(path.join(packageRoot, "package.json"), "utf8"),
  );
  return packageJson.version;
}
