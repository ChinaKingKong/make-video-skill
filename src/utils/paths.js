import path from "node:path";
import { fileURLToPath } from "node:url";

export const packageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);

export function resolvePath(value, cwd = process.cwd()) {
  return path.resolve(cwd, value);
}

export function outputPath(value, fallback, cwd = process.cwd()) {
  return resolvePath(value || fallback, cwd);
}
