# Plan 009: Créer le CLAUDE.md racine — point d'entrée agent avec invariants et commandes

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat cf8701f..HEAD -- ARCHITECTURE.md docs/INTEGRATION-CONTRACT.md package.json`
> Si ces sources ont changé, vérifier que les faits repris ci-dessous tiennent toujours.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: dx
- **Planned at**: commit `cf8701f`, 2026-07-06

## Why this matters

Le dépôt s'adresse explicitement aux agents (`docs/INTEGRATION-CONTRACT.md:5` : « À
lire intégralement par tout agent (Claude Code ou humain)… ») et possède déjà une
documentation dense (`ARCHITECTURE.md`, 7,8 Ko ; `docs/INTEGRATION-CONTRACT.md`,
13 Ko) avec des invariants de stabilité écrits noir sur blanc — mais **aucun
`CLAUDE.md`/`AGENTS.md` à la racine** ne les indexe. Chaque session d'agent
redécouvre les règles ou risque de les casser (renommer un tag custom element, une
clé YAML, une clé i18n). Un CLAUDE.md court qui **pointe** vers l'existant (sans le
dupliquer) supprime ce risque à coût quasi nul.

## Current state

- Racine du repo : pas de `CLAUDE.md` ni `AGENTS.md` (`ls` à `cf8701f`).
- `ARCHITECTURE.md:97-103` — invariants de stabilité (tags custom elements
  `dreame-vacuum-card` / `dreame-vacuum-card-editor` /
  `action-handler-dreame-vacuum-card` ; schéma YAML : ne jamais renommer/supprimer
  une clé existante ; clés `localize` : ne pas renommer).
- `package.json:52-65` — scripts réels : `start`, `build`, `lint`, `lint:fix`,
  `typecheck`, `test`, `test:watch`, `test:coverage`, `test:browser`, `format`,
  `format:check`, `rollup`, `add-version`.
- Suite navigateur locale : `CHROMIUM_BIN=/usr/bin/chromium npm run test:browser`
  (documenté dans `ARCHITECTURE.md:131-134`).
- Conventions observables dans `git log` : messages de commit en français, préfixes
  type conventional commits (`fix(map):`, `feat(chip):`, `test(browser):`, `docs:`,
  `chore:`), pas de trailer de co-auteur.
- `dist/` est committé volontairement (installation par raw URL — note dans
  `.gitignore`).

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Vérifier les scripts cités | `npm run` | liste contenant chaque script mentionné |
| Non-régression | `npm test` | verts (aucun code touché, sanity check) |

## Scope

**In scope**:
- `CLAUDE.md` (création, racine du repo)

**Out of scope**:
- `ARCHITECTURE.md`, `docs/INTEGRATION-CONTRACT.md` — sources de vérité, ne pas les
  modifier ni les dupliquer dans CLAUDE.md.
- `.claude/` (répertoire local ignoré par git).

## Git workflow

- Ne committe pas et ne pousse pas : l'utilisateur contrôle git.

## Steps

### Step 1: Rédiger `CLAUDE.md`

Créer `CLAUDE.md` à la racine, en français, ≤80 lignes, avec exactement ces sections
(reprendre les faits de « Current state », en les revérifiant dans les fichiers
sources — ne rien inventer) :

1. **Quoi** : 2 lignes — carte Lovelace HA (TypeScript strict + Lit 3) pour
   l'intégration foXaCe/dreame-vacuum, distribuée via HACS, fork spécialisé de
   Xiaomi Vacuum Map Card.
2. **À lire d'abord** : liens vers `ARCHITECTURE.md` (structure, flux de données,
   points d'extension) et `docs/INTEGRATION-CONTRACT.md` (**obligatoire avant tout
   travail sur le rendu de carte / segment_map / calibration / overlay robot**).
3. **Commandes de vérification** : tableau `npm run lint` / `typecheck` / `test` /
   `format:check` / `rollup`, plus `CHROMIUM_BIN=/usr/bin/chromium npm run
   test:browser` pour la suite navigateur locale. Mentionner que `npm run build`
   enchaîne tout.
4. **Invariants — ne jamais casser** : recopier les 3 invariants d'ARCHITECTURE.md
   (tags custom elements, clés de config YAML, clés i18n) en une ligne chacun, avec
   pointeur `ARCHITECTURE.md` pour le détail.
5. **Conventions** : commits en français, préfixes `fix(...)`/`feat(...)`/`docs:`/
   `test:`/`chore:` ; pas de trailer de co-auteur ; Prettier obligatoire sur `src/`
   (la CI exécute `format:check`) ; commentaires de code en français ; `dist/` est
   committé volontairement — ne pas l'ajouter au .gitignore ni le supprimer.
6. **Pièges connus** : la carte reçoit un objet `hass` complet à chaque state-changed
   (filtrage via `shouldUpdate`/`watched-entities`) ; les tests navigateur sont le
   filet de la glu DOM/canvas — les lancer avant de conclure sur tout changement de
   `src/dreame-vacuum-card.ts`.

**Verify**: `test -f CLAUDE.md && wc -l CLAUDE.md` → fichier présent, ≤80 lignes.

### Step 2: Exactitude des faits

Revérifier chaque commande citée dans le CLAUDE.md contre `npm run` (elles doivent
toutes exister), et chaque invariant contre `ARCHITECTURE.md:97-103`.

**Verify**: pour chaque script cité `S` : `npm run | grep -c "  S$"` ≥ 1 (ou
inspection de la sortie `npm run`).

## Test plan

Pas de code — la « vérification » est l'exactitude factuelle (Step 2) et
`npm test` en sanity check final.

## Done criteria

- [ ] `CLAUDE.md` existe à la racine, ≤80 lignes, sections 1-6 présentes
- [ ] Toutes les commandes citées existent dans `package.json`
- [ ] Les 3 invariants d'`ARCHITECTURE.md:97-103` y figurent
- [ ] Aucun autre fichier modifié (`git status`)
- [ ] Ligne de statut mise à jour dans `plans/README.md`

## STOP conditions

- Un `CLAUDE.md` ou `AGENTS.md` existe déjà à la racine (créé entre-temps) →
  fusionner serait un choix produit ; rapporter son contenu au lieu d'écraser.
- Les invariants d'`ARCHITECTURE.md` ont changé de section/numérotation — reprendre
  les invariants réels, pas ceux cités ici.

## Maintenance notes

- CLAUDE.md est un index, pas une doc : toute nouvelle règle durable va dans
  `ARCHITECTURE.md` ou le contrat, et CLAUDE.md n'ajoute qu'un pointeur.
- Reviewer : vérifier qu'aucun contenu n'est dupliqué depuis ARCHITECTURE.md (risque
  de divergence).
