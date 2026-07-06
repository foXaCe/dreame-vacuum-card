# Plan 003: Dérouler l'angle du cap robot pour supprimer le tour complet à ±180°

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat cf8701f..HEAD -- src/dreame-vacuum-card.ts src/utils/misc.ts test-browser/robot-overlay.test.ts`
> On a mismatch with the "Current state" excerpts, STOP.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: bug
- **Planned at**: commit `cf8701f`, 2026-07-06

## Why this matters

Le cap du robot (overlay anti-flash) est calculé par `Math.atan2(...)`, donc borné à
`(-180°, 180°]`, et appliqué tel quel via `transform: rotate(Xdeg)` avec une
transition CSS de 0,4 s. Quand le cap réel franchit la limite (ex. 178° → -175°, une
rotation physique de ~7°), le navigateur interpole numériquement de 178 à -175, soit
~353° dans le mauvais sens : le robot semble faire un tour complet sur lui-même à
chaque virage proche de ±180°. Glitch visible et répétable pendant le nettoyage.
Le fix classique est de « dérouler » l'angle : conserver la valeur précédente et lui
ajouter le delta normalisé dans [-180, 180], pour que la valeur transmise au CSS soit
continue (elle peut librement dépasser ±360°, `rotate(538deg)` est valide).

## Current state

- `src/dreame-vacuum-card.ts:460-465` (dans `render()`, bloc robot overlay) :

  ```ts
  const aRad = ((robotPos.a ?? 0) * Math.PI) / 180;
  const p1 = this.coordinatesConverter.vacuumToMap(
      robotPos.x + Math.cos(aRad),
      robotPos.y + Math.sin(aRad)
  );
  robotHeadingDeg = (Math.atan2(p1[1] - p0[1], p1[0] - p0[0]) * 180) / Math.PI;
  robotVisible = true;
  ```

  Juste après (l.471-480) existe déjà un état persistant analogue pour la position :
  `this._lastRobotPosKey` / `this._lastRobotPosTs` / `this._robotGlideMs` — suivre le
  même style pour le nouvel état d'angle.

- `src/components/robot-marker.ts:49` applique `transform: rotate(${this.headingDeg}deg)`,
  et `#icon` a `transition: transform 0.4s linear` (l.103). Ne rien changer dans ce
  composant.

- `src/utils/misc.ts` — module utilitaire existant (fonctions pures), ré-exporté par
  `src/utils/index.ts`. C'est là que va la fonction pure.

- `test-browser/robot-overlay.test.ts` — contient le helper `pushRobotPosition(card,
  hass, position)` (l.128-142) qui pousse une nouvelle `vacuum_position` par mise à
  jour immuable de `hass`. À réutiliser pour le test navigateur.

## Commands you will need

| Purpose   | Command                  | Expected on success |
|-----------|--------------------------|---------------------|
| Typecheck / lint / format | `npm run typecheck && npm run lint && npm run format:check` | exit 0 |
| Tests unitaires | `npm test`         | tous verts          |
| Tests navigateur | `CHROMIUM_BIN=/usr/bin/chromium npm run test:browser` | tous verts |

## Scope

**In scope**:
- `src/utils/misc.ts` (nouvelle fonction pure + export)
- `src/dreame-vacuum-card.ts` (bloc robot overlay de `render()` uniquement, +1 champ privé)
- `test/utils.test.ts` (tests de la fonction pure)
- `test-browser/robot-overlay.test.ts` (test de continuité)

**Out of scope**:
- `src/components/robot-marker.ts` — le composant reste un consommateur passif.
- La logique de glisse de position (`_robotGlideMs`) — indépendante du cap.

## Git workflow

- Ne committe pas et ne pousse pas : l'utilisateur contrôle git.

## Steps

### Step 1: Fonction pure `unwrapAngleDeg`

Dans `src/utils/misc.ts`, ajouter (commentaire en français, comme le reste du fichier) :

```ts
/** Déroule un angle en degrés : retourne la valeur continue la plus proche de `prev`
 *  équivalente à `next` modulo 360. Évite qu'une transition CSS `rotate()` parte
 *  dans le mauvais sens au franchissement de ±180°. */
export function unwrapAngleDeg(prev: number | undefined, next: number): number {
    if (prev === undefined || !Number.isFinite(prev)) return next;
    const delta = ((((next - prev) % 360) + 540) % 360) - 180;
    return prev + delta;
}
```

