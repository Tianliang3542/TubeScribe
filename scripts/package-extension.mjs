#!/usr/bin/env node
/**
 * Builds the distributable ZIP with no external tools.
 *
 * This replaces scripts/package-extension.sh, which required bash, zip, unzip
 * and shasum. A minimal ZIP writer is used instead so Windows, macOS and Linux
 * all produce the same archive from the same source.
 */

import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");
process.chdir(ROOT);

function fail(message) {
  console.error(`Packaging failed: ${message}`);
  process.exit(1);
}

const FORBIDDEN = /(^|\/)(config\.js|\.DS_Store|\.git)(\/|$)/;

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c;
  }
  return table;
})();

function crc32(buffer) {
  let crc = -1;
  for (let i = 0; i < buffer.length; i += 1) {
    crc = CRC_TABLE[(crc ^ buffer[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ -1) >>> 0;
}

function dosDateTime(now = new Date()) {
  const date =
    ((now.getFullYear() - 1980) << 9) |
    ((now.getMonth() + 1) << 5) |
    now.getDate();
  const time =
    (now.getHours() << 11) | (now.getMinutes() << 5) | Math.floor(now.getSeconds() / 2);
  return { date, time };
}

function buildZip(entries) {
  const localChunks = [];
  const centralChunks = [];
  const { date, time } = dosDateTime();
  let offset = 0;

  for (const { name, data } of entries) {
    const nameBuffer = Buffer.from(name, "utf8");
    const compressed = zlib.deflateRawSync(data, { level: 9 });
    const crc = crc32(data);

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x0800, 6); // UTF-8 file names
    local.writeUInt16LE(8, 8); // deflate
    local.writeUInt16LE(time, 10);
    local.writeUInt16LE(date, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(compressed.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(nameBuffer.length, 26);
    local.writeUInt16LE(0, 28);

    localChunks.push(local, nameBuffer, compressed);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(8, 10);
    central.writeUInt16LE(time, 12);
    central.writeUInt16LE(date, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(compressed.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(nameBuffer.length, 28);
    central.writeUInt16LE(0, 30);
    central.writeUInt16LE(0, 32);
    central.writeUInt16LE(0, 34);
    central.writeUInt16LE(0, 36);
    central.writeUInt32LE(0, 38);
    central.writeUInt32LE(offset, 42);

    centralChunks.push(central, nameBuffer);
    offset += local.length + nameBuffer.length + compressed.length;
  }

  const centralDirectory = Buffer.concat(centralChunks);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralDirectory.length, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);

  return Buffer.concat([...localChunks, centralDirectory, end]);
}

// The release allowlist and every safety check live in check-release.mjs, so
// there is exactly one definition of "what ships".
const listed = spawnSync(
  process.execPath,
  ["scripts/check-release.mjs", "--print-files", "--skip-tests"],
  { encoding: "utf8" },
);
if (listed.status !== 0) {
  fail(listed.stderr.trim() || "release checks did not print a file list");
}

const files = listed.stdout
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter(Boolean);

if (files.length === 0) fail("release allowlist is empty");

for (const file of files) {
  if (FORBIDDEN.test(file)) fail(`private path entered the package: ${file}`);
}

const manifest = JSON.parse(fs.readFileSync("manifest.json", "utf8"));
const version = String(manifest.version || "");
if (!/^\d+\.\d+\.\d+(?:\.\d+)?$/.test(version)) {
  fail(`unsafe manifest version: ${version}`);
}

const entries = files.map((name) => ({
  name,
  data: fs.readFileSync(name),
}));

const zip = buildZip(entries);
fs.mkdirSync("dist", { recursive: true });
const output = path.join("dist", `tube-scribe-v${version}.zip`);
fs.writeFileSync(output, zip);

const digest = crypto.createHash("sha256").update(zip).digest("hex");
console.log(`Created ${output}`);
console.log(`Files: ${entries.length}`);
console.log(`Size: ${zip.length} bytes`);
console.log(`SHA-256: ${digest}`);
