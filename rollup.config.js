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
        output: {
            dir: "dist",
            format: "es",
            entryFileNames: "dreame-vacuum-card.js",
        },
        plugins,
        external: [],
    },
];
