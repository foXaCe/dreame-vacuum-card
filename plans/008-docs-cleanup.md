# Plan 008: Corriger les docs fausses et purger la documentation héritée de l'upstream

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat cf8701f..HEAD -- README.md CONTRIBUTING.md docs/`
> On a mismatch with the "Current state" facts, STOP.

## Status

- **Priority**: P2
- **Effort**: S-M
- **Risk**: LOW
- **Depends on**: none
- **Category**: docs
- **Planned at**: commit `cf8701f`, 2026-07-06

## Why this matters

Cette carte est un fork de *Xiaomi Vacuum Map Card* spécialisé 100 % Dreame, mais sa
documentation contient encore des restes de l'upstream multi-vendeur qui sont
**activement faux** — pires qu'une absence de doc :

- `README.md` documente `npm run dev`, script inexistant (le vrai est `npm start`) —
  première commande qu'un contributeur tape, échec immédiat.
- `CONTRIBUTING.md` renvoie vers un fichier inexistant
  (`platform_templates/new.json`) et deux ancres README mortes.
- `docs/basic_config.yaml` et `docs/demo_config.yaml` montrent des entités
  Roborock/Xiaomi (`vacuum.roborock_vacuum_s5`, `camera.xiaomi_cloud_map_extractor`),
  des services inexistants (`vacuum.do_zones`…) et un bloc `additional_presets:` qui
  n'existe dans **aucun** type ni validateur du code (`grep additional_presets src/`
  → 0) — un utilisateur qui copie voit tout ignoré silencieusement.
- `docs/templates/` contient 15+ fiches vendeurs (Roborock, Neato, Valetudo, Miio…)
  et un `setup.md` décrivant un workflow d'éditeur (« Setup platform », bouton Copy)
  qui n'existe plus dans `src/editor.ts`.

## Current state

- `README.md:178` : ` npm run dev` (section Development). Les scripts réels sont dans
  `package.json:52-65` — `start`, `build`, `lint`, `typecheck`, `test`,
  `test:browser`, `format`, etc. `ARCHITECTURE.md:18` documente déjà correctement
  `npm run start`.
- `CONTRIBUTING.md` :
  - l.14 : lien `/README.md#translations` (ancre inexistante dans le README actuel) ;
  - l.17-27 (« Adding new platform ») : référence
    `src/model/generators/platform_templates/new.json` — le répertoire ne contient
    que `Tasshack_dreame-vacuum.json` ; l.26 : lien
    `/README.md#supported-vacuum-platforms` (ancre inexistante).
- `docs/basic_config.yaml` (l.2-6) : `entity: vacuum.roborock_vacuum_s5`,
  `camera: camera.xiaomi_cloud_map_extractor`. La config minimale correcte est celle
  du `README.md:98-106` (entité Dreame + `vacuum_platform: tasshackDreameVacuum`).
- `docs/demo_config.yaml` : `vacuum.xiaomi_vacuum` (l.4), bloc `additional_presets:`
  (l.92+) avec `service: vacuum.do_zones` (l.125, 139, 319…).
- `docs/follow_path.yaml` : script HA `vacuum_follow_path` hérité de l'upstream
  (fonction « follow path » non exposée par cette carte).
- `docs/templates/` : `Roborock.md`, `neato.md`, `hypferValetudo.md`,
  `rand256ValetudoRe.md`, `xiaomiMiio.md`, `alOneHassXiaomiMiot.md`,
  `krzysztofHajdamowiczMiio2.md`, `marotowebViomise.md`, `tykarolViomiVacuumV8.md`,
  `romedtinoSimpleWyze.md`, `roomba.md`, `DeebotUniverseDeebot4homeAssistant.md`,
  `humbertogontijoHomeassistantRoborock.md` (vérifier la liste exacte par `ls`),
  `setup.md`, et la fiche Dreame `tasshackDreameVacuum.md` (à conserver).
- `hacs.json` a `"render_readme": true` → le README doit rester du Markdown valide.
- Convention du repo : commits `docs:` en français (cf. `git log`).

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Lister les templates | `ls docs/templates/` | liste exacte avant suppression |
| Chercher les références | `grep -rn "docs/templates\|follow_path\|demo_config\|basic_config" README.md docs/ src/ test/ .github/ --include='*' \| grep -v Binary` | inventaire des liens entrants |
| Vérifier `additional_presets` | `grep -rn "additional_presets" src/` | vide (confirme la suppression sûre) |
| Markdown valide | `python3 -c "print(open('README.md').read()[:1])"` + relecture | pas de vérif outillée dispo ; relire le rendu |

## Scope

**In scope**:
- `README.md` (section Development uniquement)
- `CONTRIBUTING.md`
- `docs/basic_config.yaml`, `docs/demo_config.yaml`, `docs/follow_path.yaml`
- `docs/templates/*` (suppressions)

**Out of scope**:
- `src/**` — aucune modification de code (la branche morte `startsWith("Setup")` est
  traitée par le plan 010).
