import typescript from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";
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
    babel({
        exclude: "node_modules/**",
        babelHelpers: "bundled",
        extensions: [".js", ".ts"],
    }),
    terser(),
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
