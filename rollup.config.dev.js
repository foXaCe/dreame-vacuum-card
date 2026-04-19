import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import babel from "@rollup/plugin-babel";
import serve from "rollup-plugin-serve";
import terser from "@rollup/plugin-terser";
import json from "@rollup/plugin-json";

const port = process.env.PORT || 5000;

export default {
    input: ["src/dreame-vacuum-card.ts"],
    output: {
        dir: "./dist",
        format: "es",
    },
    plugins: [
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
        serve({
            contentBase: "./dist",
            host: "127.0.0.1",
            port: port,
            allowCrossOrigin: true,
            headers: {
                "Access-Control-Allow-Origin": "*",
            },
        }),
    ],
};
