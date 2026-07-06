# Plan 006: Rendre déterministe le test de glisse adaptative du robot-overlay

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat cf8701f..HEAD -- test-browser/robot-overlay.test.ts src/dreame-vacuum-card.ts`
> On a mismatch with the "Current state" excerpts, STOP.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: tests
- **Planned at**: commit `cf8701f`, 2026-07-06

## Why this matters

Le test « interpolation adaptative » de `test-browser/robot-overlay.test.ts` dort
650 ms en temps réel puis asserte `marker.transitionMs < 1500`. Or le composant
calcule `transitionMs = clamp(400, intervalle_mesuré × 0.9, 4000)` à partir de
`Date.now()` : sur un runner CI chargé (GitHub Actions partagé, Chromium headless),
si l'intervalle réellement écoulé dépasse ~1667 ms, l'assertion `< 1500` échoue —
flakiness classique par timer réel. Le fix : dériver les bornes attendues du temps
**réellement mesuré** par le test lui-même, au lieu de supposer que le sleep nominal
de 650 ms s'est écoulé en 650 ms.

## Current state

- `test-browser/robot-overlay.test.ts:155-170` (extrait du test concerné) :

  ```ts
  await until(() => !!marker && marker.visible === true);
  // Avant toute cadence mesurée : durée de glisse par défaut.
  expect(marker.transitionMs).toBe(400);

  // Échantillon suivant ~650 ms plus tard → glisse ≈ 90 % de l'intervalle mesuré.
  await new Promise((r) => setTimeout(r, 650));
  pushRobotPosition(card, hass, { ...base, x: base.x + 300 });
  await until(() => marker.transitionMs > 400);
  expect(marker.transitionMs).toBeGreaterThan(400);
  expect(marker.transitionMs).toBeLessThan(1500);
  ```

- Ce que mesure le composant — `src/dreame-vacuum-card.ts:471-480` : au premier rendu
  avec une position, il mémorise `_lastRobotPosTs = Date.now()` ; quand la position
  change (`posKey` différent), il calcule
  `interval = Date.now() - _lastRobotPosTs` puis
  `_robotGlideMs = Math.min(4000, Math.max(400, Math.round(interval * 0.9)))`.
  L'intervalle mesuré démarre donc au **premier rendu de la position initiale**, pas
  au début du sleep du test.

- Le helper `until(condition, timeoutMs = 8000, stepMs = 50)` est dans
  `test-browser/fixtures/hass.ts:162-169`.

## Commands you will need

| Purpose   | Command | Expected on success |
|-----------|---------|---------------------|
| Suite navigateur | `CHROMIUM_BIN=/usr/bin/chromium npm run test:browser` | tous verts |
| Rejouer le fichier seul | `CHROMIUM_BIN=/usr/bin/chromium npx vitest run --config vitest.browser.config.ts test-browser/robot-overlay.test.ts` | vert |

## Scope

**In scope**:
- `test-browser/robot-overlay.test.ts` (uniquement le test « adapte la durée de
  glisse à la cadence mesurée des échantillons de position »)

**Out de scope**:
- `src/dreame-vacuum-card.ts` et `src/components/robot-marker.ts` — le comportement
  produit est correct, seul le test est fragile.
- Les autres tests du fichier.

## Git workflow

- Ne committe pas et ne pousse pas : l'utilisateur contrôle git.

## Steps

### Step 1: Borner par le temps réellement mesuré

Modifier le test pour encadrer l'intervalle vu par le composant :

```ts
await until(() => !!marker && marker.visible === true);
expect(marker.transitionMs).toBe(400);

// Encadre l'intervalle réellement vu par le composant : il démarre au plus tard
// quand `visible` passe à true (t0 pris après), et se termine au plus tôt juste
// avant le push (t1 pris avant) — bornes valides même sur un runner CI lent.
const t0 = Date.now();
await new Promise((r) => setTimeout(r, 650));
const t1 = Date.now();
pushRobotPosition(card, hass, { ...base, x: base.x + 300 });
await until(() => marker.transitionMs > 400);
const t2 = Date.now();

// borne basse : 90 % du temps minimal écoulé (t1 - t0), plancher 400 ;
// borne haute : 90 % du temps maximal écoulé (t2 - t0 + marge), plafond 4000.
const lower = Math.max(400, Math.floor((t1 - t0) * 0.9) - 50);
const upper = Math.min(4000, Math.ceil((t2 - t0) * 0.9) + 200);
expect(marker.transitionMs).toBeGreaterThanOrEqual(lower);
expect(marker.transitionMs).toBeLessThanOrEqual(upper);
```

Subtilité à respecter : `_lastRobotPosTs` est posé par le composant **avant** `t0`
(au premier rendu visible), donc l'intervalle du composant ≥ (t1 − t0) ; la borne
basse reste valide. La borne haute utilise t2 (après la détection du changement),
donc intervalle ≤ (t2 − t0) + le temps écoulé entre le rendu initial et t0 — d'où la
marge de 200 ms. Si en exécutant tu constates que la marge est trop juste (rendu
initial lent), élargis la marge haute à 500 ms mais ne réintroduis JAMAIS de
constante absolue du type `< 1500`.

**Verify**: la commande « Rejouer le fichier seul » → vert.

### Step 2: Robustesse répétée

**Verify**: lancer le fichier seul **5 fois de suite** (boucle shell) → 5/5 verts :

```bash
for i in 1 2 3 4 5; do CHROMIUM_BIN=/usr/bin/chromium npx vitest run --config vitest.browser.config.ts test-browser/robot-overlay.test.ts || exit 1; done
```

### Step 3: Suite complète

**Verify**: `CHROMIUM_BIN=/usr/bin/chromium npm run test:browser` → tous verts.

## Test plan

C'est un plan de test lui-même ; la vérification est le Step 2 (5 exécutions
consécutives vertes) + la suite complète. Aucun nouveau test à écrire.

## Done criteria

- [ ] Le test ne contient plus d'assertion à constante absolue de temps
      (`grep -n "1500" test-browser/robot-overlay.test.ts` → vide)
- [ ] 5 exécutions consécutives du fichier → 5/5 vertes
- [ ] `CHROMIUM_BIN=/usr/bin/chromium npm run test:browser` exit 0
- [ ] Aucun fichier hors scope modifié (`git status`)
- [ ] Ligne de statut mise à jour dans `plans/README.md`

## STOP conditions

- Le test échoue de façon répétée même avec les bornes mesurées — cela signifierait
  que la sémantique du composant diffère de la description (l'intervalle ne démarre
  pas au premier rendu visible) ; rapporter les valeurs observées
  (`marker.transitionMs`, t0/t1/t2) au lieu d'élargir les bornes à l'infini.
- Chromium indisponible localement (`CHROMIUM_BIN` invalide et pas de navigateurs
  Playwright) — rapporter, ne pas convertir le test en happy-dom.

## Maintenance notes

- Règle pour tout futur test de timing dans la suite navigateur : borner par des
  timestamps mesurés dans le test, jamais par des constantes nominales. Ce test sert
  d'exemplaire.
- Si un jour la formule du composant change (0.9 / plancher 400 / plafond 4000 —
  `src/dreame-vacuum-card.ts:476`), les bornes du test doivent suivre.
