import ora from "ora";
import { rewriteForNarration } from "../ai/openai.js";
import { readTextFile, writeTextFile } from "../utils/io.js";
import { outputPath, resolvePath } from "../utils/paths.js";

export function registerScript(program) {
  program
    .command("script")
    .description("Rewrite an article or draft into natural spoken narration")
    .requiredOption("--input <file>", "source article, outline, or draft")
    .option("--out <file>", "output narration file", "narration.txt")
    .option("--language <code>", "language", "zh-CN")
    .option("--provider <provider>", "AI provider: openai, deepseek, glm, minimax, claude", "openai")
    .option("--model <model>", "AI model name")
    .option("--api-key <key>", "AI provider API key; defaults to provider-specific environment variable")
    .option("--base-url <url>", "OpenAI-compatible base URL override")
    .action(async (options) => {
      const input = await readTextFile(resolvePath(options.input));
      const out = outputPath(options.out, "narration.txt");
      const spinner = ora(`Rewriting narration with ${options.provider}...`).start();
      try {
        const narration = await rewriteForNarration({
          input,
          language: options.language,
          model: options.model,
          provider: options.provider,
          apiKey: options.apiKey,
          baseURL: options.baseUrl,
        });
        await writeTextFile(out, narration);
        spinner.succeed(`Narration written to ${out}`);
      } catch (error) {
        spinner.fail("Failed to rewrite narration");
        throw error;
      }
    });
}