Vérifier que `src/utils/index.ts` ré-exporte `misc.ts` (c'est le cas à `cf8701f`).

**Verify**: `npm run typecheck` → exit 0

### Step 2: Utilisation dans le composant principal

Dans `src/dreame-vacuum-card.ts` :

1. Ajouter un champ privé près de `_lastRobotPosKey` (cherche `private _lastRobotPosKey`) :
   `private _lastRobotHeadingDeg?: number;`
2. Après le calcul de `robotHeadingDeg` (l.465), dérouler et mémoriser :

   ```ts
   robotHeadingDeg = unwrapAngleDeg(this._lastRobotHeadingDeg, robotHeadingDeg);
   this._lastRobotHeadingDeg = robotHeadingDeg;
   ```

3. Réinitialiser `this._lastRobotHeadingDeg = undefined;` dans `_setPreset()`
   (méthode l.825, qui purge déjà les buffers d'image quand la caméra change) pour ne
   pas dérouler à travers un changement de preset/robot.
4. Importer `unwrapAngleDeg` depuis `../utils` ou `./utils` selon le style des imports
   existants du fichier (vérifier les imports en tête de fichier et s'y conformer).

**Verify**: `npm run typecheck && npm run lint && npm run format:check` → exit 0

### Step 3: Tests

Voir « Test plan », puis :

**Verify**: `npm test && CHROMIUM_BIN=/usr/bin/chromium npm run test:browser` → verts.

## Test plan

- **Unitaire** (`test/utils.test.ts`, suivre le style des tests existants du fichier) —
  cas pour `unwrapAngleDeg` :
  - `unwrapAngleDeg(undefined, 90)` → `90` (premier échantillon inchangé)
  - `unwrapAngleDeg(178, -175)` → `185` (delta +7, pas -353)
  - `unwrapAngleDeg(-178, 175)` → `-185` (sens inverse)
  - `unwrapAngleDeg(0, 180)` → `180` ; `unwrapAngleDeg(720, 10)` → valeur ≡ 10 (mod 360)
    la plus proche de 720 (soit `730`)
  - `unwrapAngleDeg(NaN, 42)` → `42`
- **Navigateur** (`test-browser/robot-overlay.test.ts`) : monter une carte avec
  robot visible (suivre le test « interpolation adaptative » existant), pousser via
  `pushRobotPosition` une séquence de positions dont le cap écran passe de ~178° à
  ~-175°, lire `marker.headingDeg` avant/après et asserter
  `Math.abs(after - before) < 180` (continuité). Note : la calibration des fixtures
  est vacuum = map × 10 sans rotation, donc l'angle écran suit `robotPos.a` — choisir
  `a` en conséquence.
- Vérification : les deux suites vertes, ≥6 nouveaux cas unitaires + 1 navigateur.

## Done criteria

- [ ] `npm run typecheck && npm run lint && npm run format:check` → exit 0
- [ ] `npm test` exit 0 (nouveaux cas `unwrapAngleDeg` inclus)
- [ ] `CHROMIUM_BIN=/usr/bin/chromium npm run test:browser` exit 0 (test de continuité inclus)
- [ ] `grep -n "unwrapAngleDeg" src/dreame-vacuum-card.ts src/utils/misc.ts` → présent
      aux deux endroits
- [ ] Aucun fichier hors scope modifié (`git status`)
- [ ] Ligne de statut mise à jour dans `plans/README.md`

## STOP conditions

- Les extraits ne correspondent plus (drift) — notamment si le calcul du cap a déjà
  été déplacé hors de `render()` (plan 014 exécuté avant) : rapporter le nouvel
  emplacement au lieu d'improviser.
- Le test navigateur montre que `marker.headingDeg` ne reflète pas la valeur calculée
  (une autre normalisation existerait en aval) — rapporter.

## Maintenance notes

- Si le plan 014 extrait la géométrie robot en fonction pure, `unwrapAngleDeg` et
  l'état `_lastRobotHeadingDeg` doivent migrer avec elle (l'état devient un paramètre).
- Reviewer : vérifier qu'aucun code n'applique de `% 360` en aval du déroulement, ce
  qui recasserait la continuité.
