# Note d'étude — sélecteur de coordonnées dans l'éditeur (2026-07-06)

> Étude de demande réalisée le 2026-07-06 (issues GitHub upstream + forks + doc
> upstream du mode « Setup »). Pas un plan d'implémentation : un verdict et un
> scope recommandé, à transformer en plan si le mainteneur dit GO.

## Verdict : demande MODÉRÉE — GO sur un scope minimal

- L'upstream (`PiotrMachowski/lovelace-xiaomi-vacuum-map-card`) a résolu le
  besoin depuis 2022 via le pseudo-platform `setup_integer`/`setup_decimal`
  (choisi comme *platform* dans l'éditeur, sélection sur la carte, bouton
  « Copy ») — donc plus personne ne le redemande là-bas ; mais la demande
  historique était réelle (issues #10, #41, #72) et l'usage actif est prouvé
  par les bug reports sur le mécanisme (#589 closed, #457 open) et la
  discussion épinglée #318 (6 👍).
- Le fork a supprimé **les deux** mécanismes upstream de récupération de
  coordonnées (mode Setup ET « Generate rooms config » — la clé i18n
  `generate_rooms_config` existe encore dans `src/localize/languages/*.json`
  mais n'a **aucune implémentation** dans l'éditeur : chaîne orpheline, à
  purger ou à réimplémenter).
- Gap de capacité total : `predefined_selections` (zones/points) exige
  toujours des tableaux de coordonnées saisis à la main dans le YAML, sans
  aucun moyen self-service de les obtenir.

## Scope minimal recommandé (si GO)

1. Un toggle « Copier les coordonnées » visible uniquement en mode édition du
   dashboard (pas sur le rendu live).
2. Réutiliser le hit-test de clic + `CoordinatesConverter` existants pour
   convertir le point cliqué en coordonnées vacuum.
3. Readout du/des derniers points + bouton copiant un snippet YAML prêt à
   coller (`[x, y]` ou `[x1, y1, x2, y2]`).
4. Ne PAS recréer le pseudo-platform upstream (contournement historique lié à
   leur système de templates) : overlay/toggle direct dans l'éditeur du fork.

Effort estimé : M. Prérequis : aucun (l'infrastructure existe).
