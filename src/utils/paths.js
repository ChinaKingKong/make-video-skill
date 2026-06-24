import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";

export const packageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);

export function resolvePath(value, cwd = process.cwd()) {
  return path.resolve(cwd, expandHomePath(value));
}

export function outputPath(value, fallback, cwd = process.cwd()) {
  return resolvePath(value || fallback, cwd);
}

export function expandHomePath(value) {
  if (typeof value !== "string") return value;
  if (value === "~") return os.homedir();
  if (value.startsWith("~/")) return path.join(os.homedir(), value.slice(2));
  return value;
}
