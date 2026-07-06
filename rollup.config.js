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

// Deux modes de sortie, sélectionnés par la variable d'env SINGLE_FILE :
//
// - par défaut (dist/, chunké) : sert l'installation raw-URL / HACS depuis le
//   répertoire dist/ committé. Les imports dynamiques (moteur Lottie, cf. plan 013)
//   restent des chunks séparés pour profiter du lazy-load (−33 % sur le bundle
//   principal).
// - SINGLE_FILE=1 (dist-release/, autonome) : produit l'asset publié sur les
//   releases GitHub pour hacs.json (filename: dreame-vacuum-card.js). HACS ne
//   télécharge qu'un seul fichier depuis les assets de release — s'il s'agissait
//   du bundle chunké, les chunks manqueraient et les animations Lottie ne
//   chargeraient jamais. `inlineDynamicImports` fusionne tout (y compris le
//   moteur Lottie) dans un unique fichier autonome.
const singleFile = process.env.SINGLE_FILE === "1";

const output = singleFile
    ? {
          file: "dist-release/dreame-vacuum-card.js",
          format: "es",
          inlineDynamicImports: true,
      }
    : {
          dir: "dist",
          format: "es",
          entryFileNames: "dreame-vacuum-card.js",
          chunkFileNames: "dreame-vacuum-card.[name]-[hash].js",
      };

export default [
    {
        input: "src/dreame-vacuum-card.ts",
        // 'exports-only' (le défaut) crée une façade quasi vide à `entryFileNames` qui
        // ré-exporte depuis un chunk séparé nommé via `chunkFileNames`, dès qu'un
        // import() dynamique apparaît dans le graphe (cf. plan 013). On veut que le
        // fichier d'entrée porte directement le code applicatif : `false` fusionne la
        // façade dans le chunk d'entrée (le mécanisme qui pousserait autrement le
        // code partagé vers un chunk séparé ne s'applique qu'aux exports nommés d'une
        // entrée réutilisée ailleurs, ce qui n'est pas notre cas). Non pertinent en
        // mode SINGLE_FILE (pas de chunks du tout, cf. inlineDynamicImports).
        preserveEntrySignatures: false,
        output,
        plugins,
        external: [],
    },
];
