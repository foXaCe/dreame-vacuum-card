# Plan 004: Filtrer les re-rendus des composants feuilles sur les ticks `hass` non pertinents

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat cf8701f..HEAD -- src/components/ src/utils/ha-change-detection.ts`
> On a mismatch with the "Current state" excerpts, STOP.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: perf
- **Planned at**: commit `cf8701f`, 2026-07-06

## Why this matters

Le composant principal passe `.hass=${this.hass}` à 4 composants feuilles
(`dreame-status-header`, `dreame-cleaning-mode-chip`, `dreame-cleaning-progress-bar`,
`dreame-action-buttons`) à chaque rendu. HA remplace l'objet `hass` entier à chaque
state-changed ; le dirty-check par référence de Lit déclenche donc un render+diff
complet des 4 composants à chaque tick. Pendant un nettoyage actif, le composant hôte
rend jusqu'à ~5×/s (throttle à 200 ms dans son `shouldUpdate`,
`src/dreame-vacuum-card.ts:325-354`) : ce sont 4 render+diff supplémentaires ~5×/s
pour des données (batterie, mode, progression) qui ne changent presque jamais à cette
cadence, empilés sur le travail canvas/overlay déjà présent. Un `shouldUpdate` par
composant, comparant uniquement les entités réellement lues, supprime ce travail.

## Current state

Aucun des 4 composants ne définit `shouldUpdate`
(`grep -ln "shouldUpdate" src/components/*.ts` → vide). Ce que chacun lit dans `hass` :

- `src/components/status-header.ts` — `states[this.entityId]` (l.57), les sensors
  frères résolus par `_resolveSibling()` (cache par `entityId`, l.23-50 : sensors
  `_state`, et via `readSensor` d'autres suffixes), `hass.locale?.language` (l.63),
  `hass.entities` (l.34, pour la résolution — mise en cache).
- `src/components/cleaning-progress-bar.ts` — `states[this._progressEntityId]`
  (l.42), entité résolue et cachée par `_findProgressEntity()` (l.17-30).
- `src/components/cleaning-mode-chip.ts` — `states[modeId]` et `states[cgId]`,
  entités `select.` résolues et cachées par `_getCleaningModeEntity()` (l.32-51) /
  `_getCleanGeniusEntity()` (l.54-75).
- `src/components/action-buttons.ts` — `states[this.entityId]` (état du vacuum pour
  choisir les boutons) ; `hass` sert aussi dans `_callService`.

Helper existant réutilisable — `src/utils/ha-change-detection.ts:36-43` :

```ts
export function checkIfEntitiesChanged(
    entities: string[],
    oldHass: HomeAssistantFixed,
    newHass: HomeAssistantFixed
): boolean {
    const changedEntities = entities.filter((entity) => oldHass.states[entity] !== newHass.states[entity]);
    return changedEntities.length > 0;
}
```

Le pattern hôte à imiter : `hasConfigOrAnyEntityChanged` (même fichier, l.19-34) —
retourne `true` si autre chose que `_hass` a changé, sinon compare les références
`states[entity]`.

## Commands you will need

| Purpose   | Command                  | Expected on success |
|-----------|--------------------------|---------------------|
| Typecheck / lint / format | `npm run typecheck && npm run lint && npm run format:check` | exit 0 |
| Tests unitaires | `npm test`         | tous verts          |
| Tests navigateur | `CHROMIUM_BIN=/usr/bin/chromium npm run test:browser` | tous verts |

## Scope

**In scope**:
- `src/components/status-header.ts`, `cleaning-progress-bar.ts`,
  `cleaning-mode-chip.ts`, `action-buttons.ts`
- `src/utils/ha-change-detection.ts` (éventuel helper partagé)
- `test/components.test.ts` / `test/components-extra.test.ts` (tests)
- `test/utils-conditions.test.ts` (tests du helper — c'est le foyer existant des tests
  de `ha-change-detection.ts` ; ajouté au scope lors de la revue du 2026-07-06, le
  plan initial l'avait omis)

**Out of scope**:
- `src/dreame-vacuum-card.ts` — son throttling hôte est correct, ne pas y toucher.
- `src/components/robot-marker.ts`, `robot-animation.ts`, `tab-selector.ts` — ils ne
  reçoivent pas `hass`, rien à filtrer.

## Git workflow

- Ne committe pas et ne pousse pas : l'utilisateur contrôle git.

## Steps

### Step 1: Helper de filtrage

Dans `src/utils/ha-change-detection.ts`, ajouter un helper dédié aux composants
feuilles (commentaire français) :

```ts
/** shouldUpdate pour un composant feuille qui ne lit que quelques entités de `hass` :
 *  si SEUL `hass` a changé, ne re-rendre que si l'une des entités listées a changé
 *  de référence. Tout autre changement de propriété force le rendu. */
