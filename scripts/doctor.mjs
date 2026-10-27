#!/usr/bin/env node
/**
 * One-command sanity check after cloning.
 *
 * Prints exactly one thing the user has to act on: the absolute folder path to
 * paste into chrome://extensions. Works on Windows, macOS and Linux.
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");

const REQUIRED = [
  "manifest.json",
  "background.js",
  "settings.js",
  "sidepanel.html",
  "sidepanel.js",
  "content.js",
  "options.html",
  "options.js",
  "i18n.js",
  "exporters.js",
  "prompts/translation.md",
];

let failures = 0;
const ok = (message) => console.log(`  [ok]   ${message}`);
const warn = (message) => console.log(`  [warn] ${message}`);
const bad = (message) => {
  failures += 1;
  console.log(`  [fail] ${message}`);
};

const platformName =
  process.platform === "win32"
    ? "Windows"
    : process.platform === "darwin"
      ? "macOS"
      : "Linux";

console.log("");
console.log(`TubeScribe doctor`);
console.log(`  ${platformName} ${os.release()}  |  Node ${process.versions.node}`);
console.log(`  project: ${ROOT}`);
console.log("");

console.log("Checks");
const nodeMajor = Number(process.versions.node.split(".")[0]);
if (nodeMajor >= 20) ok(`Node ${process.versions.node} (20 or newer required)`);
else bad(`Node ${process.versions.node} is too old. Install Node 20 or newer: https://nodejs.org`);

let manifest = null;
try {
  manifest = JSON.parse(fs.readFileSync(path.join(ROOT, "manifest.json"), "utf8"));
  ok(`manifest.json is valid JSON: ${manifest.name} ${manifest.version}`);
} catch (error) {
  bad(`manifest.json is missing or invalid: ${error.message}`);
}

if (manifest) {
  if (manifest.manifest_version === 3) ok("Manifest V3");
  else bad("manifest_version must be 3");

  if (manifest.name === "TubeScribe") ok("extension name matches this fork");
  else warn(`extension name is "${manifest.name}", expected TubeScribe`);

  for (const host of ["https://api.notion.com/*", "https://openapi.biji.com/*"]) {
    if ((manifest.host_permissions || []).includes(host)) ok(`host permission ${host}`);
    else warn(`missing host permission ${host}; knowledge-base export will fail`);
  }
}

const missing = REQUIRED.filter((file) => !fs.existsSync(path.join(ROOT, file)));
if (missing.length === 0) ok(`all ${REQUIRED.length} core files present`);
else bad(`missing files: ${missing.join(", ")}`);

const promptFile = path.join(ROOT, "prompts", "translation.md");
if (fs.existsSync(promptFile)) {
  const text = fs.readFileSync(promptFile, "utf8");
  const crlf = (text.match(/\r\n/g) || []).length;
  if (crlf === 0) ok("prompts use LF line endings");
  else
    warn(
      `prompts currently use CRLF (${crlf} lines). This build normalises them at load time, so translation still works, but LF is the supported layout.`,
    );
}

const gitDir = path.join(ROOT, ".git");
if (fs.existsSync(gitDir)) ok("git repository present (updates via git pull)");
else warn("no .git folder; this copy cannot be updated with git pull");

console.log("");
console.log("Next step — load it in Chrome");
console.log("  1. Open  chrome://extensions");
console.log("  2. Turn on  Developer mode");
console.log("  3. Click  Load unpacked  and paste this exact folder:");
console.log("");
console.log(`     ${ROOT}`);
console.log("");
console.log("  Do not move or rename that folder afterwards. If you do, load it again.");
console.log("");
console.log("Then paste your keys in the extension's Settings page:");
console.log("  - Supadata API key    (transcripts)");
console.log("  - DeepSeek API key    (overview, translation, explanations)");
console.log("  - Notion / GetNote    (optional, only for export)");
console.log("");

if (failures > 0) {
  console.log(`${failures} check(s) failed. Fix them before loading the extension.`);
  process.exit(1);
}
console.log("All checks passed.");
