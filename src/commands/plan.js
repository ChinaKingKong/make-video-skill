import path from "node:path";
import fs from "fs-extra";
import ora from "ora";
import { generateVideoPlan } from "../ai/openai.js";
import { createProject } from "../workflow/project.js";
import { readValueOrFile, writeTextFile } from "../utils/io.js";
import { resolvePath } from "../utils/paths.js";

export function registerPlan(program) {
  program
    .command("plan")
    .description("Generate a brief, script, and shot plan with an AI provider")
    .requiredOption("--brief <textOrFile>", "brief text or path to a brief file")
    .option("--out <dir>", "output project directory", "make-video-project")
    .option("--language <code>", "language", "zh-CN")
    .option("--provider <provider>", "AI provider: openai, deepseek, glm, minimax, claude", "openai")
    .option("--model <model>", "AI model name")
    .option("--api-key <key>", "AI provider API key; defaults to provider-specific environment variable")
    .option("--base-url <url>", "OpenAI-compatible base URL override")
    .action(async (options) => {
      const outDir = resolvePath(options.out);
      const brief = await readValueOrFile(options.brief);
      await createProject(outDir, { goal: brief, language: options.language });

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
        await fs.ensureDir(outDir);
        await writeTextFile(path.join(outDir, "brief.md"), plan.brief);
        await writeTextFile(path.join(outDir, "script.md"), plan.script);
        await writeTextFile(path.join(outDir, "shot_plan.md"), plan.shot_plan);
        await writeTextFile(path.join(outDir, "subtitle_notes.md"), plan.subtitle_notes);
        await writeTextFile(path.join(outDir, "production_notes.md"), plan.production_notes);
        spinner.succeed(`Video plan written to ${outDir}`);
      } catch (error) {
        spinner.fail("Failed to generate video plan");
        throw error;
      }
    });
}