export function shouldUpdateForEntities(
    changedProps: PropertyValues,
    newHass: HomeAssistantFixed | undefined,
    entityIds: (string | null | undefined)[]
): boolean {
    const keys = Array.from(changedProps.keys());
    if (!(keys.length === 1 && keys[0] === "hass")) return true;
    const oldHass = changedProps.get("hass") as HomeAssistantFixed | undefined;
    if (!oldHass || !newHass) return true;
    return entityIds.some((id) => !!id && oldHass.states[id] !== newHass.states[id]);
}
```

**Verify**: `npm run typecheck` → exit 0

### Step 2: `shouldUpdate` par composant

Dans chaque composant, ajouter `protected shouldUpdate(changedProps: PropertyValues): boolean`
qui appelle `shouldUpdateForEntities` avec **les entités que ce composant lit** :

- `cleaning-progress-bar.ts` : `[this.entityId, this._progressEntityId]`.
- `cleaning-mode-chip.ts` : `[this.entityId, this._cachedModeEntityId, this._cachedCgEntityId]`.
- `action-buttons.ts` : `[this.entityId]`.
- `status-header.ts` : `[this.entityId, ...toutes les valeurs du cache _siblingCache]`
  — les ids de sensors frères sont dans `this._siblingCache.values()` (filtrer les
  `undefined`). **Attention** : au tout premier rendu le cache est vide → le helper
  retourne `true` de toute façon (changement de `entityId`/`hass` initial passe par
  `keys.length === 1` false ou `oldHass` undefined). Si le composant n'a pas encore
  résolu ses siblings (cache vide) et que seul `hass` change, retourner `true` tant
  que `this._siblingCache.size === 0` pour ne pas rater la première résolution.

Importer `PropertyValues` depuis `lit` là où absent.

**Verify**: `npm run typecheck && npm run lint && npm run format:check` → exit 0

### Step 3: Tests

Voir « Test plan », puis :

**Verify**: `npm test && CHROMIUM_BIN=/usr/bin/chromium npm run test:browser` → verts
(aucune régression sur les suites existantes — c'est le vrai filet de ce plan).

## Test plan

Dans `test/components.test.ts` ou `components-extra.test.ts` (suivre leur structure de
montage happy-dom), pour au moins `status-header` et `progress-bar` :

1. Monter le composant avec un `hass` de test, attendre `updateComplete`.
2. Espionner les rendus : `const renderSpy = vi.spyOn(el as never, "render" as never)`
   (ou compter via `el.updated`).
3. Assigner un **nouveau** `hass` (`{ ...hass, states: { ...hass.states,
   "sensor.unrelated": { state: "x", attributes: {} } } }`) où seule une entité NON
   suivie change → asserter que `render` n'a PAS été rappelé.
4. Assigner un nouveau `hass` où l'entité suivie change de référence → asserter que
   `render` A été rappelé et que le DOM reflète la nouvelle valeur.
5. Cas `status-header` supplémentaire : un sensor frère (ex. batterie) change →
   re-rendu attendu.

Vérification : `npm test` vert, ≥6 nouveaux tests.

## Done criteria

- [ ] `npm run typecheck && npm run lint && npm run format:check` → exit 0
- [ ] `grep -ln "shouldUpdate" src/components/status-header.ts src/components/cleaning-mode-chip.ts src/components/cleaning-progress-bar.ts src/components/action-buttons.ts` → 4 fichiers
- [ ] `npm test` exit 0 avec les nouveaux tests
- [ ] `CHROMIUM_BIN=/usr/bin/chromium npm run test:browser` exit 0 (non-régression)
- [ ] Aucun fichier hors scope modifié (`git status`)
- [ ] Ligne de statut mise à jour dans `plans/README.md`

## STOP conditions

- Un composant lit dans `hass` autre chose que ce que liste « Current state »
  (relire son `render()` en entier avant d'écrire le filtre) et la liste d'entités ne
  suffit pas à décrire ses dépendances → rapporter la dépendance manquante.
- Une suite navigateur existante casse après l'ajout d'un filtre (signe qu'un rendu
  nécessaire a été filtré) — identifier lequel et rapporter, ne pas élargir le filtre
  au hasard.
- `hass.locale` s'avère changer de référence indépendamment des états pendant les
  tests (le filtre raterait un changement de langue) — rapporter, la solution serait
  d'inclure `oldHass.locale !== newHass.locale` dans le helper.

## Maintenance notes

- Tout futur composant feuille recevant `hass` doit implémenter le même
  `shouldUpdate` — à vérifier en review.
- Si un composant se met à lire une nouvelle entité (ex. un nouveau sensor frère),
  sa liste d'entités suivies doit être mise à jour en même temps — c'est LE piège de
  ce pattern ; le test « entité non suivie → pas de re-rendu » le documentera.
