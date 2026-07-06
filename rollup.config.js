import typescript from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import json from "@rollup/plugin-json";

const plugins = [
    nodeResolve({
        extensions: [".js", ".ts"],
        browser: true,
        preferBuiltins: false,
        exportConditions: ["production", "default", "module", "import"],
        mainFields: ["module", "main"],
        dedupe: ["lit", "lit-element", "lit-html", "@lit/reactive-element"],
    }),
    commonjs({
        include: /node_modules/,
    }),
    typescript(),
    json(),
    terser({
        ecma: 2022,
        module: true,
        compress: { passes: 2 },
        format: { comments: false },
    }),
];

export default [
    {
        input: "src/dreame-vacuum-card.ts",
        // 'exports-only' (le défaut) crée une façade quasi vide à `entryFileNames` qui
        // ré-exporte depuis un chunk séparé nommé via `chunkFileNames`, dès qu'un
        // import() dynamique apparaît dans le graphe (cf. plan 013). On veut que le
        // fichier d'entrée porte directement le code applicatif : `false` fusionne la
        // façade dans le chunk d'entrée (le mécanisme qui pousserait autrement le
        // code partagé vers un chunk séparé ne s'applique qu'aux exports nommés d'une
        // entrée réutilisée ailleurs, ce qui n'est pas notre cas).
        preserveEntrySignatures: false,
        output: {
            dir: "dist",
            format: "es",
            entryFileNames: "dreame-vacuum-card.js",
            chunkFileNames: "dreame-vacuum-card.[name]-[hash].js",
        },
        plugins,
        external: [],
    },
];
