import { Command } from "commander";
import { registerDoctor } from "./commands/doctor.js";
import { registerInit } from "./commands/init.js";
import { registerMux } from "./commands/mux.js";
import { registerPlan } from "./commands/plan.js";
import { registerProbe } from "./commands/probe.js";
import { registerRender } from "./commands/render.js";
import { registerScript } from "./commands/script.js";
import { registerSubtitles } from "./commands/subtitles.js";

export async function runCli(argv = process.argv) {
  const program = new Command();

  program
    .name("make-video")
    .description("AI-assisted video production CLI for planning, scripting, subtitles, FFmpeg rendering, and optional local backends.")
    .version("1.2.0")
    .showHelpAfterError();

  registerInit(program);
  registerPlan(program);
  registerScript(program);
  registerSubtitles(program);
  registerMux(program);
  registerRender(program);
  registerProbe(program);
  registerDoctor(program);

  await program.parseAsync(argv);
}
