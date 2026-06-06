import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        // happy-dom est plus léger que jsdom et suffit pour nos fonctions pures
        // qui utilisent quelques APIs DOM (document.createElement…).
        environment: "happy-dom",
        include: ["test/**/*.test.ts"],
        coverage: {
            provider: "v8",
            reporter: ["text", "html"],
            include: ["src/**/*.ts"],
            exclude: ["src/**/*.d.ts", "src/assets/**", "src/localize/languages/**"],
        },
    },
});
