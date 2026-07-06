# Plan 015: Dégraisser la CI (matrice build) et renommer les types Xiaomi* → Dreame*

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat cf8701f..HEAD -- .github/workflows/ci.yml src/`
> Pour la partie B, le compte d'occurrences aura naturellement dérivé si d'autres
> plans sont passés — c'est le typecheck qui fait foi, pas le compte exact.

## Status

- **Priority**: P3
- **Effort**: S (partie A) + M (partie B)
- **Risk**: LOW
- **Depends on**: 005 (édite aussi `ci.yml` — le faire d'abord) ; **exécuter la
  partie B EN DERNIER de tous les plans** (renommage massif = conflits avec tout
  plan touchant `src/`)
- **Category**: dx / tech-debt
- **Planned at**: commit `cf8701f`, 2026-07-06

## Why this matters

**A — CI.** Chaque run exécute 5 × `npm ci` et l'équivalent de 3 passes de
compilation TypeScript, dont un job `build` en matrice Node 20 + 22 pour produire UN
artefact JS sans dépendance native (seul le build Node 20 est uploadé). Pour un
bundle frontend, la matrice n'achète à peu près rien : la supprimer raccourcit le
feedback PR et économise des minutes Actions.

**B — Nommage.** La carte s'appelle `dreame-vacuum-card` partout côté utilisateur,
mais le code interne porte encore les noms du fork upstream :
`XiaomiVacuumMapCardConfig`, classe `XiaomiVacuumMapCard`,
`XiaomiVacuumMapCardEditor` — ~51 occurrences dans `src/` (10 fichiers) + ~42 dans
`test/`/`test-browser/`. Coût cognitif permanent pour tout lecteur ; renommage
purement interne (les tags custom elements, invariant du repo, ne changent pas).

## Current state

- `.github/workflows/ci.yml:77-107` — job `build` : `needs: [lint, test]`,
  `strategy.matrix.node-version: [20, 22]`, upload de l'artefact seulement
  `if: matrix.node-version == 20` (l.102). Les jobs `lint`/`test`/`test-browser`
  tournent sur Node 24. `package.json:15-17` : `engines.node: ">=20"`.
- Noms hérités (`cf8701f`) :
  - `src/types/types.ts:38` — `export interface XiaomiVacuumMapCardConfig` ;
  - `src/dreame-vacuum-card.ts:204` — `export class XiaomiVacuumMapCard` (et
    `static _CLEANING_RENDER_MIN_MS` référencé via le nom de classe l.342-347) ;
  - `src/editor.ts:120` — `export class XiaomiVacuumMapCardEditor` ;
  - occurrences dans : `src/editor.ts`, `src/action-handler-directive.ts`,
    `src/config-validators.ts`, `src/types/types.ts`, `src/model/map_mode/map-mode.ts`,
    `src/localize/localize.ts`, `src/utils/actions.ts`, `src/utils/suggestion.ts`,
    `src/utils/watched-entities.ts`, `src/dreame-vacuum-card.ts` ;
  - `test/` + `test-browser/` : ~42 occurrences supplémentaires.
- **Invariants à NE PAS toucher** (`ARCHITECTURE.md:97-103`) : les tags
  `dreame-vacuum-card`, `dreame-vacuum-card-editor`,
  `action-handler-dreame-vacuum-card` (déjà corrects — définis via
  `@customElement`/constantes, pas via les noms de classe) et le schéma YAML.
- `scripts/add-version.mjs` : ne référence PAS les noms de classe (vérifié) — mais
  re-vérifier avant de conclure (`grep -rn "XiaomiVacuumMapCard" scripts/`).

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Typecheck / lint / format | `npm run typecheck && npm run lint && npm run format:check` | exit 0 |
| Tests | `npm test` puis `CHROMIUM_BIN=/usr/bin/chromium npm run test:browser` | verts |
| Build | `npm run rollup` | exit 0 |
| YAML valide | `python3 -c "import yaml; yaml.safe_load(open('.github/workflows/ci.yml'))"` | exit 0 |

## Scope

**In scope**:
- Partie A : `.github/workflows/ci.yml` (job `build` uniquement)
- Partie B : tous les fichiers `src/`, `test/`, `test-browser/` contenant
  `XiaomiVacuumMapCard` (renommage d'identifiants uniquement)

**Out of scope**:
- Les autres jobs de `ci.yml` et les autres workflows.
- Les tags custom elements et toute chaîne de caractères de config YAML utilisateur.
- `window.customCards` (registre HA) : la propriété `type` doit rester
  `dreame-vacuum-card` — vérifier qu'elle n'est pas dérivée du nom de classe.
- Renommer les FICHIERS : `dreame-vacuum-card.ts`/`editor.ts` gardent leurs noms.

## Git workflow

- Ne committe pas et ne pousse pas : l'utilisateur contrôle git. Les parties A et B
  sont indépendantes — les signaler séparément dans le rapport.

## Steps

### Step A1: Matrice build → Node unique

Dans le job `build` de `ci.yml` : supprimer le bloc `strategy.matrix`, fixer
`node-version: 24` (aligné sur lint/test), et retirer la condition
`if: matrix.node-version == 20` de l'upload d'artefact.

**Verify**: YAML valide (commande ci-dessus) ;
`grep -n "matrix" .github/workflows/ci.yml` → vide.

### Step B1: Renommage mécanique

Renommages (identifiants TypeScript uniquement, PAS les chaînes de tags) :

| Ancien | Nouveau |
|---|---|
| `XiaomiVacuumMapCardConfig` | `DreameVacuumCardConfig` |
| `XiaomiVacuumMapCard` (classe) | `DreameVacuumCard` |
| `XiaomiVacuumMapCardEditor` | `DreameVacuumCardEditor` |

Procédure sûre : remplacer d'abord le plus long (`XiaomiVacuumMapCardConfig`), puis
`XiaomiVacuumMapCardEditor`, puis le nom de classe nu, via :

```bash
grep -rl "XiaomiVacuumMapCardConfig" src/ test/ test-browser/ | xargs sed -i 's/XiaomiVacuumMapCardConfig/DreameVacuumCardConfig/g'
grep -rl "XiaomiVacuumMapCardEditor" src/ test/ test-browser/ | xargs sed -i 's/XiaomiVacuumMapCardEditor/DreameVacuumCardEditor/g'
grep -rl "XiaomiVacuumMapCard" src/ test/ test-browser/ | xargs sed -i 's/XiaomiVacuumMapCard/DreameVacuumCard/g'
```

**Verify**: `grep -rn "XiaomiVacuumMapCard\|Xiaomi" src/ test/ test-browser/ --include='*.ts'`
→ examiner chaque reste : seuls des commentaires/attributions historiques
(« fork de Xiaomi Vacuum Map Card ») peuvent subsister ; aucun identifiant de code.

### Step B2: Gate complet

**Verify**: `npm run typecheck && npm run lint && npm run format:check && npm test`
→ exit 0 ; `CHROMIUM_BIN=/usr/bin/chromium npm run test:browser` → verts ;
`npm run rollup` → exit 0.

### Step B3: Invariants intacts

**Verify**:
`grep -rn '"dreame-vacuum-card"\|dreame-vacuum-card-editor\|action-handler-dreame-vacuum-card' src/const.ts src/dreame-vacuum-card.ts src/editor.ts src/action-handler-directive.ts | head`
→ les tags custom elements sont toujours définis, inchangés ; et dans le bundle :
`npm run rollup && grep -c "customElements" dist/dreame-vacuum-card.js` ≥ 1,
`grep -c "dreame-vacuum-card" dist/dreame-vacuum-card.js` ≥ 1.

## Test plan

Pas de nouveau test : renommage interne + CI. Le filet est le gate complet (B2) et
la vérification des invariants (B3). L'attribution du fork dans `README.md` (« fork
of Xiaomi Vacuum Map Card ») ne doit PAS être modifiée — c'est de la reconnaissance,
pas du code.

## Done criteria

- [ ] `ci.yml` : job `build` sans matrice, artefact uploadé sans condition
- [ ] `grep -rn "XiaomiVacuumMapCard" src/ test/ test-browser/ --include='*.ts'` →
      0 identifiant de code restant
- [ ] Gate complet vert + `npm run rollup` exit 0
- [ ] Tags custom elements inchangés (Step B3)
- [ ] Aucun fichier hors scope modifié (`git status`)
- [ ] Ligne de statut mise à jour dans `plans/README.md`

## STOP conditions

- Un `sed` toucherait une chaîne LITTÉRALE utilisateur (le grep de B1 montre une
  occurrence dans une string de config, une clé i18n ou un tag) → exclure ce site du
  renommage et rapporter.
- `window.customCards` ou `getConfigElement` s'avèrent dériver un nom du nom de
  classe (le typecheck ne le verrait pas si c'est une chaîne) → rapporter avant de
  renommer la classe.
- Des plans précédents sont encore en cours (fichiers `src/` avec modifications non
  committées d'un autre chantier dans `git status`) → ne PAS lancer la partie B ;
  rapporter.

## Maintenance notes

- Après ce plan, la convention est : tout nouvel identifiant utilise `Dreame*` ;
  `Xiaomi` ne doit réapparaître que dans l'attribution du fork (README/LICENSE).
- Si la matrice multi-Node manque un jour (bug spécifique à une version Node dans le
  toolchain Rollup), la réintroduire consciemment — sa suppression ici est un choix
  coût/bénéfice, pas un dogme.
