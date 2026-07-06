#!/usr/bin/env node
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read package.json to get version
const packageJsonPath = join(__dirname, "../package.json");
const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
const version = packageJson.version;

// The version placeholder (src/const.ts) lives in the main entry chunk only — the
// lazy-loaded lottie chunks (see robot-animation.ts / rollup.config.js) never
// reference it. hacs.json.filename now points at the release zip archive (built
// AFTER this script runs, see release.yml), so the JS filename is hardcoded here
// instead of being read from hacs.json.
const filename = "dreame-vacuum-card.js";

// Read the dist file
const distPath = join(__dirname, "../dist", filename);
let content = readFileSync(distPath, "utf8");

// Replace the placeholder
const placeholder = "@VACUUM_MAP_CARD_VERSION_PLACEHOLDER@";
const updatedContent = content.replace(new RegExp(placeholder, "g"), version);

// Write back
writeFileSync(distPath, updatedContent, "utf8");

console.log(`✅ Replaced '${placeholder}' with '${version}' in ${filename}`);
