# Implementation Plans

Générés par le skill `improve` le 2026-07-06, contre le commit `cf8701f` (audit
complet : correctness, sécurité, perf, tests, dette, deps, DX, docs, direction —
4 agents + vetting manuel de chaque citation). Exécuter dans l'ordre ci-dessous sauf
indication contraire des dépendances. Chaque exécuteur : lire le plan en entier
avant de commencer, respecter ses STOP conditions, et mettre à jour sa ligne ici une
fois terminé.

Règle transverse (tous les plans) : **ne pas committer, ne pas pousser** —
l'utilisateur contrôle git.

## Execution order & status

| Plan | Title | Priority | Effort | Depends on | Status |
|------|-------|----------|--------|------------|--------|
| 001 | Retour d'échec des appels de service + fixture rejetable | P1 | S | — | DONE (approuvé 2026-07-06, branche `worktree-agent-a080f7396f0960fd1`, intégré dans la PR #37) |
| 002 | Gardes de cycle de vie (`connected`, `hass`) | P1 | S | — | DONE (approuvé 2026-07-06, branche `worktree-agent-a9c56719b22fb4910`, intégré dans la PR #37) |
| 003 | Déroulement de l'angle du cap robot (±180°) | P1 | S | — | DONE (approuvé 2026-07-06, branche `worktree-agent-a7e0ca3fc49ba876b`, intégré dans la PR #37 ; note : le plan indiquait à tort `unwrapAngleDeg(0,180)=180`, la formule canonicalise vers -180, test aligné sur le réel) |
| 004 | `shouldUpdate` des 4 composants feuilles | P1 | S | — | DONE (approuvé 2026-07-06, branche `worktree-agent-accaa88a07510e8a8`, intégré dans la PR #37 ; scope du plan amendé : tests du helper dans `test/utils-conditions.test.ts`, foyer canonique omis du plan initial) |
| 005 | Épinglage SHA des GitHub Actions + preset Renovate | P1 | S | — | DONE (approuvé 2026-07-06, branche `worktree-agent-adb19357dc695f431`, intégré dans la PR #37 ; 25 refs épinglées, SHA contre-vérifiés upstream par le reviewer) |
| 006 | Dé-flaker le test de glisse robot-overlay | P1 | S | — | DONE (approuvé 2026-07-06, branche `worktree-agent-a14c1e735f02d9a68`, intégré dans la PR #37 ; 8 exécutions consécutives vertes cumulées) |
| 007 | Durcissements mineurs (allowlist URL, condition vide) | P2 | S | — | DONE (approuvé 2026-07-06, branche `worktree-agent-a9dd4cc30f8e14226`, intégré dans la PR #37 ; implémentation finale sans regex de pré-nettoyage, validation par schéma résolu WHATWG, plan amendé) |
| 008 | Docs fausses + purge héritage upstream (`docs/templates/`) | P2 | S-M | — | DONE (approuvé 2026-07-06, branche `worktree-agent-a1bd732a7e6eab178`, intégré dans la PR #37 ; −3019 lignes de docs trompeuses) |
| 009 | `CLAUDE.md` racine (index agents) | P2 | S | — | DONE (approuvé 2026-07-06, branche `worktree-agent-ab18a57145719930a`, intégré dans la PR #37) |
| 010 | Code mort : branche « Setup », clés i18n, asset Lottie | P2 | S | — | DONE (approuvé 2026-07-06, branche `worktree-agent-a36b2185b9da81797`, intégré dans la PR #37 ; −315 lignes) |
| 011 | [SPIKE] Couverture navigateur + rapport fusionné | P2 | M | — | DONE (approuvé 2026-07-06, branche `worktree-agent-ac51381359e60361c`, intégré dans la PR #37 ; couverture réelle du god file : 14,58 % → 66,05 % stmts, baseline pour le plan 014) |
| 012 | Tests caractérisation : calibration dégradée + overlay pixels | P2 | M | — | DONE (approuvé 2026-07-06, branche `worktree-agent-a21600c0503585e24`, intégré dans la PR #37 ; +10 tests navigateur ; a révélé le constat « calibration cassée = faux calibrated:true », voir ci-dessous) |
| 013 | Lazy-load Lottie (~1/3 du bundle) + livrable zip HACS | P3 | L | 005, 010 | IN PROGRESS |
| 014 | Découpage du god file en 4 modules `src/model/map/` | P3 | L | 002, 003, 010 (durs) ; 011, 012 (recommandés) | IN PROGRESS |
| 015 | CI sans matrice + renommage `Xiaomi*` → `Dreame*` | P3 | S+M | 005 ; partie B **en dernier de tout** | TODO |

Status values: TODO | IN PROGRESS | DONE | BLOCKED (avec raison en une ligne) |
REJECTED (avec justification en une ligne).

## Dependency notes

- **001-010 sont indépendants entre eux** et peuvent s'exécuter dans n'importe quel
  ordre ; l'ordre listé va du levier le plus fort au plus faible.
- **013 après 005** (les deux éditent `release.yml`) et **après 010** (010 supprime
  l'asset Lottie mort, 013 restructure les imports Lottie restants).
- **014 après 002, 003 et 010** : ces trois plans corrigent du code situé dans les
  zones exactes que 014 déplace — les fusionner dans le refactor rendrait le diff
  invérifiable. **011 et 012 avant 014** fortement recommandés : baseline de
  couverture + tests de caractérisation = le filet du refactor.
- **La partie B de 015 (renommage massif) s'exécute en tout dernier** : elle touche
  ~93 sites dans `src/`, `test/` et `test-browser/` et entrerait en conflit avec
  tous les autres plans.
- 001 et 006 modifient tous deux des fichiers de `test-browser/` mais pas les mêmes
  zones — pas de conflit réel.

## Nouveau constat (issu de l'exécution du plan 012, 2026-07-06)

- **Calibration cassée indistinguable d'une calibration absente** :
  `CoordinatesConverter(undefined)` pose `calibrated = true` (identité implicite,
  `src/model/map_objects/coordinates-converter.ts:35-39`). Quand
  `calibration_source.entity` renvoie `"unknown"` ou un JSON invalide,
  `_getCalibration()` retourne `undefined` sans exception (bien), mais la carte se
  croit alors calibrée en identité map=vacuum — presque certainement faux sur une
  vraie carte. Comportement figé tel quel par `test-browser/calibration-fallback.test.ts`
  (commentaire détaillé en tête de fichier). Candidat pour un futur plan : distinguer
  « pas de calibration nécessaire (plateforme) » de « source de calibration en échec »
  (ex. `calibrated = false` + message utilisateur dans le second cas). Impact M,
  effort S-M, confiance HIGH (vérifié par exécution réelle).

## Findings considered and rejected

(Consignés pour ne pas être ré-audités au prochain passage.)

- **`pointer-tracker` archivé (GoogleChromeLabs)** — dépôt archivé, sur le chemin
  critique du pinch-zoom. Migrer maintenant serait plus risqué que le statu quo (le
  paquet fonctionne, la zone est très testée). À réévaluer si un bug navigateur
  apparaît ; un spike de remplacement (`@use-gesture` ou PointerEvent natif) devra
  passer intégralement par la suite `test-browser/`.
- **`change-perspective` dormant (~4 ans, 1 mainteneur)** — utilisé pour
  l'homographie 4 points dans `coordinates-converter.ts`. Pas de bug connu ;
  recommandation : vendoriser la fonction (~40 lignes) à l'occasion d'un futur
  passage dans ce fichier, pas de plan dédié.
- **`transformation-matrix` + `change-perspective` = duplication ?** Non : affine vs
  homographie 4 points, pas de recouvrement d'API. Non-finding.
- **`lottie-web` complet importé ?** Non : c'est déjà le build `lottie_light` qui
  est importé. Le vrai levier est le lazy-load (plan 013).
- **Templates Jinja évalués côté serveur via l'API HA** (`evaluateJinjaTemplate`) —
  convention standard de la plateforme Home Assistant, pas une faille (by-design).
- **`docs/INTEGRATION-CONTRACT.md` mentionne une IP LAN et un flux d'auth de dev** —
  aucune valeur de credential committée, IP privée non routable. Non-finding.
- **Filtre `javascript:` contournable** — retenu mais déclassé en durcissement
  mineur (plan 007) : la config YAML est rédigée par l'admin du dashboard, sévérité
  basse.
- **Couverture affichée 14,5 % sur le god file** — ce n'est PAS « 85 % du fichier
  non testé » : la suite navigateur qui l'exerce n'est pas instrumentée. Le plan 011
  mesure avant de juger.

## Direction (options produit, non planifiées — à la discrétion du mainteneur)

- **Multi-carte / multi-étage** : l'environnement de référence expose 4 entités
  caméra pour un seul robot (`docs/INTEGRATION-CONTRACT.md:84-86`) mais
  `MapSourceConfig` (`src/types/types.ts:70-74`) n'accepte qu'une seule `camera`.
  Avant tout plan : vérifier sur device réel si `map_1`/`wifi_map_1` sont des étages
  ou des vues. Spike L.
- **Sélecteur de coordonnées dans l'éditeur** : l'upstream avait un mode « Setup »
  (copie de coordonnées au clic), supprimé sans remplacement, alors que zones/points
  prédéfinis exigent toujours des tableaux de coordonnées saisis à la main — et que
  le hit-test + `CoordinatesConverter` existent déjà. Vérifier la demande réelle
  (issues GitHub) avant de prototyper. Spike M.
