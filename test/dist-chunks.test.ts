/**
 * Garde de régression du bug « animations Lottie invisibles sur HA » (2026-07-06).
 *
 * La ressource Lovelace charge l'entrée avec un query de cache-busting
 * (`dreame-vacuum-card.js?v=...`). Si un chunk dynamique ré-importe l'entrée par
 * son chemin nu (`./dreame-vacuum-card.js`, sans query), le navigateur la traite
 * comme un module DIFFÉRENT et ré-évalue tout le bundle : les
 * `customElements.define()` relancent (« name has already been used »), le chunk
 * ne s'évalue jamais, et les imports paresseux (moteur Lottie) échouent en
 * silence. Le correctif isole le code partagé dans un chunk `helpers`
 * (rollup.config.js, `manualChunks`) ; ce test épingle l'invariant sur les
 * artefacts committés de `dist/`.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";

const DIST = join(__dirname, "..", "dist");
const ENTRY = "dreame-vacuum-card.js";

describe("dist/ — les chunks ne ré-importent jamais l'entrée", () => {
    const chunks = readdirSync(DIST).filter((f) => f.endsWith(".js") && f !== ENTRY);

    it("le build chunké est présent (au moins les chunks lottie et helpers)", () => {
        expect(chunks.length).toBeGreaterThan(0);
        expect(chunks.some((f) => f.includes("lottie_light"))).toBe(true);
        expect(chunks.some((f) => f.includes("helpers"))).toBe(true);
    });

    it.each(chunks)("%s n'importe pas ./dreame-vacuum-card.js", (chunk) => {
        const src = readFileSync(join(DIST, chunk), "utf8");
        expect(src).not.toContain(`from"./${ENTRY}"`);
        expect(src).not.toContain(`from "./${ENTRY}"`);
        expect(src).not.toContain(`import("./${ENTRY}")`);
        expect(src).not.toContain(`import"./${ENTRY}"`);
    });
});
