import { defineConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";

/**
 * Suite navigateur réel (Chromium headless) — couvre la glu DOM/canvas du composant
 * principal que happy-dom ne peut pas exercer : décodage d'images, pick-canvas
 * (hit-test des pièces via le canal bleu du segment_map), pointer events, layout.
 *
 * Lancement : `npm run test:browser`.
 * - En local sans navigateurs Playwright : `CHROMIUM_BIN=/usr/bin/chromium npm run test:browser`
 * - En CI : `npx playwright install chromium` au préalable (cf. ci.yml).
 */
export default defineConfig({
    optimizeDeps: {
        // Pré-bundle les dépendances CJS pour le serveur Vite du mode navigateur.
        // (`change-perspective` a été vendorisé dans src/model/map_objects/perspective-transform.ts,
        // ce n'est plus une dépendance CJS externe à pré-bundler.)
        include: ["lottie-web", "pointer-tracker", "transformation-matrix"],
    },
    test: {
        name: "browser",
        include: ["test-browser/**/*.test.ts"],
        browser: {
            enabled: true,
            headless: true,
            screenshotFailures: false,
            provider: playwright({
                launchOptions: process.env.CHROMIUM_BIN ? { executablePath: process.env.CHROMIUM_BIN } : {},
            }),
            instances: [{ browser: "chromium" }],
        },
        coverage: {
            provider: "v8",
            reporter: ["text", "json"],
            reportsDirectory: "coverage/browser",
            include: ["src/**/*.ts"],
            exclude: [
                "src/**/*.d.ts",
                "src/assets/**",
                "src/localize/languages/**",
                // Port vendored de <pinch-zoom> (GoogleChromeLabs), hors périmètre de test du projet.
                "src/pinch-zoom/**",
            ],
        },
    },
});