- `docs/INTEGRATION-CONTRACT.md`, `ARCHITECTURE.md`, `docs/css_variables.md` — à jour.
- `docs/templates/tasshackDreameVacuum.md` — c'est la fiche du vendeur cible, la
  GARDER (la relire et corriger seulement si elle référence le workflow « Setup »).

## Git workflow

- Ne committe pas et ne pousse pas : l'utilisateur contrôle git.

## Steps

### Step 1: README — commande de dev

`README.md:178` : remplacer `npm run dev` par `npm start` (et vérifier que le
commentaire « Development build with watch » reste exact — `npm start` lance
`rollup -c rollup.config.dev.js --watch`).

**Verify**: `grep -n "npm run dev" README.md` → vide ; `grep -n "npm start" README.md` → 1 occurrence.

### Step 2: CONTRIBUTING — refléter le fork mono-vendeur

1. Section « Adding new translations » : supprimer l'étape « Add a new entry in
   [translations list](/README.md#translations) » (ancre morte) ; le reste des étapes
   est correct (créer le JSON, l'enregistrer dans `src/localize/localize.ts`).
2. Supprimer entièrement la section « Adding new platform » (l.17-27) et la remplacer
   par une note courte : ce fork cible exclusivement l'intégration
   [foXaCe/dreame-vacuum] ; l'ajout de plateformes n'est plus supporté.
3. Garder la section « Building with npm » (vérifier que ses commandes existent dans
   `package.json` ; corriger le cas échéant).

**Verify**: `grep -n "new.json\|supported-vacuum-platforms\|README.md#translations" CONTRIBUTING.md` → vide.

### Step 3: Exemples YAML

1. `docs/basic_config.yaml` : réécrire pour correspondre exactement à la config
   minimale du `README.md:98-106` (entité `vacuum.your_dreame_vacuum`, caméra
   `camera.your_dreame_vacuum_map`, `vacuum_platform: tasshackDreameVacuum`).
2. `docs/demo_config.yaml` : supprimer le fichier (il démontre `additional_presets`
   et des services `vacuum.do_*` inexistants ; aucune valeur pour un fork Dreame).
3. `docs/follow_path.yaml` : supprimer (fonctionnalité upstream non exposée).
4. Si l'inventaire des liens entrants (commande ci-dessus) montre des références aux
   fichiers supprimés, les retirer aussi.

**Verify**: `ls docs/*.yaml` → seulement `basic_config.yaml` ;
`grep -rn "demo_config\|follow_path" README.md docs/ src/` → vide.

### Step 4: Purge de `docs/templates/`

Supprimer toutes les fiches vendeurs SAUF `tasshackDreameVacuum.md`. Supprimer
`setup.md`. Si des fichiers média (`docs/templates/media/` ou similaires) ne sont
référencés que par les fiches supprimées, les supprimer aussi (vérifier par grep
avant chaque suppression de média).

**Verify**: `ls docs/templates/` → `tasshackDreameVacuum.md` uniquement (± ses médias
encore référencés) ; `grep -rn "roborock\|neato\|valetudo" docs/templates/ -il` → au
plus la fiche Dreame si elle mentionne l'historique.

### Step 5: Relecture des liens

**Verify**: `grep -rnoE '\]\((/[^)]+|docs/[^)]+)\)' README.md CONTRIBUTING.md | while IFS=: read -r f l link; do p=$(echo "$link" | sed 's/^](//;s/)$//;s/#.*//;s#^/##'); [ -z "$p" ] || [ -e "$p" ] || echo "LIEN MORT: $f:$l -> $p"; done` → aucune ligne « LIEN MORT ».

## Test plan

Documentation uniquement — pas de tests de code. Les vérifications des steps tiennent
lieu de test. Lancer quand même `npm test` une fois à la fin pour confirmer qu'aucun
test ne référence les fichiers supprimés (ex. fixtures pointant vers docs/).

## Done criteria

- [ ] `grep -n "npm run dev" README.md` → vide
- [ ] `grep -rn "new.json\|do_zones\|additional_presets\|xiaomi_cloud_map_extractor" README.md CONTRIBUTING.md docs/` → vide
- [ ] `ls docs/templates/` → fiche Dreame uniquement
- [ ] Vérification des liens (Step 5) → aucun lien mort
- [ ] `npm test` exit 0 (non-régression)
- [ ] Aucun fichier hors scope modifié (`git status`)
- [ ] Ligne de statut mise à jour dans `plans/README.md`

## STOP conditions

- `docs/templates/tasshackDreameVacuum.md` n'existe pas sous ce nom (chercher la
  fiche Dreame réelle par `ls` et rapporter le nom trouvé avant de supprimer quoi que
  ce soit).
- Un fichier à supprimer est référencé depuis `src/` ou `test/` (le grep d'inventaire
  le montrera) — rapporter au lieu de casser un import.
- Le README utilise les ancres supprimées ailleurs (recherche `#translations` etc.).

## Maintenance notes

- `hacs.json` fait le rendu du README dans HACS : toute future édition du README doit
  rester du Markdown propre (pas de HTML exotique).
- Si un jour le multi-plateforme revient (improbable), restaurer les fiches depuis
  l'historique git plutôt que de les réécrire.
