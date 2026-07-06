# Plan 014: Extraire les sous-systèmes autonomes de dreame-vacuum-card.ts (2 168 lignes)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat cf8701f..HEAD -- src/dreame-vacuum-card.ts`
> Ce fichier AURA dérivé si les plans 002/003/010 sont passés avant (attendu et
> souhaitable) : vérifier alors que chaque méthode citée existe toujours (les numéros
> de ligne peuvent bouger, les noms non). Si une méthode citée a disparu/été
> renommée, STOP.

## Status

- **Priority**: P3
- **Effort**: L (4 extractions séquentielles, chacune livrable seule)
- **Risk**: LOW-MED — refactor sans changement de comportement, bien couvert par les
  suites existantes, MAIS fichier au churn le plus élevé du repo
- **Depends on**: 002, 003, 010 (touchent les mêmes zones — les faire d'abord évite
  les conflits) ; 011 + 012 fortement recommandés (baseline de couverture +
  caractérisation)
- **Category**: tech-debt
- **Planned at**: commit `cf8701f`, 2026-07-06

## Why this matters

`src/dreame-vacuum-card.ts` fait 2 168 lignes (~30 % du `src/`, 2ᵉ fichier = 730
lignes) et concentre le churn du repo (14 commits sur 90 jours). Il héberge des
sous-systèmes déjà quasi autonomes : hit-test/pick-canvas (~460 lignes),
double-buffering d'image, résolution de calibration, géométrie de l'overlay robot.
Chaque évolution oblige à naviguer le monolithe, et rien de tout cela n'est testable
unitairement tant que c'est enfoui dans le composant. Ce plan extrait 4 modules à
comportement STRICTEMENT identique — les suites unitaire et navigateur font foi.

## Current state

Inventaire des coutures (méthodes vérifiées à `cf8701f` ; retrouver par NOM, pas par
ligne) :

1. **Résolution de calibration** — `_getCalibration(config)` (l.732-772) : fonction
   quasi pure `(config, hass) → CalibrationPoint[] | undefined`, 6 sources
   (identity / points explicites / entity JSON / entity+attribute / camera /
   plateforme). Dépendances : `this.hass`, `PlatformGenerator`.
2. **Géométrie robot** — bloc inline de `render()` (l.425-483) : calcule
   `robotXPct/robotYPct/robotHeadingDeg/robotVisible/robotIconUrl` + cadence de
   glisse (`_lastRobotPosKey`, `_lastRobotPosTs`, `_robotGlideMs`) à partir de
   `camState.attributes.vacuum_position`, du `CoordinatesConverter` et des dimensions
   naturelles de l'image. Pur moyennant un petit état (dernier échantillon).
3. **Double-buffering d'image** — `_getMapSrc(config)` (l.854) +
   `_preloadMapImage(url)` (l.895) + les champs `_displayedMapUrl`/buffers associés
   (chercher `_displayedMapUrl` dans le fichier).
4. **Pick-canvas / hit-test / overlay pièces** — le plus gros morceau (l.1637-2096) :
   `_buildPickCanvas` (l.1651), `_hashString` (l.1677), `_hashRoomsStructure`
   (l.1686), `_loadSegmentMap` (l.1703), `_buildPickCanvasFromPolygons` (l.1760),
   `_getApiRoomPolygons`, `_updateRoomSelectionOverlay` (l.1896), `_buildRawToRoomId`,
   `_rawToLogicalRoomId`, `_hitTestRoom`, + caches (`_pickCanvas`, `_pickCtx`,
   `_pickData`, `_pickDataCacheKey`, `_lastPickCacheKey` — chercher ces champs).

Conventions du repo à respecter :
- Modules sous `src/model/` pour la logique métier (cf. `model/map_objects/`,
  `model/generators/`) ; le composant orchestre, les modules calculent.
- `ARCHITECTURE.md` documente la structure — à mettre à jour à chaque étape.
- Commentaires en français ; TypeScript strict ; Prettier.

Filets existants : suites `test/` (happy-dom) et `test-browser/` (Chromium — dont
hit-test, sélection, double-buffering, overlay robot ; + calibration/overlay pixels
si le plan 012 est passé). Baseline de couverture fusionnée si le plan 011 est passé
(`npm run test:coverage:merged`).

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Typecheck / lint / format | `npm run typecheck && npm run lint && npm run format:check` | exit 0 |
| Tests unitaires | `npm test` | verts |
| Tests navigateur | `CHROMIUM_BIN=/usr/bin/chromium npm run test:browser` | verts |
| Build | `npm run rollup` | exit 0 |
| Taille restante | `wc -l src/dreame-vacuum-card.ts` | décroissante à chaque étape |

