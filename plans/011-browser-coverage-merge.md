# Plan 011: [SPIKE] Instrumenter la couverture de la suite navigateur et fusionner les rapports

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat cf8701f..HEAD -- vitest.config.ts vitest.browser.config.ts package.json`
> On a mismatch with the "Current state" excerpts, STOP.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: MED (instrumentation navigateur parfois capricieuse — c'est un spike)
- **Depends on**: none — mais **prérequis recommandé du plan 014** (découpage du god file)
- **Category**: tests
- **Planned at**: commit `cf8701f`, 2026-07-06

## Why this matters

La couverture affichée pour `src/dreame-vacuum-card.ts` (le fichier le plus gros ET
le plus modifié du repo) est de ~14,5 % — mais ce chiffre ne compte que la suite
unitaire happy-dom. La suite navigateur Chromium, qui exerce précisément `render()`,
la calibration, le hit-test canvas et l'overlay robot, tourne **sans instrumentation**
(aucun bloc `coverage` dans `vitest.browser.config.ts`). Résultat : personne ne peut
dire quelles lignes du fichier critique sont réellement non testées, et tout travail
guidé par la couverture (dont le futur découpage de ce fichier, plan 014) navigue à
l'aveugle. Objectif du spike : un rapport fusionné unique et digne de confiance.

## Current state

- `vitest.config.ts` (suite unitaire) — bloc coverage existant :

  ```ts
  test: {
      environment: "happy-dom",
      include: ["test/**/*.test.ts"],
      coverage: {
          provider: "v8",
          reporter: ["text", "html"],
          include: ["src/**/*.ts"],
          exclude: [ "src/**/*.d.ts", "src/assets/**", "src/localize/languages/**", "src/pinch-zoom/**" ],
      },
  },
  ```

- `vitest.browser.config.ts` — **aucun** bloc `coverage` ; browser mode Playwright
  Chromium via `@vitest/browser-playwright` (voir le fichier complet, 31 lignes).
- Dépendance dispo : `@vitest/coverage-v8` (`package.json:38`), vitest `^4.1.8`.
- Scripts : `test:coverage` = `vitest run --coverage` (unitaire seulement) ;
  `test:browser` = `vitest run --config vitest.browser.config.ts`.
- Chromium local : `CHROMIUM_BIN=/usr/bin/chromium`.
- `coverage/` est dans `.gitignore`.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Couverture unitaire | `npm run test:coverage` | rapport écrit dans `coverage/` |
| Suite navigateur | `CHROMIUM_BIN=/usr/bin/chromium npm run test:browser` | verts |
| Fusion istanbul | `npx nyc merge <dir-des-json> merged/coverage.json && npx nyc report --temp-dir merged -r html -r text` | rapport fusionné |

## Scope

**In scope**:
- `vitest.browser.config.ts` (bloc coverage)
- `vitest.config.ts` (ajouter le reporter `json` si absent)
- `package.json` (nouveaux scripts `test:coverage:browser` et `test:coverage:merged`)
- `ARCHITECTURE.md` (section Tests : 2-3 lignes documentant le rapport fusionné)
- `.gitignore` (si un nouveau répertoire de sortie est créé, l'ignorer)

**Out of scope**:
- Tout fichier de `src/` — le spike mesure, il ne corrige pas.
- L'ajout de nouveaux tests (plans 012 et suivants).
- La CI (`ci.yml`) — l'intégration CI du rapport fusionné est un suivi explicite,
  pas ce spike.

## Git workflow

- Ne committe pas et ne pousse pas : l'utilisateur contrôle git.

## Steps

### Step 1: Reporter JSON côté unitaire

Dans `vitest.config.ts`, ajouter `"json"` à `coverage.reporter` et fixer
`reportsDirectory: "coverage/unit"`.

**Verify**: `npm run test:coverage` → `coverage/unit/coverage-final.json` existe.

### Step 2: Coverage côté navigateur

Dans `vitest.browser.config.ts`, ajouter au bloc `test` :

```ts
coverage: {
    provider: "v8",
    reporter: ["text", "json"],
    reportsDirectory: "coverage/browser",
    include: ["src/**/*.ts"],
    exclude: ["src/**/*.d.ts", "src/assets/**", "src/localize/languages/**", "src/pinch-zoom/**"],
},
```

Ajouter le script `package.json` :
`"test:coverage:browser": "vitest run --coverage --config vitest.browser.config.ts"`.

**Verify**: `CHROMIUM_BIN=/usr/bin/chromium npm run test:coverage:browser` →
`coverage/browser/coverage-final.json` existe **et**
`node -e "const c=require('./coverage/browser/coverage-final.json'); const k=Object.keys(c).find(p=>p.endsWith('dreame-vacuum-card.ts')); if(!k) throw new Error('fichier absent du rapport'); console.log('OK', k)"`
→ OK.

### Step 3: Fusion

Ajouter le script :
`"test:coverage:merged": "npm run test:coverage && CHROMIUM_BIN=${CHROMIUM_BIN:-} npm run test:coverage:browser && rm -rf coverage/merged && mkdir -p coverage/merged && npx nyc merge coverage-tmp-input coverage/merged/coverage.json && npx nyc report --temp-dir coverage/merged -r html -r text --report-dir coverage/merged/html"`

Note d'implémentation : `nyc merge` fusionne un **répertoire** de fichiers JSON —
copier `coverage/unit/coverage-final.json` et `coverage/browser/coverage-final.json`
sous des noms distincts dans un répertoire intermédiaire avant la fusion. Si la
ligne de script devient illisible, créer `scripts/merge-coverage.mjs` (même style que
`scripts/add-version.mjs`) et l'appeler depuis le script npm — c'est le choix
préféré.

**Verify**: `CHROMIUM_BIN=/usr/bin/chromium npm run test:coverage:merged` → un
rapport HTML dans `coverage/merged/html/` où `src/dreame-vacuum-card.ts` affiche une
couverture **strictement supérieure** au ~14,5 % de la suite unitaire seule
(critère de succès du spike : la suite navigateur contribue réellement).

### Step 4: Documentation

Dans `ARCHITECTURE.md`, section « Tests » : documenter
`npm run test:coverage:merged` comme la seule mesure de couverture fiable pour
`src/dreame-vacuum-card.ts`, en 2-3 lignes.

**Verify**: `grep -n "test:coverage:merged" ARCHITECTURE.md` → 1 occurrence.

## Test plan

Le spike est lui-même la vérification. Critère quantitatif : dans le rapport
fusionné, la couverture statements de `src/dreame-vacuum-card.ts` dépasse celle du
rapport unitaire seul (comparer les deux valeurs et les consigner dans le rapport
final de l'exécuteur, ex. « 14,5 % → 6X % »).

## Done criteria

- [ ] `coverage/unit/coverage-final.json` et `coverage/browser/coverage-final.json` générés
- [ ] `npm run test:coverage:merged` produit `coverage/merged/html/index.html`
- [ ] Couverture fusionnée de `dreame-vacuum-card.ts` > couverture unitaire seule
      (valeurs consignées dans le rapport)
- [ ] `npm test` et `npm run test:browser` inchangés (verts, sans `--coverage`)
- [ ] `ARCHITECTURE.md` documente la commande
- [ ] Aucun fichier hors scope modifié (`git status`)
- [ ] Ligne de statut mise à jour dans `plans/README.md`

## STOP conditions

- Le provider v8 refuse de s'attacher en mode navigateur (erreur au lancement de
  `test:coverage:browser`) après UNE tentative de correction documentée dans la doc
  Vitest 4 (browser mode + coverage) → consigner l'erreur exacte et la version, et
  s'arrêter : c'est le résultat du spike (négatif mais informatif).
- Le mapping de lignes du rapport navigateur est manifestement faux (ex. lignes
  couvertes dans des commentaires) → même traitement : consigner, s'arrêter.
- `nyc` introuvable et non installable localement → rapporter ; ne pas ajouter de
  dépendance au `package.json` sans le signaler explicitement dans le rapport.

## Maintenance notes

- Suivi explicitement différé : brancher `test:coverage:merged` dans la CI (nouveau
  step du job `test-browser`) et/ou publier le rapport en artefact — à planifier
  après validation du spike.
- Le plan 014 (découpage du god file) doit utiliser ce rapport fusionné comme
  baseline avant/après extraction.
