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
// reference it (they don't exist at all in the SINGLE_FILE build, see
// rollup.config.js). An optional path argument lets this script patch the
// single-file release asset (dist-release/dreame-vacuum-card.js) in addition to
// the default dist/ build output; the JS filename is otherwise hardcoded rather
// than read from hacs.json.
const targetPath = process.argv[2] ?? join(__dirname, "../dist/dreame-vacuum-card.js");

// Read the target file
let content = readFileSync(targetPath, "utf8");

// Replace the placeholder
const placeholder = "@VACUUM_MAP_CARD_VERSION_PLACEHOLDER@";
const updatedContent = content.replace(new RegExp(placeholder, "g"), version);

// Write back
writeFileSync(targetPath, updatedContent, "utf8");

console.log(`✅ Replaced '${placeholder}' with '${version}' in ${targetPath}`);
