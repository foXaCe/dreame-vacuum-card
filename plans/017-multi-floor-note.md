# Note de spike — multi-carte / multi-étage (2026-07-06)

> Investigation menée sur le HA dev avec l'Aqua10 réel (r95285), pour lever
> l'inconnue notée dans `plans/README.md` § Direction : « vérifier sur device
> réel si `map_1`/`wifi_map_1` sont des étages ou des vues ».

## Constat (vérifié sur device réel)

Les 4 entités caméra de l'intégration sont :

| Entité | Rôle | Attributs observés |
|---|---|---|
| `camera.*_map` | **Vue live** de la carte sélectionnée | `map_id: 4` (id de carte live), `frame_id`, `rooms`, calibration |
| `camera.*_map_data` | Vue debug (rendu des données brutes) | pas de `map_name` |
| `camera.*_map_1` | **Carte sauvegardée n°1** | `map_name: "Maison"`, `map_id: 1`, `selected: true`, `rooms` |
| `camera.*_wifi_map_1` | Heatmap Wi-Fi de la carte 1 | désactivée par défaut par l'intégration |

**Verdict : les caméras `map_N` sont des ÉTAGES (une par carte sauvegardée),
pas des vues alternatives.** Sur un robot multi-étage (`multi_floor_map: true`,
plusieurs cartes sauvegardées), l'intégration expose `map_1`, `map_2`, …
L'Aqua10 de référence n'a qu'une carte (`multi_floor_map: false`), donc un
seul `map_1`.

## Implications pour la carte (si un plan multi-étage est lancé)

- `MapSourceConfig` (`src/types/types.ts`) n'accepte qu'une `camera` : le
  multi-étage passera soit par plusieurs presets (déjà possible manuellement),
  soit par une auto-découverte des `camera.*_map_N` du même device + un
  sélecteur d'étage dans la carte.
- Le changement d'étage côté robot passe par l'entité select de carte
  sélectionnée de l'intégration (le `selected: true` bouge) — la carte doit
  suivre `selected` plutôt que de figer un étage.
- La vue live (`camera.*_map`) reste la bonne source par défaut : elle suit
  la carte sélectionnée toute seule. Le multi-étage n'apporte de valeur que
  pour AFFICHER un étage non sélectionné (consultation) ou pour lancer un
  nettoyage sur un autre étage — vérifier ce que le firmware permet avant de
  promettre le second cas.
- Effort estimé inchangé : L. Prérequis : accès à un device multi-étage réel
  (ou une seconde carte sauvegardée créée volontairement sur l'Aqua10).
