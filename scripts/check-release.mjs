#!/usr/bin/env node
/**
 * Release checks that run identically on Windows, macOS and Linux.
 *
 * This replaces scripts/check-release.sh: the bash version needed bash, grep,
 * compgen and Unix line handling, so a Windows checkout could not run it.
 */

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");
process.chdir(ROOT);

const PRINT_FILES = process.argv.includes("--print-files");
const SKIP_TESTS = process.argv.includes("--skip-tests");

function fail(message) {
  console.error(`Release check failed: ${message}`);
  process.exit(1);
}

// Files eligible for the public extension ZIP. Optional entries are included
// only when present; manifest references are validated separately.
const PUBLIC_ALLOWLIST = [
  "manifest.json",
  "background.js",
  "i18n.js",
  "exporters.js",
  "settings.js",
  "content.js",
  "sidepanel.html",
  "sidepanel.css",
  "sidepanel.js",
  "options.html",
  "options.css",
  "options.js",
  "icons/icon16.png",
  "icons/icon48.png",
  "icons/icon128.png",
  "prompts/analysis.md",
  "prompts/explain.md",
  "prompts/note-cleanup.md",
  "prompts/translation.md",
  "README.md",
  "README.zh-CN.md",
  "PRIVACY.md",
  "SECURITY.md",
  "LICENSE",
];

const REQUIRED_PUBLIC_FILES = [
  "manifest.json",
  "background.js",
  "i18n.js",
  "exporters.js",
  "settings.js",
  "content.js",
  "sidepanel.html",
  "sidepanel.css",
  "sidepanel.js",
  "icons/icon16.png",
  "icons/icon48.png",
  "icons/icon128.png",
  "README.md",
  "README.zh-CN.md",
  "PRIVACY.md",
  "SECURITY.md",
  "LICENSE",
];

for (const file of REQUIRED_PUBLIC_FILES) {
  if (!fs.existsSync(file)) fail(`required public file is missing: ${file}`);
}

const releaseFiles = [];
for (const file of PUBLIC_ALLOWLIST) {
  if (!fs.existsSync(file)) continue;
  const stat = fs.lstatSync(file);
  if (!stat.isFile()) fail(`allowlisted path is not a regular file: ${file}`);
  releaseFiles.push(file);
}

for (const forbidden of ["config.js", ".DS_Store", ".git"]) {
  for (const file of releaseFiles) {
    if (
      file === forbidden ||
      file.startsWith(`${forbidden}/`) ||
      file.endsWith(`/${forbidden}`)
    ) {
      fail(`private path entered the release list: ${file}`);
    }
  }
}

const manifest = JSON.parse(fs.readFileSync("manifest.json", "utf8"));
if (manifest.manifest_version !== 3) {
  fail("manifest.json must declare manifest_version 3");
}
for (const field of ["name", "version", "description"]) {
  if (typeof manifest[field] !== "string" || !manifest[field].trim()) {
    fail(`manifest.json must include a non-empty ${field}`);
  }
}
if (!/^\d+\.\d+\.\d+(?:\.\d+)?$/.test(manifest.version)) {
  fail("manifest.json version must contain three or four numeric components");
}

// Collect every local file the extension actually references.
const referenced = new Set();
const addReference = (value) => {
  if (typeof value === "string" && value) referenced.add(value);
};
const addIconMap = (icons) => {
  if (icons && typeof icons === "object") Object.values(icons).forEach(addReference);
};

addReference(manifest.background?.service_worker);
addReference(manifest.side_panel?.default_path);
addReference(manifest.options_page);
addReference(manifest.options_ui?.page);
addReference(manifest.action?.default_popup);
addIconMap(manifest.icons);
addIconMap(manifest.action?.default_icon);
for (const script of manifest.content_scripts || []) {
  (script.js || []).forEach(addReference);
  (script.css || []).forEach(addReference);
}
for (const item of manifest.web_accessible_resources || []) {
  (item.resources || []).forEach((resource) => {
    if (!resource.includes("*")) addReference(resource);
  });
}

