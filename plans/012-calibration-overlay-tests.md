# Plan 012: Tests de caractérisation — calibration dégradée et overlay de sélection (pixels)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat cf8701f..HEAD -- src/dreame-vacuum-card.ts test-browser/`
> On a mismatch with the "Current state" excerpts, STOP.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: LOW (tests additifs uniquement)
- **Depends on**: none — **prérequis recommandé du plan 014** (caractérisation avant refactor)
- **Category**: tests
- **Planned at**: commit `cf8701f`, 2026-07-06

## Why this matters

Deux zones critiques du composant principal n'ont aucun test :

**A — Chemins de dégradation de la calibration.** `_getCalibration()` gère 6 sources
(identity, points explicites, entity+JSON.parse avec catch, entity+attribute, camera,
plateforme) ; les branches entity (`"unknown"`, JSON tronqué → `catch { return
undefined; }`) ne sont exercées par aucun test — le seul fixture navigateur utilise
toujours `calibration_source: { camera: true }`. Si le `catch` régresse, la carte
crashe au render au lieu de se dégrader proprement.

**B — L'overlay de sélection de pièces**, LA fonctionnalité visuelle signature
(assombrir tout sauf les pièces sélectionnées), n'a aucun test pixel : le hit-test
(clic→sélection) est couvert, mais rien ne vérifie que les bonnes pièces sont
éclaircies/assombries sur le canvas `#room-selection-overlay`. Un masque alpha
inversé ou désaligné passerait la CI sans broncher.

Ces tests sont aussi le filet indispensable avant le découpage du fichier (plan 014).

## Current state

- `src/dreame-vacuum-card.ts:732-772` — `_getCalibration(config)` ; branches :
  - l.733-738 : `identity` → 3 points triviaux ;
  - l.740-744 : `calibration_points` explicites (3 ou 4) ;
  - l.746-748 : `if (!this.hass) return undefined;` ;
  - l.749-756 : `entity` sans `attribute` → `JSON.parse(state)` dans un try/catch,
    rejette `"unavailable"`/`"unknown"`/état vide → `undefined` ;
  - l.758-760 : `entity` + `attribute` → lecture d'attribut ;
  - l.761-763 : `camera` → attribut `calibration_points` de la caméra du preset.
- `src/dreame-vacuum-card.ts:1896-2018` — `_updateRoomSelectionOverlay()` : dessine
  sur le canvas `#room-selection-overlay` (id à l.1897) ; sort immédiatement si
  `activeTab !== "room"` (l.1904) ; boucle pixel qui laisse les pièces sélectionnées
  transparentes et assombrit le reste (alpha).
- Fixtures navigateur — `test-browser/fixtures/hass.ts` :
  - `makeHass(vacuumState, extraVacuumAttributes)` (l.97) — construit `hass` avec
    `vacuum.test` + `camera.test_map` (calibration vacuum = map × 10, segment_map
    généré par canvas) ;
  - `makeCardConfig(overrides)` (l.147) — config par défaut
    `calibration_source: { camera: true }` ;
  - `mountCard(config, vacuumState, extraVacuumAttributes)` (l.184),
    `until(cond)` (l.162).
  - **Limitation actuelle** : `makeHass` ne permet pas d'ajouter des entités
    arbitraires (ex. `sensor.cal`) — extension nécessaire (Step 1).
- Modèles de test existants : `test-browser/room-selection.test.ts` (montage, clic
  sur une pièce via coordonnées, constantes de pièces),
  `test-browser/segment-map-fallback.test.ts` (assertions basées pixels).
- `test-browser/room-selection.test.ts` définit les coordonnées de pièces utilisées
  pour les clics (chercher `ROOM_1` en tête de fichier pour les constantes exactes).

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Suite navigateur complète | `CHROMIUM_BIN=/usr/bin/chromium npm run test:browser` | verts |
| Un seul fichier | `CHROMIUM_BIN=/usr/bin/chromium npx vitest run --config vitest.browser.config.ts test-browser/<fichier>` | vert |
| Typecheck | `npm run typecheck` | exit 0 |

## Scope

**In scope**:
- `test-browser/fixtures/hass.ts` (extension : états supplémentaires)
- `test-browser/calibration-fallback.test.ts` (création)
- `test-browser/room-overlay-pixels.test.ts` (création)

**Out of scope**:
- `src/**` — AUCUNE modification de code produit. Si un test révèle un vrai bug,
  le consigner dans le rapport (et dans `plans/README.md` comme finding), ne pas le
  corriger ici.
- Les tests unitaires happy-dom (le canvas y est indisponible).

## Git workflow

- Ne committe pas et ne pousse pas : l'utilisateur contrôle git.

## Steps

### Step 1: Étendre le fixture

Dans `makeHass`, accepter un paramètre optionnel `extraStates: Record<string,
{ state: string; attributes?: Record<string, unknown> }>` fusionné dans
`hass.states` (défaut `{}` — comportement existant inchangé). Propager l'option à
travers `mountCard` (paramètre optionnel supplémentaire ou objet d'options — suivre
la signature existante sans casser les appels actuels).

