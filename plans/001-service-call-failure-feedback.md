# Plan 001: Donner un retour d'échec sur tous les appels de service et rendre l'échec testable

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat cf8701f..HEAD -- src/components/action-buttons.ts src/components/cleaning-mode-chip.ts test-browser/fixtures/hass.ts`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: bug
- **Planned at**: commit `cf8701f`, 2026-07-06

## Why this matters

Les boutons pause/stop/démarrage/retour-base (`action-buttons.ts`) et le changement de
mode de nettoyage (`cleaning-mode-chip.ts`) appellent `hass.callService` sans jamais
traiter un rejet : si le robot est hors-ligne ou que HA rejette l'appel, l'utilisateur
n'a **aucun** retour (pas de haptic d'échec, rien) — seule une promesse rejetée non
gérée apparaît en console. Le composant principal gère pourtant déjà ce cas
correctement (pattern de référence ci-dessous). En parallèle, aucun test du repo ne
construit un `callService` qui rejette : la branche d'échec du code de référence
lui-même n'est couverte par aucun test. Ce plan uniformise le retour d'échec et rend
le chemin d'échec testable.

## Current state

- `src/components/action-buttons.ts:39-45` — `_callService` (utilisé par les boutons
  pause/stop/start/return_to_base), fire-and-forget :

  ```ts
  private _callService(action: string): void {
      if (!this.hass || !this.entityId) return;
      forwardHaptic("light");
      // HA 2024+ recommande de passer entity_id via `target` plutôt que serviceData,
      // pour bénéficier du resolving area_id/floor_id/label_id.
      this.hass.callService("vacuum", action, undefined, { entity_id: this.entityId });
  }
  ```

  (`forwardHaptic` est déjà importé dans ce fichier depuis `../ha`.)

- `src/components/cleaning-mode-chip.ts:161-186` — `_selectChoice` fait 3 appels de
  service : ligne 168 (fire-and-forget, cas CleanGenius), ligne 178 (`await` sans
  try/catch — une rejection remonte en unhandled rejection), ligne 185
  (fire-and-forget, application du mode manuel). Ce fichier n'importe **pas**
  `forwardHaptic` actuellement (imports actuels : `localize`, `computeStateDisplay`,
  types Lit).

- **Pattern de référence du repo** — `src/dreame-vacuum-card.ts:1330-1345` (`_run`) :

  ```ts
  this.hass
      .callService(serviceCall.domain, serviceCall.service, serviceCall.serviceData, serviceCall.target)
      .then(
          () => {
              forwardHaptic("success");
              // ...
          },
          () => {
              forwardHaptic("failure");
          }
      );
  ```

- `test-browser/fixtures/hass.ts:139-142` — le mock `callService` résout toujours :

  ```ts
  callService: (domain: string, service: string, data: Record<string, unknown>) => {
      calls.push({ domain, service, data });
      return Promise.resolve();
  },
  ```

- `forwardHaptic` (exporté par `src/ha/index.ts`) émet un event `haptic` sur
  `window` avec le type en détail — lire sa définition dans `src/ha/index.ts` avant
  d'écrire les assertions de test.

- Conventions du repo : TypeScript strict, Prettier obligatoire (`npm run format:check`
  passe en CI sur `src/`), commentaires en français.

## Commands you will need

| Purpose   | Command                  | Expected on success |
|-----------|--------------------------|---------------------|
| Typecheck | `npm run typecheck`      | exit 0              |
| Lint      | `npm run lint`           | exit 0              |
| Format    | `npm run format:check`   | exit 0              |
| Tests unitaires | `npm test`         | tous verts (≥778 tests) |
| Tests navigateur (local) | `CHROMIUM_BIN=/usr/bin/chromium npm run test:browser` | tous verts |

## Scope

**In scope** (the only files you should modify):
- `src/components/action-buttons.ts`
- `src/components/cleaning-mode-chip.ts`
- `test-browser/fixtures/hass.ts` (extension du fixture)
- `test/components.test.ts` ou `test/components-extra.test.ts` (nouveaux tests)
- Un fichier de test navigateur existant ou nouveau sous `test-browser/`

**Out of scope** (do NOT touch, even though they look related):
- `src/dreame-vacuum-card.ts` — son `_run()` gère déjà l'échec correctement.
- `src/ha/index.ts` (`forwardHaptic`, `handleAction`) — durci séparément par le plan 007.
- Toute modification du *timing* des appels dans `_selectChoice` (la boucle d'attente
  de 8×400 ms est un comportement voulu, documenté en commentaire).

## Git workflow

- Ne committe pas et ne pousse pas : l'utilisateur contrôle git. Laisse toutes les
  modifications dans l'arbre de travail et signale-les dans ton rapport final.

## Steps

### Step 1: Retour d'échec dans `action-buttons.ts`

Dans `_callService`, chaîner le pattern de référence sur l'appel existant :

```ts
this.hass.callService("vacuum", action, undefined, { entity_id: this.entityId }).then(
    () => forwardHaptic("success"),
    () => forwardHaptic("failure")
);
```

Garder le `forwardHaptic("light")` initial (retour immédiat au tap, voulu).

**Verify**: `npm run typecheck` → exit 0

### Step 2: Retour d'échec dans `cleaning-mode-chip.ts`

1. Ajouter l'import : `import { forwardHaptic } from "../ha";`
2. Ligne ~168 (cas CleanGenius) : appliquer le même `.then(success, failure)`.
3. Envelopper le reste du corps de `_selectChoice` (à partir du `await` ligne ~178
   jusqu'à l'appel ligne ~185 inclus) dans un `try { ... } catch { forwardHaptic("failure"); return; }`,
   et faire du dernier appel (ligne ~185) un `await` suivi de `forwardHaptic("success")`
   dans le `try`. Ne pas modifier la boucle d'attente interne.

**Verify**: `npm run typecheck && npm run lint` → exit 0

### Step 3: Fixture navigateur avec `callService` rejetable

Dans `test-browser/fixtures/hass.ts`, permettre aux tests de faire échouer les appels,
sans changer le comportement par défaut. Modification minimale : exposer le résultat
comme champ mutable du retour de `makeHass`, par exemple :

```ts
const behavior = { rejectCalls: false };
// ...dans l'objet hass :
callService: (domain: string, service: string, data: Record<string, unknown>) => {
    calls.push({ domain, service, data });
    return behavior.rejectCalls ? Promise.reject(new Error("service failed (test)")) : Promise.resolve();
},
// ...et retourner { hass, calls, images, behavior }
```

Propager `behavior` dans le retour de `mountCard` (même fichier, l.184-195).

**Verify**: `CHROMIUM_BIN=/usr/bin/chromium npm run test:browser` → tous les tests
existants passent encore (le défaut n'a pas changé).

### Step 4: Tests

Voir « Test plan ». Écrire les tests, puis :

**Verify**: `npm test` → verts, incluant les nouveaux ;
`CHROMIUM_BIN=/usr/bin/chromium npm run test:browser` → verts.

## Test plan

- **Unitaire (happy-dom)** — dans `test/components-extra.test.ts` (il mocke déjà
  `callService` avec `.mockResolvedValue(undefined)` — suivre sa structure) :
  - `dreame-action-buttons` : un `callService` qui rejette → un event `haptic` de
    type `failure` est émis sur `window` (poser un listener avant le clic) ; un
    `callService` qui résout → `success`.
  - `dreame-cleaning-mode-chip` : `_selectChoice` avec un `callService` rejetant →
    event `failure`, pas d'unhandled rejection (le test ne doit pas produire de
    warning Vitest « Unhandled Rejection »).
- **Navigateur** — un cas dans la suite existante qui exerce `_run()` (voir
  `test-browser/room-selection.test.ts` ou `zone-mode.test.ts`, qui déclenchent des
  services Dreame réels) : activer `behavior.rejectCalls = true`, déclencher un
  nettoyage, asserter que l'event `haptic` `failure` est émis et que la carte ne
  jette pas (la sélection reste intacte).
- Vérification : `npm test` et `npm run test:browser` verts, ≥3 nouveaux tests.

## Done criteria

- [ ] `npm run typecheck` exit 0 ; `npm run lint` exit 0 ; `npm run format:check` exit 0
- [ ] `npm test` exit 0 avec les nouveaux tests d'échec
- [ ] `CHROMIUM_BIN=/usr/bin/chromium npm run test:browser` exit 0
- [ ] `grep -n "callService" src/components/action-buttons.ts src/components/cleaning-mode-chip.ts`
      → chaque appel est suivi d'une gestion d'échec (`.then(`/`try`)
- [ ] Aucun fichier hors scope modifié (`git status`)
- [ ] Ligne de statut mise à jour dans `plans/README.md`

## STOP conditions

Stop and report back (do not improvise) if:

- Le code aux emplacements cités ne correspond plus aux extraits (drift).
- `forwardHaptic` dans `src/ha/index.ts` n'émet pas d'event observable depuis un test
  (impossible d'asserter) — rapporter la sémantique réelle trouvée.
- La suite navigateur échoue déjà **avant** toute modification (environnement cassé).

## Maintenance notes

- Tout futur bouton/appel de service dans un composant doit suivre ce même pattern
  (`.then(success, failure)` + haptics) — le reviewer doit le vérifier sur les
  prochains composants.
- Le champ `behavior.rejectCalls` du fixture est là pour tous les futurs tests de
  chemins d'échec ; ne pas le dupliquer.
