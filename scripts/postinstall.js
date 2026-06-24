#!/usr/bin/env node

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const isGlobalInstall = process.env.npm_config_global === "true";
if (!isGlobalInstall) process.exit(0);

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packageBin = path.join(packageRoot, "bin", "make-video.js");
const prefix = process.env.npm_config_prefix;
const npmBinDir = prefix ? path.join(prefix, "bin") : null;
const pathEntries = (process.env.PATH || "").split(path.delimiter).filter(Boolean);

if (npmBinDir && pathEntries.includes(npmBinDir)) {
  process.exit(0);
}

const shimDir = findWritablePathDir(pathEntries);
if (!shimDir) {
  printPathInstructions(npmBinDir);
  process.exit(0);
}

const shimPath = path.join(shimDir, "make-video");
try {
  if (fs.existsSync(shimPath)) {
    const stat = fs.lstatSync(shimPath);
    if (stat.isSymbolicLink() && path.resolve(path.dirname(shimPath), fs.readlinkSync(shimPath)) === packageBin) {
      process.exit(0);
    }
    printPathInstructions(npmBinDir);
    process.exit(0);
  }

  fs.symlinkSync(packageBin, shimPath);
  console.log(`[make-video] Created command shim: ${shimPath}`);
} catch {
  printPathInstructions(npmBinDir);
}

function findWritablePathDir(entries) {
  const home = os.homedir();
  const preferred = [
    path.join(home, ".local", "bin"),
    path.join(home, "bin"),
    "/usr/local/bin",
  ];

  for (const dir of [...preferred, ...entries]) {
    if (!entries.includes(dir)) continue;
    try {
      fs.mkdirSync(dir, { recursive: true });
      fs.accessSync(dir, fs.constants.W_OK);
      return dir;
    } catch {
      // Try the next PATH directory.
    }
  }
  return null;
}

function printPathInstructions(binDir) {
  if (!binDir) return;
  console.log(`[make-video] npm installed the command in ${binDir}`);
  console.log(`[make-video] Add it to PATH to run make-video directly:`);
  console.log(`export PATH="${binDir}:$PATH"`);
}
