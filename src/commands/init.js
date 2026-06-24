import { createProject } from "../workflow/project.js";
import { resolvePath } from "../utils/paths.js";

export function registerInit(program) {
  program
    .command("init")
    .description("Create a make-video project workspace")
    .argument("<dir>", "project directory")
    .option("--goal <text>", "video goal")
    .option("--platform <name>", "target platform")
    .option("--ratio <ratio>", "aspect ratio", "16:9")
    .option("--duration <value>", "target duration")
    .option("--language <code>", "language", "zh-CN")
    .option("--tone <text>", "tone")
    .option("--force", "overwrite generated starter files")
    .action(async (dir, options) => {
      const result = await createProject(resolvePath(dir), options);
      console.log(`Created make-video project: ${result.projectDir}`);
      for (const file of result.files) console.log(`  file ${file}`);
      for (const item of result.dirs) console.log(`  dir  ${item}`);
    });
}
