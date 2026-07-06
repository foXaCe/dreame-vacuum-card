# Plan 010: Supprimer le code mort hérité — branche « Setup », clés i18n, asset Lottie orphelin

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat cf8701f..HEAD -- src/dreame-vacuum-card.ts src/localize/ src/assets/ test/localize.test.ts ARCHITECTURE.md`
> On a mismatch with the "Current state" excerpts, STOP.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: tech-debt
- **Planned at**: commit `cf8701f`, 2026-07-06

## Why this matters

Trois vestiges de l'upstream multi-vendeur subsistent dans le code d'un fork 100 %
Dreame :

1. Une **branche inaccessible** : `_getModes()` teste `vacuumPlatform.startsWith("Setup")`
   alors qu'aucune plateforme « Setup* » n'est enregistrée (le `PlatformGenerator` n'a
   qu'un template, `Dreame`) — du code que tout lecteur doit comprendre pour rien.
2. Trois **clés i18n mortes** (`map_mode.setup_zone`, `setup_point`, `setup_outline`)
   présentes dans `en.json` et `fr.json`, jamais lues par le code, et verrouillées
   par un test de parité qui teste… leur non-usage.
3. Un **asset Lottie orphelin** : `src/assets/lottie/anim_home_standby.json` (~60 Ko
   source) n'est importé nulle part.

Chaque suppression est mécanique et vérifiable ; l'ensemble réduit la surface de
confusion pour les contributions futures.

## Current state

- `src/dreame-vacuum-card.ts:816-823` (`_getModes`) :

  ```ts
  private _getModes(config: CardPresetConfig) {
      const vacuumPlatform = PlatformGenerator.getPlatformName(config.vacuum_platform);
      return (
          (config.map_modes?.length ?? -1) === -1 || vacuumPlatform.startsWith("Setup")
              ? PlatformGenerator.generateDefaultModes(vacuumPlatform)
              : (config.map_modes ?? [EMPTY_MAP_MODE])
      ).map((m) => new MapMode(vacuumPlatform, m, this.config.language));
  }
  ```

  `PlatformGenerator.getPlatforms()` (`src/model/generators/platform-generator.ts:15-17`)
  ne retourne que `["Dreame"]` : la sous-condition `startsWith("Setup")` est
  inatteignable pour toute config valide.

- Clés mortes : `src/localize/languages/en.json:19-21`
  (`"setup_zone": "Zone coordinates"`, `"setup_point": ...`, `"setup_outline": ...`)
  et leurs équivalents dans `fr.json` **uniquement** (vérifié :
  `grep -l 'setup_zone' src/localize/languages/*.json` → en.json, fr.json ; les 26
  autres langues ne les ont pas). Aucun usage :
  `grep -rn "setup_zone\|setup_point\|setup_outline" src/ --include='*.ts'` → 0.

- Test à adapter : `test/localize.test.ts:57-60` — le test de fallback utilise
  précisément une de ces clés :

  ```ts
  it("falls back to English when the key is missing in the requested language", () => {
      // map_mode.setup_zone exists in en ("Zone coordinates") but is absent from bg.
      expect(localize("map_mode.setup_zone", "bg")).toBe("Zone coordinates");
  });
  ```

- Asset orphelin : `grep -rn "anim_home_standby" src/` → 0 (seuls
  `anim_drying.json`, `anim_washing.json`, `anim_dust_collect.json` sont importés
  par `src/components/robot-animation.ts:5-7`).

- Note d'architecture : `ARCHITECTURE.md` ne dit pas pourquoi `PlatformGenerator`
  reste une `Map` avec un seul template.

- Invariant du repo (`ARCHITECTURE.md:103`) : ne pas renommer les clés `localize`
  **existantes utilisées** — supprimer une clé morte n'enfreint pas l'invariant.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Typecheck / lint / format | `npm run typecheck && npm run lint && npm run format:check` | exit 0 |
| Tests unitaires | `npm test` | tous verts |
| Tests navigateur | `CHROMIUM_BIN=/usr/bin/chromium npm run test:browser` | tous verts |
| Build | `npm run rollup` | `dist/dreame-vacuum-card.js` régénéré, exit 0 |

## Scope

**In scope**:
- `src/dreame-vacuum-card.ts` (uniquement `_getModes`)
- `src/localize/languages/en.json`, `src/localize/languages/fr.json`
- `test/localize.test.ts` (adaptation du test de fallback)
- `src/assets/lottie/anim_home_standby.json` (suppression)
- `ARCHITECTURE.md` (1-2 lignes de note)

**Out of scope**:
- `src/model/generators/platform-generator.ts` — son API `Map` reste en place par
  choix (extensibilité) ; on la documente, on ne l'aplatit pas.
- Les 26 autres fichiers de langue (ils n'ont pas les clés).
- Les 3 autres assets Lottie (utilisés).
- `dist/` — ne pas committer un rebuild ; `npm run rollup` sert de vérification
  locale seulement (laisser `dist/` tel quel dans l'arbre si le contenu diffère
  uniquement par ce nettoyage — l'utilisateur régénérera au prochain release).

## Git workflow

- Ne committe pas et ne pousse pas : l'utilisateur contrôle git.

## Steps

### Step 1: Retirer la branche morte

Dans `_getModes`, réduire la condition :

```ts
return ((config.map_modes?.length ?? -1) === -1
    ? PlatformGenerator.generateDefaultModes(vacuumPlatform)
    : (config.map_modes ?? [EMPTY_MAP_MODE])
).map((m) => new MapMode(vacuumPlatform, m, this.config.language));
```

**Verify**: `grep -n 'startsWith("Setup")' src/ -r` → vide ; `npm run typecheck` → exit 0.

### Step 2: Adapter le test de fallback AVANT de supprimer les clés

Le test `test/localize.test.ts:57-60` a besoin d'une clé présente en `en` et absente
de `bg`. En choisir une **réelle et utilisée** : lister les candidates par

```bash
node -e "
const en=require('./src/localize/languages/en.json');
const bg=require('./src/localize/languages/bg.json');
const flat=(o,p='')=>Object.entries(o).flatMap(([k,v])=>typeof v==='object'?flat(v,p+k+'.'):[p+k]);
const bgSet=new Set(flat(bg));
console.log(flat(en).filter(k=>!bgSet.has(k) && !k.startsWith('map_mode.setup')).slice(0,10));
"
```

Prendre la première candidate, remplacer `map_mode.setup_zone` et la valeur attendue
dans le test (mettre à jour le commentaire).

**Verify**: `npm test -- localize` → vert.

### Step 3: Supprimer les clés mortes

Retirer `setup_zone`, `setup_point`, `setup_outline` du bloc `map_mode` de
`en.json` et `fr.json` (attention aux virgules JSON).

**Verify**: `grep -rn "setup_zone\|setup_point\|setup_outline" src/ test/` → vide ;
`npm test` → tous verts.

### Step 4: Supprimer l'asset orphelin

Supprimer `src/assets/lottie/anim_home_standby.json`.

**Verify**: `grep -rn "anim_home_standby" src/ test/ test-browser/` → vide ;
`npm run rollup` → exit 0.

### Step 5: Note d'architecture

Dans `ARCHITECTURE.md`, section décrivant `model/generators/platform-generator`
(l.80-81), ajouter une phrase : l'API `Map` multi-templates est conservée par choix
d'extensibilité bien qu'un seul template (Dreame) soit enregistré.

**Verify**: `grep -n "extensibilité\|un seul template" ARCHITECTURE.md` → 1 occurrence.

### Step 6: Vérification globale

**Verify**: `npm run typecheck && npm run lint && npm run format:check && npm test`
→ exit 0 ; `CHROMIUM_BIN=/usr/bin/chromium npm run test:browser` → verts.

## Test plan

Pas de nouveau test : ce plan supprime du mort. Le filet est la non-régression
complète (Step 6) + l'adaptation du test de fallback (Step 2), qui doit rester un
test **significatif** (clé réelle, pas une clé fabriquée).

## Done criteria

- [ ] `grep -rn 'startsWith("Setup")\|setup_zone\|setup_point\|setup_outline\|anim_home_standby' src/ test/ test-browser/` → vide
- [ ] `npm run typecheck && npm run lint && npm run format:check` → exit 0
- [ ] `npm test` et `CHROMIUM_BIN=/usr/bin/chromium npm run test:browser` → verts
- [ ] `npm run rollup` → exit 0
- [ ] `ARCHITECTURE.md` documente le choix single-template
- [ ] Aucun fichier hors scope modifié (`git status` — `dist/` peut apparaître
      modifié si tu as buildé : le restaurer via `git checkout -- dist/`)
- [ ] Ligne de statut mise à jour dans `plans/README.md`

## STOP conditions

- Le script du Step 2 ne trouve AUCUNE clé en-only absente de bg → le test de
  fallback n'a plus de support naturel ; rapporter (l'alternative — mocker une
  langue — est un choix de design à valider).
- `startsWith("Setup")` apparaît ailleurs que dans `_getModes` (drift) → inventorier
  et rapporter.
- Une clé `setup_*` s'avère lue dynamiquement (recherche `map_mode.` + concaténation
  dans `src/` avant suppression — si un code construit la clé à la volée, STOP).

## Maintenance notes

- Si l'éditeur regagne un jour un mode « sélecteur de coordonnées » (cf. constat
  DIRECTION-02 de l'audit du 2026-07-06), il réintroduira ses propres clés i18n —
  ne pas ressusciter celles-ci.
- Reviewer : vérifier la validité JSON des deux fichiers de langue (une virgule
  orpheline casse le build Rollup).
