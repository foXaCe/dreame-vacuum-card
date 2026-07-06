# Plan 005: Épingler toutes les GitHub Actions par SHA et automatiser via Renovate

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat cf8701f..HEAD -- .github/workflows/ renovate.json`
> On a mismatch with the "Current state" list, STOP.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: security
- **Planned at**: commit `cf8701f`, 2026-07-06

## Why this matters

Aucune action des 6 workflows n'est épinglée par SHA : toutes référencent des tags
mutables, et `hacs/action@main` suit carrément une branche. Un tag Git peut être
déplacé (mainteneur upstream compromis ou malveillant) sans que rien ne change dans
nos fichiers : la CI exécuterait silencieusement du code différent. Le risque le plus
concret est `release.yml` : il tourne avec `permissions: contents: write` et publie
`dist/dreame-vacuum-card.js`, l'artefact que les utilisateurs HACS installent — une
action tierce compromise à ce niveau peut altérer l'artefact distribué. Le pinning
par digest + le preset Renovate rendent l'épingle pérenne (Renovate proposera les
mises à jour de digest, déjà auto-mergées par la règle existante).

## Current state

Occurrences `uses:` à `cf8701f` (vérifiées) :

| Fichier | Ligne | Action |
|---|---|---|
| `.github/workflows/ci.yml` | 22, 42, 62, 86 | `actions/checkout@v7` |
| `.github/workflows/ci.yml` | 24, 44, 64, 88 | `actions/setup-node@v6` |
| `.github/workflows/ci.yml` | 103 | `actions/upload-artifact@v7` |
| `.github/workflows/codeql.yml` | 28 | `actions/checkout@v7` |
| `.github/workflows/codeql.yml` | 31, 43 | `github/codeql-action/init@v4`, `github/codeql-action/analyze@v4` |
| `.github/workflows/hacs.yml` | 20 | `actions/checkout@v7` |
| `.github/workflows/hacs.yml` | 23 | **`hacs/action@main`** (branche flottante) |
| `.github/workflows/release.yml` | 21, 23 | `actions/checkout@v7`, `actions/setup-node@v6` |
| `.github/workflows/release.yml` | 46 | `softprops/action-gh-release@v3` (tierce, job `contents: write`) |
| `.github/workflows/security-audit.yml` | 25, 27, 42, 54, 75 | checkout/setup-node/checkout/checkout |
| `.github/workflows/security-audit.yml` | 45 | `gitleaks/gitleaks-action@v3` (tierce) |
| `.github/workflows/security-audit.yml` | 76 | `actions/dependency-review-action@v5.0.0` |
| `.github/workflows/stale.yml` | 17 | `actions/stale@v10` |

`renovate.json` : le bloc `extends` (l.3-11) ne contient pas
`helpers:pinGitHubActionDigests`. Des règles d'automerge pour
`matchUpdateTypes: ["pin", "digest"]` existent déjà (l.59-71) — le preset s'y greffe
sans autre changement.

## Commands you will need

| Purpose   | Command | Expected on success |
|-----------|---------|---------------------|
| Résoudre le SHA d'un tag | `git ls-remote https://github.com/<owner>/<repo> refs/tags/<tag>` | une ligne `<sha40>\trefs/tags/<tag>` (si tag annoté, prendre la ligne `^{}`) |
| Résoudre le SHA d'une branche | `git ls-remote https://github.com/hacs/action refs/heads/main` | `<sha40>\trefs/heads/main` |
| Dernière release d'un repo | `gh api repos/<owner>/<repo>/releases/latest --jq .tag_name` | un tag |
| Vérifier le YAML | `npx --yes yaml-lint .github/workflows/*.yml` (ou `python3 -c "import yaml,glob; [yaml.safe_load(open(f)) for f in glob.glob('.github/workflows/*.yml')]"`) | exit 0 |

## Scope

**In scope**:
- `.github/workflows/ci.yml`, `codeql.yml`, `hacs.yml`, `release.yml`,
  `security-audit.yml`, `stale.yml`
- `renovate.json`

