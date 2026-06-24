import fs from "fs-extra";
import path from "node:path";

export async function readTextFile(file) {
  return fs.readFile(file, "utf8");
}

export async function writeTextFile(file, content) {
  await fs.ensureDir(path.dirname(file));
  await fs.writeFile(file, content.endsWith("\n") ? content : `${content}\n`, "utf8");
}

export async function readValueOrFile(value) {
  if (!value) return "";
  if (await fs.pathExists(value)) {
    return readTextFile(value);
  }
  return value;
}

export function printJson(value) {
  console.log(JSON.stringify(value, null, 2));
}