for (const file of releaseFiles) {
  if (file.endsWith(".js")) {
    const source = fs.readFileSync(file, "utf8");
    for (const match of source.matchAll(/\bimportScripts\s*\(\s*["']([^"']+)["']\s*\)/g)) {
      if (!/^[a-z]+:/i.test(match[1])) {
        referenced.add(path.posix.join(path.posix.dirname(file), match[1]));
      }
    }
    for (const match of source.matchAll(/\bloadPromptSection\s*\(\s*["']([^"']+)["']/g)) {
      referenced.add(path.posix.join("prompts", match[1]));
    }
  }
  if (file.endsWith(".html")) {
    const source = fs.readFileSync(file, "utf8");
    for (const match of source.matchAll(/\b(?:src|href)\s*=\s*["']([^"']+)["']/gi)) {
      const value = match[1];
      if (value.startsWith("#") || value.startsWith("//") || /^[a-z]+:/i.test(value)) {
        continue;
      }
      referenced.add(path.posix.join(path.posix.dirname(file), value));
    }
  }
}

const allowlisted = new Set(releaseFiles);
for (const file of referenced) {
  const normalized = path.posix.normalize(file.replaceAll("\\", "/"));
  if (path.isAbsolute(file) || normalized === ".." || normalized.startsWith("../")) {
    fail(`manifest references an unsafe path: ${file}`);
  }
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
    fail(`manifest references a missing file: ${file}`);
  }
  if (!allowlisted.has(file)) {
    fail(`manifest references a file outside the public allowlist: ${file}`);
  }
}

// Syntax check every shipped script with the current Node runtime.
const javascriptFiles = releaseFiles.filter((file) => file.endsWith(".js"));
for (const file of javascriptFiles) {
  const result = spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
  if (result.status !== 0) {
    fail(`${file} does not parse: ${result.stderr.trim()}`);
  }
}

const configPattern =
  /importScripts\s*\(\s*["']config\.js|(^|[^A-Za-z0-9_])CONFIG\./;
for (const file of javascriptFiles) {
  const source = fs.readFileSync(file, "utf8");
  if (configPattern.test(source)) {
    fail(`${file} still depends on config.js/CONFIG; use Options-page storage`);
  }
}

const CREDENTIAL_PATTERNS = [
  ["private key block", /-----BEGIN (?:[A-Z0-9 ]+ )?PRIVATE KEY-----/g],
  ["OpenAI-style key", /\bsk-[A-Za-z0-9_-]{20,}\b/g],
  ["Supadata-style key", /\bsd_[A-Za-z0-9_-]{16,}\b/g],
  ["GetNote-style key", /\bgk_live_[A-Za-z0-9_-]{8,}\b/g],
  ["GitHub token", /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{20,}\b/g],
  ["GitHub fine-grained token", /\bgithub_pat_[A-Za-z0-9_]{20,}\b/g],
  ["Google API key", /\bAIza[0-9A-Za-z_-]{30,}\b/g],
  ["Slack token", /\bxox[baprs]-[0-9A-Za-z-]{20,}\b/g],
  ["AWS access key", /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/g],
  [
    "credential assignment",
    /\b(?:api[_-]?key|secret|access[_-]?token|auth[_-]?token)\b\s*[:=]\s*["'][^"'\s]{16,}["']/gi,
  ],
];

const scanTargets = new Set(releaseFiles);
const gitList = spawnSync(
  "git",
  ["ls-files", "-z", "--cached", "--others", "--exclude-standard"],
  { encoding: "utf8" },
);
if (gitList.status === 0) {
  for (const file of gitList.stdout.split("\0").filter(Boolean)) {
    if (fs.existsSync(file) && fs.statSync(file).isFile()) scanTargets.add(file);
  }
}

let credentialFound = false;
for (const file of scanTargets) {
  if (!/\.(?:js|json|html|css|md|txt|yml|yaml|mjs|sh)$/i.test(file) && file !== "LICENSE") {
    continue;
  }
  const text = fs.readFileSync(file, "utf8");
  for (const [label, pattern] of CREDENTIAL_PATTERNS) {
    pattern.lastIndex = 0;
    if (pattern.test(text)) {
      console.error(`possible ${label} found in publishable file: ${file}`);
      credentialFound = true;
    }
  }
}
if (credentialFound) fail("credentials must never be committed");

if (!SKIP_TESTS) {
  const testFiles = fs
    .readdirSync("tests")
    .filter((file) => file.endsWith(".test.js"))
    .map((file) => path.join("tests", file));
  if (testFiles.length > 0) {
    const result = spawnSync(process.execPath, ["--test", ...testFiles], {
      stdio: "inherit",
    });
    if (result.status !== 0) fail("test suite failed");
  }
}

console.error(`Release checks passed (${releaseFiles.length} allowlisted files).`);
if (PRINT_FILES) {
  process.stdout.write(`${releaseFiles.join("\n")}\n`);
}
