import { detectBackends } from "../backends/detect.js";
import { printJson } from "../utils/io.js";

export function registerDoctor(program) {
  program
    .command("doctor")
    .description("Check required and optional make-video backends")
    .option("--json", "print machine-readable JSON")
    .option("--strict", "exit with code 1 when a required backend is missing")
    .action(async (options) => {
      const result = await detectBackends();
      if (options.json) {
        printJson(result);
        if (options.strict && !result.requiredOk) process.exitCode = 1;
        return;
      }

      printStatus("ffmpeg", result.ffmpeg);
      printStatus("ffprobe", result.ffprobe);
      for (const [name, provider] of Object.entries(result.aiProviders)) {
        printStatus(`AI:${name}`, provider);
      }
      printStatus("IndexTTS", result.indexTts);
      printStatus("HyperFrames", result.hyperframes);
      printStatus("JianYing", result.jianying);
      if (!result.requiredOk) {
        console.log("Required backend check failed. Run `make-video doctor --json` for machine-readable details.");
        if (options.strict) process.exitCode = 1;
      }
    });
}

function printStatus(name, status) {
  const marker = status.ok ? "OK" : status.required ? "ERROR" : "WARN";
  console.log(`[${marker}] ${name}: ${status.detail}`);
  if (!status.ok && status.installHint) console.log(`  install: ${status.installHint}`);
  if (!status.ok && status.degradation) console.log(`  degrade: ${status.degradation}`);
}
