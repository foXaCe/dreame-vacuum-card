#!/usr/bin/env node
// Fusionne les rapports de couverture istanbul de la suite unitaire (happy-dom)
// et de la suite navigateur (Chromium réel) en un seul rapport digne de confiance
// pour src/dreame-vacuum-card.ts — voir plan 011.
//
// Prérequis : `npm run test:coverage` et `npm run test:coverage:browser` ont déjà
// été exécutés (le script `test:coverage:merged` les enchaîne automatiquement).
import { execFileSync } from "child_process";
import { copyFileSync, existsSync, mkdirSync, rmSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = join(__dirname, "..");

const unitReport = join(root, "coverage/unit/coverage-final.json");
const browserReport = join(root, "coverage/browser/coverage-final.json");
const mergeInputDir = join(root, "coverage/.merge-input");
const mergedDir = join(root, "coverage/merged");
const mergedJson = join(mergedDir, "coverage.json");
const htmlDir = join(mergedDir, "html");

for (const [label, path] of [
    ["unitaire", unitReport],
    ["navigateur", browserReport],
]) {
    if (!existsSync(path)) {
        console.error(`Rapport de couverture ${label} manquant : ${path}`);
        console.error("Lancez d'abord `npm run test:coverage` et `npm run test:coverage:browser`.");
        process.exit(1);
    }
}

// 1. Copie les deux rapports sous des noms distincts dans un répertoire intermédiaire
// (nyc merge fusionne tous les fichiers JSON istanbul d'un répertoire).
rmSync(mergeInputDir, { recursive: true, force: true });
mkdirSync(mergeInputDir, { recursive: true });
copyFileSync(unitReport, join(mergeInputDir, "unit.json"));
copyFileSync(browserReport, join(mergeInputDir, "browser.json"));

rmSync(mergedDir, { recursive: true, force: true });
mkdirSync(mergedDir, { recursive: true });

// 2. Fusionne les deux cartes de couverture en une seule.
execFileSync("npx", ["nyc", "merge", mergeInputDir, mergedJson], { cwd: root, stdio: "inherit" });

// 3. Génère les rapports html + text à partir de la carte fusionnée.
execFileSync(
    "npx",
    ["nyc", "report", "--temp-dir", mergedDir, "--report-dir", htmlDir, "-r", "html", "-r", "text"],
    { cwd: root, stdio: "inherit" },
);

rmSync(mergeInputDir, { recursive: true, force: true });

console.log(`\nRapport fusionné : ${join(htmlDir, "index.html")}`);
