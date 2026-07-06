# Plan 013: Charger Lottie et ses animations à la demande (~1/3 du bundle)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat cf8701f..HEAD -- src/components/robot-animation.ts rollup.config.js hacs.json .github/workflows/release.yml scripts/add-version.mjs`
> On a mismatch with the "Current state" excerpts, STOP.

## Status

- **Priority**: P3
- **Effort**: L
- **Risk**: MED — touche le format de livraison HACS ; vérifications strictes requises
- **Depends on**: 005 (pinning des actions — évite les conflits d'édition sur `release.yml`) ; 010 (supprime l'asset Lottie mort)
- **Category**: perf
- **Planned at**: commit `cf8701f`, 2026-07-06

## Why this matters

`robot-animation.ts` importe statiquement le moteur Lottie
(`lottie-web/build/player/lottie_light`, ~168 Ko minifié, module UMD non
tree-shakeable) et 3 JSON d'animation (~43 Ko) : ~210 Ko des 606 Ko du bundle —
environ un tiers — payés en parse/eval à **chaque** chargement de dashboard par
**tous** les utilisateurs, alors que ces animations ne s'affichent que pendant les
états lavage/séchage/vidage (robots avec station seulement). Le chargement dynamique
sort ce coût du chemin critique. La difficulté n'est pas le code : c'est le
**livrable** — HACS et l'installation raw-URL supposent aujourd'hui un fichier
unique.

## Current state

- `src/components/robot-animation.ts:3-7` :

  ```ts
  import lottie, { AnimationItem } from "lottie-web/build/player/lottie_light";

  import animDrying from "../assets/lottie/anim_drying.json";
  import animWashing from "../assets/lottie/anim_washing.json";
  import animDustCollect from "../assets/lottie/anim_dust_collect.json";
  ```

  `STATE_LOTTIE_MAP` (l.9-26) mappe ~14 états vers ces 3 animations. Le chargement
  effectif passe déjà par `_scheduleLoad(animData)` (l.92-114), asynchrone (timer
  50 ms, retries), qui appelle `lottie.loadAnimation(...)` — le point d'insertion
  naturel du lazy-loading. `updated()` (l.66-90) choisit l'animation par état.

- `rollup.config.js` : entrée unique `src/dreame-vacuum-card.ts`, sortie
  `dir: "dist"`, `entryFileNames: "dreame-vacuum-card.js"`, format ES. Aucun
  `inlineDynamicImports` explicite : avec un seul chunk aujourd'hui, la question ne
  se posait pas ; dès qu'un `import()` apparaît, Rollup créera des chunks séparés
  dans `dist/`.

- Contraintes de livraison :
  - `hacs.json` : `"filename": "dreame-vacuum-card.js"` — HACS télécharge CE fichier
    depuis les assets de release (mode release) ;
  - `.github/workflows/release.yml:45-49` : publie uniquement
    `files: dist/dreame-vacuum-card.js` ;
  - `scripts/add-version.mjs` : lit `hacs.json.filename` pour trouver le fichier
    dist à estampiller ;
  - `.gitignore` : `dist/` est **committé volontairement** (installation raw URL).
  - HACS supporte `"zip_release": true` + `filename: <archive>.zip` : l'archive est
    extraite telle quelle dans `www/community/<repo>/` — les chunks relatifs
    fonctionnent alors.

- Tests existants du composant : la suite unitaire couvre `robot-animation`
  (commit `9f533e3` : « robot-animation ≥ 80 % ») — chercher les cas dans
  `test/components*.test.ts` ; ils devront attendre le chargement async.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Typecheck / lint / format | `npm run typecheck && npm run lint && npm run format:check` | exit 0 |
| Build | `npm run rollup` | exit 0 |
| Taille du bundle principal | `stat -c%s dist/dreame-vacuum-card.js` | **< 450000** (vs 606040 avant) |
| Chunks présents | `ls dist/` | `dreame-vacuum-card.js` + ≥1 chunk (lottie) |
| Tests | `npm test` puis `CHROMIUM_BIN=/usr/bin/chromium npm run test:browser` | verts |

## Scope

**In scope**:
- `src/components/robot-animation.ts`
- `rollup.config.js` (nommage des chunks)
- `hacs.json`, `.github/workflows/release.yml`, `scripts/add-version.mjs`
  (adaptation du livrable zip)
- `README.md` (section Manual Installation : mentionner les fichiers chunks)
- Tests de `robot-animation` dans `test/components*.test.ts` (adaptation async)

**Out of scope**:
- `rollup.config.dev.js` (le dev server peut rester tel quel si le build passe).
- Les autres composants et le composant principal.
- Toute autre « optimisation » du bundle repérée en passant.

## Git workflow

- Ne committe pas et ne pousse pas : l'utilisateur contrôle git. Signaler
  explicitement dans le rapport que `dist/` change de composition (nouveaux chunks)
  et que la release doit passer au zip — décisions visibles pour l'utilisateur.

## Steps

### Step 1: Lazy-load dans `robot-animation.ts`

Remplacer les 4 imports statiques par des loaders dynamiques :

```ts
type LottieModule = typeof import("lottie-web/build/player/lottie_light");

const STATE_ANIM_LOADER: Record<string, () => Promise<unknown>> = {
    // Drying
    drying: () => import("../assets/lottie/anim_drying.json").then((m) => m.default),
    // ... (reprendre exactement les ~14 clés de STATE_LOTTIE_MAP, chacune pointant
    //      vers le loader du bon JSON)
};

let lottiePromise: Promise<LottieModule["default"]> | undefined;
function loadLottie() {
    lottiePromise ??= import("lottie-web/build/player/lottie_light").then((m) => m.default);
    return lottiePromise;
}
```