**Verify**: `CHROMIUM_BIN=/usr/bin/chromium npm run test:browser` → suites
existantes toujours vertes.

### Step 2: Tests calibration (`test-browser/calibration-fallback.test.ts`)

Monter des cartes avec `makeCardConfig({ calibration_source: ... })` et asserter sur
`(card as any).coordinatesConverter?.calibrated` (attendre via `until`). Cas :

1. `{ entity: "sensor.cal" }` + état = JSON valide de 3 points (réutiliser le format
   des points caméra du fixture) → `calibrated === true`.
2. `{ entity: "sensor.cal" }` + état `"unknown"` → converter absent ou
   `calibrated !== true`, et **aucune exception** (la carte rend quand même :
   le shadow root existe).
3. `{ entity: "sensor.cal" }` + état `"{invalid json"` → idem 2 (le `catch` absorbe).
4. `{ entity: "sensor.cal", attribute: "points" }` + attribut = points valides →
   `calibrated === true`.
5. `{ identity: true }` → `calibrated === true`.
6. `{ calibration_points: [3 points valides] }` → `calibrated === true`.

**Verify**: le fichier seul → vert (6 tests).

### Step 3: Tests pixel de l'overlay (`test-browser/room-overlay-pixels.test.ts`)

Suivre le montage et les helpers de `test-browser/room-selection.test.ts` (mêmes
constantes de coordonnées de pièces) :

1. Monter, passer en mode pièce (même mécanisme que room-selection : clic sur
   l'onglet Room ou appel du handler), sélectionner la pièce 1 par clic.
2. Attendre que le canvas overlay soit peuplé :
   `until(() => { const c = card.shadowRoot!.getElementById("room-selection-overlay") as HTMLCanvasElement; return !!c && c.width > 0; })`.
3. Lire les pixels : `const ctx = overlay.getContext("2d")!;` puis `getImageData` au
   **centre de la pièce 1** (converti en coordonnées canvas : l'overlay est à la
   résolution naturelle de l'image de carte — reprendre le facteur d'échelle des
   constantes du fixture) et au **centre de la pièce 2**.
4. Asserter : alpha(pièce 1 sélectionnée) < alpha(pièce 2 non sélectionnée), et
   alpha(pièce 2) > 40 (assombrie de façon perceptible). Ne PAS asserter de valeurs
   exactes (elles relèvent du design), seulement l'invariant relatif.
5. Désélectionner la pièce 1 (re-clic) → les deux alphas redeviennent équivalents
   (|Δ| < 10) — ou, si la désélection vide l'overlay, asserter ce comportement-là
   (caractérisation : figer le comportement OBSERVÉ, le documenter en commentaire).
6. Quitter le mode pièce (onglet All) → overlay vidé
   (`ctx.getImageData(...)` alpha ≈ 0 partout sur 3 points sondés).

**Verify**: le fichier seul → vert.

### Step 4: Suite complète

**Verify**: `CHROMIUM_BIN=/usr/bin/chromium npm run test:browser && npm run typecheck` → verts / exit 0.

## Test plan

Ce plan EST le test plan — 6 cas calibration + ≥4 assertions overlay. Modèles :
`room-selection.test.ts` (montage/clics), `segment-map-fallback.test.ts` (pixels).

## Done criteria

- [ ] `test-browser/calibration-fallback.test.ts` : 6 tests verts
- [ ] `test-browser/room-overlay-pixels.test.ts` : tests pixel verts (sélection,
      désélection, sortie de mode)
- [ ] `CHROMIUM_BIN=/usr/bin/chromium npm run test:browser` → toute la suite verte
- [ ] `npm run typecheck` → exit 0
- [ ] Aucun fichier de `src/` modifié (`git status`)
- [ ] Ligne de statut mise à jour dans `plans/README.md`

## STOP conditions

- Un cas de calibration provoque une **exception** au render (au lieu d'une
  dégradation propre) → c'est un bug produit réel : consigner le cas exact dans le
  rapport et dans `plans/README.md`, marquer ce plan BLOCKED sur ce cas, continuer
  les autres cas.
- L'overlay reste vide en mode pièce dans l'environnement de test (dépendance à une
  ressource que le fixture ne fournit pas) → rapporter ce qui manque, ne pas
  affaiblir les assertions jusqu'à les vider de sens.
- Les constantes de coordonnées de `room-selection.test.ts` n'existent pas sous ce
  nom (drift) → reprendre les constantes réelles du fichier.

## Maintenance notes

- Ces tests figent le comportement AVANT le découpage du god file (plan 014) : toute
  divergence après extraction est une régression, pas une « adaptation de test ».
- Si le design de l'overlay change (niveaux d'alpha), seuls les seuils relatifs
  doivent bouger — garder l'invariant « sélectionné plus clair que non sélectionné ».