## Scope

**In scope**:
- `src/dreame-vacuum-card.ts`
- Nouveaux fichiers : `src/model/map/calibration-resolver.ts`,
  `src/model/map/robot-overlay-geometry.ts`, `src/model/map/map-image-buffer.ts`,
  `src/model/map/room-pick-engine.ts` (répertoire `src/model/map/` à créer)
- `ARCHITECTURE.md` (structure des répertoires)
- Nouveaux tests unitaires `test/map-*.test.ts`

**Out of scope**:
- `src/components/**`, `src/model/map_objects/**`, `src/model/map_mode/**` — ne pas
  « profiter » du refactor pour les toucher.
- Tout changement de comportement, même « évidemment mieux » : ce plan est un
  déplacement de code. Les améliorations repérées se consignent dans le rapport.
- `card-styles.ts`, le template de `render()` (le HTML/SVG reste dans le composant).

## Git workflow

- Ne committe pas et ne pousse pas : l'utilisateur contrôle git. Vu la taille,
  signaler la fin de CHAQUE étape dans le rapport pour permettre à l'utilisateur de
  committer étape par étape s'il le souhaite.

## Steps

Chaque étape suit le même rituel : extraire, déléguer, puis le **gate complet** :
`npm run typecheck && npm run lint && npm run format:check && npm test &&
CHROMIUM_BIN=/usr/bin/chromium npm run test:browser` → tout vert avant l'étape
suivante. Ne JAMAIS enchaîner deux extractions sans gate vert.

### Step 1: `calibration-resolver.ts` (le plus simple — étalon de la méthode)

Créer `src/model/map/calibration-resolver.ts` exportant une fonction pure :

```ts
export function resolveCalibration(
    config: CardPresetConfig,
    hass: HomeAssistantFixed | undefined
): CalibrationPoint[] | undefined { /* corps actuel de _getCalibration, `this.hass` → `hass` */ }
```

Dans le composant, `_getCalibration` devient un one-liner de délégation (le garder
comme méthode privée pour ne pas toucher ses appelants). Écrire des tests unitaires
directs de `resolveCalibration` (les 6 branches — reprendre les cas du plan 012 en
version pure, y compris JSON invalide et `!hass`).

**Verify**: gate complet + `wc -l src/dreame-vacuum-card.ts` a diminué.

### Step 2: `robot-overlay-geometry.ts`

