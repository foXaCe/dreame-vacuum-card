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

// Read hacs.json to get the filename (with hash)
const hacsPath = join(__dirname, "../hacs.json");
const hacsContent = JSON.parse(readFileSync(hacsPath, "utf8"));
const filename = hacsContent.filename;

// Read the dist file
const distPath = join(__dirname, "../dist", filename);
let content = readFileSync(distPath, "utf8");

// Replace the placeholder
const placeholder = "@VACUUM_MAP_CARD_VERSION_PLACEHOLDER@";
const updatedContent = content.replace(new RegExp(placeholder, "g"), version);

// Write back
writeFileSync(distPath, updatedContent, "utf8");

console.log(`✅ Replaced '${placeholder}' with '${version}' in ${filename}`);
