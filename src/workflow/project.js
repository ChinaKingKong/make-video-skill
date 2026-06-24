import path from "node:path";
import fs from "fs-extra";

const projectDirs = ["assets", "audio", "render", "exports", "sources"];

export async function createProject(projectDir, options = {}) {
  await fs.ensureDir(projectDir);
  await Promise.all(projectDirs.map((dir) => fs.ensureDir(path.join(projectDir, dir))));

  const briefPath = path.join(projectDir, "brief.md");
  if (!(await fs.pathExists(briefPath)) || options.force) {
    await fs.writeFile(briefPath, briefTemplate(options), "utf8");
  }

  const manifestPath = path.join(projectDir, "make-video.json");
  if (!(await fs.pathExists(manifestPath)) || options.force) {
    await fs.writeJson(
      manifestPath,
      {
        name: path.basename(projectDir),
        createdAt: new Date().toISOString(),
        ratio: options.ratio || "16:9",
        duration: options.duration || null,
        language: options.language || "zh-CN",
        outputs: {
          final: "exports/final.mp4",
        },
      },
      { spaces: 2 },
    );
  }

  return {
    projectDir,
    files: [briefPath, manifestPath],
    dirs: projectDirs.map((dir) => path.join(projectDir, dir)),
  };
}

function briefTemplate(options) {
  return `# Video Brief

## Goal

${options.goal || "Describe the video goal here."}

## Constraints

- Platform: ${options.platform || "unspecified"}
- Ratio: ${options.ratio || "16:9"}
- Target duration: ${options.duration || "unspecified"}
- Language: ${options.language || "zh-CN"}
- Tone: ${options.tone || "clear and practical"}
- Subtitles: ${options.subtitles || "default on"}
- Export: ${options.export || "exports/final.mp4"}

## Assets

- Put user clips, images, screenshots, logos, and references in \`assets/\`.
- Put voiceover, music, and sound effects in \`audio/\`.

## Deliverables

- \`script.md\` or \`narration.txt\`
- \`shot_plan.md\`
- \`subtitles.srt\`
- \`exports/final.mp4\`
`;
}