**Out of scope**:
- Toute autre modification des workflows (jobs, permissions, matrice — le plan 015
  s'occupe de la matrice de build). Ce plan ne change QUE les références `uses:`.
- Le contenu des steps `run:`.

## Git workflow

- Ne committe pas et ne pousse pas : l'utilisateur contrôle git.

## Steps

### Step 1: Ajouter le preset Renovate

Dans `renovate.json`, ajouter `"helpers:pinGitHubActionDigests"` à la liste `extends`
(après `"config:recommended"`).

**Verify**: `python3 -c "import json; json.load(open('renovate.json'))"` → exit 0

### Step 2: Résoudre et épingler chaque action

Pour chaque action du tableau « Current state » :

1. Déterminer la version à épingler : pour les tags existants (`v7`, `v6`, `v3`,
   `v4`, `v10`, `v5.0.0`), résoudre le SHA du tag actuel via `git ls-remote` (prendre
   le SHA de la ligne `^{}` si présente — c'est le commit pointé par un tag annoté).
   Pour `hacs/action@main` : résoudre la **dernière release** (`gh api
   repos/hacs/action/releases/latest --jq .tag_name`) puis le SHA de ce tag — ne pas
   épingler le SHA de `main`.
2. Remplacer dans le workflow : `uses: owner/repo@<sha40> # <tag>` (garder le tag en
   commentaire — Renovate s'en sert pour proposer les mises à jour).

Exemple attendu :

```yaml
- uses: actions/checkout@08c6903cd8c0fde910a37f88322edcfb5dd907a8 # v7
```

**Verify**:
`grep -RnE 'uses: [^ ]+@[0-9a-f]{40} #' .github/workflows/ | wc -l` → 25 (toutes les
occurrences du tableau — le plan initial disait « 23 », coquille arithmétique corrigée
lors de la revue du 2026-07-06 : 9+3+2+3+7+1 = 25) et
`grep -RnE 'uses: [^ ]+@(v[0-9][^ ]*|main)\s*$' .github/workflows/` → aucune sortie.

### Step 3: Validation syntaxique

**Verify**: la commande YAML de la table « Commands » → exit 0 sur les 6 fichiers.

## Test plan

Pas de tests applicatifs (fichiers CI uniquement). Vérifications :
- Les 2 greps du Step 2.
- Contre-vérifier 3 SHA au hasard : `git ls-remote https://github.com/<owner>/<repo>
  refs/tags/<tag>` redonne bien le SHA écrit dans le fichier.
- La CI réelle validera au prochain push de l'utilisateur (hors scope de l'exécuteur).

## Done criteria

- [ ] `renovate.json` contient `helpers:pinGitHubActionDigests` et reste un JSON valide
- [ ] Plus aucune référence `@vX`/`@main` nue :
      `grep -RnE 'uses: [^ ]+@(v[0-9][^ ]*|main)\s*$' .github/workflows/` → vide
- [ ] Chaque `uses:` porte un SHA 40 hex + commentaire de version
- [ ] `hacs/action` est épinglé sur le SHA d'une **release**, pas de `main`
- [ ] Aucun fichier hors scope modifié (`git status`)
- [ ] Ligne de statut mise à jour dans `plans/README.md`

## STOP conditions

- Pas d'accès réseau pour `git ls-remote`/`gh api` → impossible de résoudre les SHA ;
  rapporter au lieu d'inventer des SHA.
- Un tag du tableau n'existe plus upstream (ex. `v5.0.0` de dependency-review-action
  supprimé) → rapporter la version la plus proche trouvée, ne pas deviner.
- Le nombre d'occurrences `uses:` ne correspond pas au tableau (drift des workflows).

## Maintenance notes

- Renovate ouvrira désormais des PR « digest update » auto-mergées (règle existante
  l.59-71 de renovate.json) — c'est le mécanisme de mise à jour voulu ; ne jamais
  revenir à des tags nus dans une future édition de workflow.
- Reviewer : sur toute nouvelle action ajoutée à un workflow, exiger le format
  `@<sha> # <version>`.