Adapter `updated()`/`_scheduleLoad()` : résoudre `Promise.all([loadLottie(),
loader()])` puis appeler `loadAnimation` — en vérifiant après résolution que
`this.isConnected` ET que l'état demandé est toujours `this._currentState` (une
transition d'état pendant le chargement ne doit pas afficher la mauvaise animation).
Conserver la sémantique existante : retries si le container n'est pas prêt,
`_destroyAnimation()` à chaque changement d'état, `style.opacity`.

Garder le type `AnimationItem` via `import type { AnimationItem } from
"lottie-web";` (import de type = zéro coût runtime).

**Verify**: `npm run typecheck && npm run lint` → exit 0.

### Step 2: Chunks Rollup

Dans `rollup.config.js`, ajouter au bloc `output` :
`chunkFileNames: "dreame-vacuum-card.[name]-[hash].js"` (préfixe commun : les
fichiers restent identifiables dans `www/community/`).

**Verify**: `npm run rollup` → exit 0 ; `ls dist/` → fichier principal + ≥1 chunk ;
`stat -c%s dist/dreame-vacuum-card.js` → < 450000 ;
`grep -c "lottie" dist/dreame-vacuum-card.js` → 0 ou proche de 0 (le moteur n'est
plus dans le bundle principal).

### Step 3: Livrable release en zip

1. `hacs.json` : `"zip_release": true`, `"filename": "dreame-vacuum-card.zip"`.
2. `.github/workflows/release.yml` : après le build, ajouter un step
   `run: cd dist && zip -r dreame-vacuum-card.zip .` et publier
   `files: dist/dreame-vacuum-card.zip`.
3. `scripts/add-version.mjs` : il lit `hacs.json.filename` pour trouver le JS — le
   corriger pour estampiller `dist/dreame-vacuum-card.js` directement (nom en dur ou
   depuis une nouvelle constante), AVANT la création du zip dans le workflow.
4. `README.md`, section Manual Installation : préciser qu'il faut désormais copier
   **tout le contenu** de `dist/` (ou le zip extrait), pas un fichier unique.

**Verify**: `node scripts/add-version.mjs` → exit 0 et la version apparaît dans
`dist/dreame-vacuum-card.js` (`grep -c "$(node -p "require('./package.json').version")" dist/dreame-vacuum-card.js` ≥ 1).

### Step 4: Tests

Adapter les tests unitaires de `robot-animation` : le chargement étant devenu
asynchrone, les assertions sur l'animation chargée doivent attendre (`vi.waitFor` ou
équivalent du style des tests existants). Le comportement observable (opacity, états
zzz, destruction au changement d'état) ne doit PAS changer.

**Verify**: `npm test && CHROMIUM_BIN=/usr/bin/chromium npm run test:browser` → verts.

### Step 5: Test de fumée du chargement réel

Vérifier que le chargement dynamique fonctionne depuis le bundle buildé (pas
seulement depuis Vite) : servir `dist/` statiquement
(`python3 -m http.server -d dist 8123 &`), puis dans un scratch HTML minimal
importer le module et vérifier via les DevTools réseau — OU, plus simple et
suffisant : un test navigateur qui monte la carte avec un état `washing` et vérifie
que l'animation finit par apparaître (`until(() =>
!!anim.shadowRoot?.getElementById("lottie-container")?.hasChildNodes())`). Ajouter ce
test s'il n'existe pas.

**Verify**: le test navigateur « animation washing apparaît » → vert.

## Test plan

- Adaptation des tests `robot-animation` existants (async).
- Nouveau test navigateur : état `washing` → le SVG Lottie apparaît dans le
  container (chargement dynamique effectif de bout en bout).
- Non-régression complète : les deux suites vertes.

## Done criteria

- [ ] `stat -c%s dist/dreame-vacuum-card.js` < 450000 après `npm run rollup`
- [ ] `ls dist/` montre le bundle principal + chunk(s) lottie/animations
- [ ] `npm run typecheck && npm run lint && npm run format:check` → exit 0
- [ ] `npm test` et `CHROMIUM_BIN=/usr/bin/chromium npm run test:browser` → verts
- [ ] `hacs.json` en `zip_release`, `release.yml` publie le zip,
      `add-version.mjs` fonctionne (`node scripts/add-version.mjs` → exit 0)
- [ ] README Manual Installation à jour
- [ ] Ligne de statut mise à jour dans `plans/README.md`

## STOP conditions

- Rollup émet le dynamic import **inliné** (un seul fichier en sortie malgré
  l'`import()`) et aucune option documentée ne l'en dissuade → rapporter la config
  essayée ; ne pas migrer de bundler.
- Les JSON importés dynamiquement ne passent pas par `@rollup/plugin-json` en mode
  chunk (erreur de build) → rapporter ; une alternative (fetch du JSON embarqué en
  asset) est un choix de design à valider, pas à improviser.
- Le test de fumée montre que le chunk ne se résout pas relativement au module
  principal (404 sur le chunk) → rapporter l'URL tentée ; c'est LE risque HACS de ce
  plan et il doit remonter à l'humain.
- Incertitude sur la sémantique `zip_release` de HACS (doc HACS contradictoire) →
  rapporter au lieu de deviner.

## Maintenance notes

- Toute future release DOIT publier le zip (le workflow le fait) ; une release
  manuelle qui n'attacherait que le .js casserait les installs HACS.
- L'installation raw-URL pointant sur `dist/dreame-vacuum-card.js` committé continue
  de fonctionner **si** les chunks committés l'accompagnent — `dist/` doit rester
  committé en entier.
- Si une 4ᵉ animation est ajoutée un jour, l'ajouter dans `STATE_ANIM_LOADER` (loader
  dynamique), jamais en import statique.
