import fs from "fs-extra";
import { printJson } from "../utils/io.js";
import { resolvePath } from "../utils/paths.js";
import { createProject } from "../workflow/project.js";
import { sourceProjectFootage } from "../workflow/source.js";

export function registerSource(program) {
  program
    .command("source")
    .description("Search and download stock footage for a project")
    .requiredOption("--project <dir>", "project directory")
    .option("--query <text>", "search query")
    .option("--count <number>", "maximum clips to download", "5")
    .option("--ratio <ratio>", "target aspect ratio", "16:9")
    .option("--duration <seconds>", "target base video duration", "90")
    .action(async (options) => {
      const projectDir = resolvePath(options.project);
      if (!(await fs.pathExists(projectDir))) {
        await createProject(projectDir, { ratio: options.ratio, duration: options.duration });
      }
      const result = await sourceProjectFootage({
        projectDir,
        query: options.query,
        count: Number.parseInt(options.count, 10),
        ratio: options.ratio,
        duration: Number.parseFloat(options.duration),
      });
      printJson(result);
    });
}