Créer une fonction pure qui prend `{ camState, converter, natW, natH, prevSample }`
et retourne `{ xPct, yPct, headingDeg, visible, iconUrl, glideMs, nextSample }` — le
bloc l.425-483 de `render()` (y compris le déroulement d'angle si le plan 003 est
passé : l'état `_lastRobotHeadingDeg` entre dans `prevSample`/`nextSample`).
`Date.now()` reste appelé par le composant et passé en paramètre `nowMs` (fonction
pure = testable sans horloge). Le composant conserve un unique champ
`_robotSample` remplaçant les champs épars. Tests unitaires : positions,
franchissement ±180°, cadence de glisse (bornes 400/4000), robot invisible.

**Verify**: gate complet (le test navigateur `robot-overlay.test.ts` est le juge de paix).

### Step 3: `map-image-buffer.ts`

Extraire `_getMapSrc`/`_preloadMapImage` + leurs champs dans une classe
`MapImageBuffer` (état : URL affichée, préchargements en cours) avec une interface
minimale du type `resolveSrc(config, hass): string` + `preload(url, onReady)`. Le
composant délègue ; le comportement anti-flash (l'ancienne image reste tant que la
nouvelle n'est pas décodée) est verrouillé par
`test-browser/map-double-buffering.test.ts`.

**Verify**: gate complet.

### Step 4: `room-pick-engine.ts` (le gros morceau — en dernier)

Créer une classe `RoomPickEngine` encapsulant pick-canvas, hashes, caches et
hit-test : constructeur sans DOM du composant (elle possède SES canvases off-screen),
API du type :

```ts
class RoomPickEngine {
    ensurePickCanvas(camAttributes, roomsConfig): void;   // _buildPickCanvas + fallback polygones
    hitTest(xNat, yNat): string | number | undefined;     // _hitTestRoom + _rawToLogicalRoomId
    drawSelectionOverlay(overlayCanvas, mapImg, selectedRooms, activeTab): void; // _updateRoomSelectionOverlay
}
```

Déplacer les méthodes une par une EN GARDANT leurs noms dans l'engine ; le composant
garde des méthodes de délégation aux mêmes noms le temps de l'extraction, puis
supprimer les délégations devenues triviales quand tout est vert. Points de
vigilance : les caches par clé de structure (`_hashRoomsStructure`) et le cache
`getImageData` (`_pickData`) doivent déménager avec l'engine — aucun cache ne doit
rester en double dans le composant.

**Verify**: gate complet ; `test-browser/room-selection.test.ts`,
`segment-map-fallback.test.ts` (et `room-overlay-pixels.test.ts` du plan 012) sont
les juges de paix.

### Step 5: Documentation

Mettre à jour `ARCHITECTURE.md` : ajouter `src/model/map/` à la structure des
répertoires avec une ligne par module, et retirer de la description de
`dreame-vacuum-card.ts` les responsabilités extraites.

**Verify**: `grep -n "model/map/" ARCHITECTURE.md` → présent ;
`wc -l src/dreame-vacuum-card.ts` → **≤ 1400** (cible indicative : ~35 % de moins).

## Test plan

- Nouveaux tests unitaires par module extrait (calibration : 6 branches ; géométrie
  robot : ≥6 cas ; les deux autres modules sont couverts par les suites navigateur
  existantes + tests unitaires ciblés si une logique pure s'y prête).
- Non-régression : les DEUX suites intégralement vertes après CHAQUE étape.
- Si le plan 011 est passé : comparer `test:coverage:merged` avant/après — la
  couverture globale de la logique extraite doit monter (elle devient testable
  unitairement), jamais descendre.

## Done criteria

- [ ] 4 modules créés sous `src/model/map/`, chacun avec ses tests
- [ ] `wc -l src/dreame-vacuum-card.ts` ≤ 1400
  > **Amendé en revue (2026-07-06)** : résultat réel 1659 lignes. Le seuil 1400 était
  > une mauvaise estimation du plan — l'inventaire complet des coutures (y compris
  > `_polygonArea` et `_apiRoomPolygonsCache`, découverts en cours) ne représente que
  > ~524 lignes nettes ; le reste est de l'orchestration explicitement hors scope.
  > Critère effectif : toutes les coutures de l'inventaire extraites sans duplication.
  > Couverture : l'AGRÉGAT « All files » monte (82,16 → 82,81 % stmts) et chaque zone
  > extraite est en hausse ou maintenue dans son module (95,65 / 100 / 91,89 / 87,82 %) ;
  > le chiffre isolé du fichier (67,88 → 61,03 %) baisse mécaniquement car le code le
  > mieux couvert l'a quitté — artefact de composition, zéro zone perdue.
- [ ] Gate complet vert (typecheck, lint, format, unit, browser) + `npm run rollup` exit 0
- [ ] Aucun changement de comportement : aucune modification dans les fichiers de
      test EXISTANTS autre que d'éventuels imports (les assertions ne bougent pas)
- [ ] `ARCHITECTURE.md` à jour
- [ ] Ligne de statut mise à jour dans `plans/README.md`

## STOP conditions

- Un test navigateur existant casse après une extraction et la cause n'est pas
  évidente en relisant le déplacement → revenir à l'état vert précédent (les étapes
  sont indépendantes) et rapporter, ne pas « adapter » le test.
- Une méthode citée a des dépendances non listées ici (ex. un champ partagé avec une
  autre zone du composant) rendant l'extraction non mécanique → rapporter la
  dépendance découverte avant de continuer.
- Le fichier a tellement dérivé que l'inventaire des coutures ne correspond plus
  (méthodes renommées/déplacées) → rapporter, le plan doit être rebasé.
- Les plans 002/003/010 ne sont PAS passés (leur code est encore dans les zones à
  extraire) → exécuter ces plans d'abord ; ne pas fusionner leurs correctifs dans ce
  refactor.

## Maintenance notes

- Règle post-extraction : toute nouvelle logique carte (pas UI) naît dans
  `src/model/map/`, testée unitairement — le composant n'accueille plus que de
  l'orchestration et du template.
- Reviewer : diff volumineux — vérifier en priorité que c'est du déplacement pur
  (comparer les corps de fonctions déplacées, pas seulement les tests).
- Suivi différé : `_getMousePosition`, la gestion de sélection et les handlers
  d'events restent dans le composant — extractibles plus tard si le besoin émerge,
  hors scope ici.
