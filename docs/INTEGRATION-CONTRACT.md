# Contrat carte ↔ intégration — référence complète

> Document de travail partagé entre **la carte Lovelace** (`dreame-vacuum-card`, ce repo)
> et **l'intégration** (`dreame_vacuum`, qui rend la carte/map en PNG côté serveur).
> À lire intégralement par tout agent (Claude Code ou humain) qui travaille sur le
> **rendu de map côté intégration** ou sur la **consommation côté carte**.
>
> État de référence : carte **v5.10.0** (2026-07-06), HA core **2026.7.0**,
> frontend **20260624.3**.

---

## 1. Philosophie de répartition (décision d'architecture)

**Le rendu visuel appartient à l'INTÉGRATION. La carte Lovelace reste mince.**

| Responsabilité | Propriétaire |
|---|---|
| Dessin des pièces, murs, sols/tapis, meubles, seuils, no-go, obstacles, labels, path, chargeur | **Intégration** (dans le PNG) |
| Qualité visuelle du PNG (résolution, anti-aliasing, palette, netteté des labels) | **Intégration** |
| Données structurées (calibration, rooms, positions, segment_map) | **Intégration** |
| Affichage de l'image, pinch-zoom, skeleton de chargement | **Carte** |
| Hit-test des pièces (clic), sélections (pièces/zones), overlays d'interaction | **Carte** |
| Marqueur robot **dynamique** (suivi fluide anti-flicker pendant nettoyage) | **Carte** (si `robot_in_map=false`) |
| Header statut, chip CleanGenius, boutons d'action, appels de service | **Carte** |

Chaque fois qu'un choix se présente « qui dessine ça ? » → réponse par défaut :
**l'intégration**. Plus le PNG est complet et soigné, plus la carte est simple.

### 1.1 Soulager la carte — c'est un OBJECTIF, pas un effet de bord

L'intégration ne se contente pas de « ne pas casser » la carte : elle cherche activement
à **lui retirer du travail**. Chaque complexité côté carte qui existe pour compenser une
limite du rendu serveur est une **dette à résorber côté intégration**. La direction du
transfert est toujours la même : la carte fait aujourd'hui X en JS → l'intégration prend
X en charge dans le rendu ou dans les données → la carte supprime son code X.

**Candidats au transfert identifiés (état v5.10.0)** — à traiter comme un backlog commun :

| Ce que la carte fait aujourd'hui (et pourquoi) | Ce qui le rendrait inutile côté intégration |
|---|---|
| Fallback pick-canvas par **polygones** quand le `segment_map` est dégénéré (tout-à-zéro) | Un `segment_map` toujours fiable (§3.3, backlog E) → le fallback carte pourra être supprimé |
| ~~`image-rendering: crisp-edges` au zoom pour masquer la pixellisation~~ | ✅ **TRANSFERT TERMINÉ** (2026-07-06) : rendu ×2 livré côté intégration, compensation retirée côté carte (règle CSS + classe `zoomed` supprimées), zoom ×3 vérifié net sur device réel |
| Overlay **chargeur** calculé/dessiné en JS | Chargeur incrusté dans le PNG (déjà une couche `CHARGER` du renderer) avec un rendu de qualité → l'overlay carte pourra disparaître |
| Cap robot déduit en transformant un vecteur par la calibration (contournement d'une convention `a` inconnue) | Convention `a` documentée/normalisée (backlog F) → simplification du calcul côté carte |
| Throttle agressif + double-buffering pour absorber les bumps d'image inutiles | Stabilité temporelle du `?v=` (backlog D) → moins de pression, code de garde simplifiable |
| Mapping `_rawToRoomId` reconstruit par heuristique quand `segment_id` manque | `segment_id` systématiquement exposé dans `rooms` → la carte supposera toujours le mapping explicite |

Ce qui reste **définitivement** côté carte (interactif par nature, ne pas tenter de le
transférer) : hit-test au clic, overlays de sélection pièces/zones, marqueur robot
dynamique pendant nettoyage, pinch-zoom, header/chip/boutons, appels de service.

### 1.2 Développement fusionnel — deux repos, UN produit

La carte et l'intégration ne sont pas deux projets qui se parlent par attributs interposés :
c'est **un seul produit** dont le code vit dans deux repos. Concrètement :

- **Ce document est la source de vérité unique** du contrat, versionné dans le repo carte,
  lisible sur disque par les deux sessions de dev. Toute évolution du contrat se fait ICI,
  dans le même changement que le code.
- **Toute feature visuelle se conçoit à deux** : l'intégration produit le rendu + les
  données, la carte n'ajoute que l'interaction. Avant d'implémenter un contournement côté
  carte, on se demande d'abord « l'intégration peut-elle exposer la donnée / faire le rendu
  propre ? » — et inversement, l'intégration ne pousse pas une amélioration de rendu sans
  dérouler la checklist §7 sur la carte réelle.
- **Chaque transfert (§1.1) se livre en deux temps coordonnés** : l'intégration livre la
  capacité, PUIS la carte supprime son code de compensation (jamais l'inverse, jamais
  unilatéralement — cf. §6).
- **Les tests de la carte servent l'intégration** : les suites navigateur
  (`test-browser/`) et les fixtures exécutables sont le harnais de non-régression du
  contrat. Une session côté intégration qui doute d'un format le vérifie dans ces
  fixtures ; une session côté carte qui change une consommation met à jour fixtures ET
  ce document.
- **Même environnement, même device** : tout se valide sur le HA dev commun (§2) avec
  l'Aqua10 réel, pas sur des suppositions.

---

## 2. Environnement de développement partagé

- **HA dev** : container docker `homeassistant` (network host → `http://localhost:8123`),
  config dans `/home/stephane/homeassistant/config/`.
- **Dashboard de test** : `/lovelace/vacuum` — carte déjà configurée sur le **device réel**
  Dreame Aqua10 Ultra :
  - `vacuum.aqua10_ultra_track_complete_aqua10_ultra_track_complete`
  - `camera.aqua10_ultra_track_complete_map` (+ `map_1`, `map_data`, `wifi_map_1`)
- **Déploiement carte** : `dist/dreame-vacuum-card.js` →
  `config/www/community/lovelace-xiaomi-vacuum-map-card/dreame-vacuum-card.js`.
  Ressource Lovelace id `dreame_vacuum_card`. **Cache-bust obligatoire** à chaque dépôt
  (piège service worker : même URL = ancien JS servi, même après Ctrl+Shift+R) :
  bumper `?v=` via WebSocket `lovelace/resources/update` — jamais éditer `.storage/`
  pendant que HA tourne.
- **Déploiement intégration** : copier dans `config/custom_components/dreame_vacuum/`
  puis `docker restart homeassistant`.
- **Logs** : les erreurs de la CARTE ne vont **pas** dans `home-assistant.log` (console
  navigateur F12 uniquement, ou rapatriement via service `system_log.write`).
  Les logs de l'INTÉGRATION : `grep -iE "error|warning" config/home-assistant.log`.
- **Auth headless** (captures/tests automatisés) : refresh token `token_type=normal` dans
  `config/.storage/auth` (sudo requis), échange via `POST /auth/token`
  (`client_id=http://192.168.1.183:8123/`), injection `localStorage.hassTokens`.
  Token d'accès : TTL 30 min. Détails : mémoire projet `ha-dev-visual-harness`.

---

## 3. Le contrat d'attributs (entité `camera.*_map`) — STRICT

### 3.1 `entity_picture` — le PNG final

- URL avec cache-buster `?v=int(last_updated)` : ne doit changer **que si le contenu de
  l'image change réellement**. La carte fait du double-buffering dessus : chaque bump
  déclenche un télécharge-décode complet.
- La zone **hors pièces doit rester transparente** : la carte laisse transparaître la
  surface du thème HA (thèmes translucides inclus). Un fond opaque casse tous les thèmes.

### 3.2 `calibration_points` — 3 ou 4 points `{map:{x,y}, vacuum:{x,y}}`

- `map.x/y` en **pixels de l'image finale** (l'espace d'`entity_picture`, après tout
  scale/crop/rotation du renderer).
- **Recalculés atomiquement** avec l'image à chaque changement de résolution/crop/padding.
- Jamais colinéaires, jamais dupliqués. 3 points → transformation affine,
  4 points → perspective.
- ⚠ Depuis la carte v5.10.0, une calibration incohérente (colinéaire, dupliquée, ou
  désalignée avec les transformations) est **détectée par auto-vérification**
  (`CoordinatesConverter.selfCheck`, `src/model/map_objects/coordinates-converter.ts`)
  → la carte affiche « Invalid calibration » au lieu de rendre. Toute erreur de
  calibration côté intégration est donc **immédiatement visible**.

### 3.3 `segment_map` — PNG base64, hit-test des pièces

- **Canal bleu = ID de segment** de chaque pixel ; `0` = hors pièce.
- **Même emprise/cadrage** qu'`entity_picture`. La résolution peut différer : la carte
  met à l'échelle par ratio largeur/hauteur.
- **AUCUN anti-aliasing, lissage ou compression avec perte** sur ce buffer : un blend de
  bord produit des IDs bleus faux. Rendu nearest, aplats purs.
- Ne **jamais publier un buffer uniforme tout-à-zéro** (bug observé sur certains devices :
  la carte détecte ce cas et bascule sur un fallback polygones, mais corriger la source
  est préférable — ne publier l'attribut que s'il a du contenu).

### 3.4 `rooms` — `Record<room_id, {…}>` en **coordonnées VACUUM**

```
{
  "<room_id>": {
    x0, y0, x1, y1,          // bounding box, coordonnées vacuum
    outline?: [[x,y], ...],  // polygone optionnel (prioritaire sur la bbox)
    visibility?: "Hidden",   // masque la pièce côté carte
    color?: [r,g,b],         // ou color_index (palette par défaut)
    color_index?: number,
    segment_id?: number      // OBLIGATOIRE si valeur brute du canal bleu ≠ room_id
  }
}
```

- Exemple réel du besoin de `segment_id` : Kitchen `room_id=2` mais pixel brut `11`.

### 3.5 `vacuum_position` — `{x, y, a}`

- `x, y` en coordonnées vacuum ; `a` en **degrés dans le repère vacuum**.
- La carte calcule le cap écran en transformant un vecteur unité `(cos a, sin a)` par la
  calibration (donc robuste à toute rotation/perspective de la map) — mais cela suppose
  que `a` est bien un angle du repère vacuum. **Convention exacte (origine, sens) à
  documenter côté intégration** : c'est le seul point du contrat jamais validé sur robot
  en mouvement réel.
- ✅ **VALIDÉ SUR ROBOT EN MOUVEMENT (2026-07-06)** — convention confirmée empiriquement,
  clôt la seule inconnue du contrat. `vacuum_position.a` est l'angle **BRUT** du device
  (`robot_position.a`), en **degrés dans la convention standard `atan2(Δy, Δx)` du repère
  vacuum** (0° = +x, sens trigonométrique vers +y). La formule de la carte `(cos a, sin a)`
  transformée par la calibration est **CORRECTE telle quelle** — rien à changer, ni carte,
  ni intégration. Ceci confirme l'analyse carte ci-dessous (le brut est le bon).
  - **Méthode** : ~9 positions échantillonnées pendant un vrai nettoyage, angle `a` comparé
    à la direction de déplacement réelle `atan2(Δy, Δx)`. Écart moyen **14,9°** (résidu
    normal : le robot ne roule pas exactement dans son cap — virages, déports). Réfutées :
    `a` + y-inversé = 130,6° d'écart ; `_convert_angle(a)` = 81° d'écart.
  - ⚠ **Piège** : le renderer JSON (`camera.*_map_data`) applique `_convert_angle` =
    `int((((180-a) if a<180 else (360-a+180))+270)%360)` — c'est une convention DIFFÉRENTE,
    interne à ce renderer. Ne PAS l'appliquer à `vacuum_position` (que la carte lit).
  - **Rafraîchissement** mesuré : ~toutes les 3 s pendant le nettoyage. Un « gel » observé
    = robot **docké** (immobile, position = dock), pas un bug. Cadence OK pour l'overlay
    interpolé ; un rafraîchissement plus fin relève du backlog D.
- ℹ️ **ANALYSE carte (2026-07-06)** — cohérente avec la validation ci-dessus :
  la calibration de ce device mappe vacuum +x → écran +x et vacuum +y → écran −y
  (flip Y : `(0,1000)→map y 923→763`). Le calcul carte `θ_écran = atan2(M·(cos a, sin a))`
  donne `θ ≈ −a`. Avec `a_brut = 184` (docké) → θ ≈ 176° = ouest, cohérent avec le dock sur
  le mur droit du Cellier ; l'angle transformé (266) donnait θ ≈ 94° (incohérent).

### 3.6 `charger_position` — `{x, y}` en coordonnées vacuum

- ✅ Exposé sur `camera.*_map` (via `optimized_charger_position` si dispo, sinon
  `charger_position`). Robot docké : `charger_position == vacuum_position` (attendu).

### 3.7 `robot_in_map` — booléen, doit refléter fidèlement le rendu

- `true` : l'icône robot est incrustée dans le PNG (réglage « Hidden map objects »).
- `false` : la carte active **automatiquement** son overlay robot client-side
  (marqueur CSS interpolé, anti-flicker, suit `vacuum_position`).
- Un booléen mensonger = double robot à l'écran, ou pas de robot du tout.

---

## 4. Pipeline de consommation côté carte (v5.10.0 — références de code)

Repo carte : `/mnt/39c0f0e6-4018-4aa1-8d96-24720083fa77/Codage/GitHub/dreame/dreame-vacuum-card`

| Étape | Fichier / fonction | Ce qui se passe |
|---|---|---|
| Image | `src/dreame-vacuum-card.ts` → `_getMapSrc()` (~l.831) | Lit `entity_picture`, préchargement + double-buffering : l'`<img>` visible ne bascule qu'une fois la nouvelle image décodée (zéro flash) |
| Calibration | `_getCalibration()` (~l.709) → `CoordinatesConverter` | Source `calibration_source: camera` → lit `calibration_points` de la caméra ; construit affine (3 pts) ou perspective (4 pts) + **selfCheck anti-dégénérescence** |
| Hit-test | `_buildPickCanvas()` / `_loadSegmentMap()` (~l.1631) | Décode `segment_map` dans un canvas à sa taille native, hit-test au clic par lecture du canal bleu (scale par ratio vs image affichée), mapping `_rawToRoomId` via `segment_id` |
| Pièces | `_getRoomsConfig()` (~l.1208) | Convertit l'attribut `rooms` en objets `Room` (outline vacuum → pixels via calibration) pour l'overlay de sélection |
| Robot | rendu (~l.420-462) + `components/robot-marker.ts` | Overlay auto si `robot_in_map === false` ; position en % de l'image ; cap par transformation de vecteur |
| Chargeur | rendu (~l.401-416) | `charger_position` → % de l'image via calibration |
| Perf | `shouldUpdate()` (~l.320) | Re-render filtré par entités observées + throttle 200 ms pendant nettoyage actif |

**Contrat exécutable** : `test-browser/fixtures/hass.ts` — mock complet de ce que la carte
attend (images générées par canvas, segment_map canal bleu, calibration ×10, rooms).
En cas de doute sur un format, c'est la référence. Les suites `test-browser/*.test.ts`
(Chromium réel) vérifient hit-test, services, zones, overlay robot, double-buffering.

---

## 5. Backlog rendu côté intégration (par ordre de valeur)

> Chaque item livré ici **soulage la carte** : la colonne de droite du tableau §1.1 dit
> quel code de compensation côté carte devient supprimable une fois l'item en place.

- **A. Résolution de rendu ×2 minimum** (idéalement configurable ×1/×2/×3).
  ✅ **LIVRÉ côté intégration** (2026-07-06, option `map_scale` 1/2/3, défaut 2) : le
  renderer multiplie `dimensions.scale` ; `calibration_points` se recalcule
  automatiquement dans le nouvel espace pixels (dérivés de `dimensions.scale`), le
  `segment_map` reste en résolution native. Vérifié sur r95285 : rendu 2384×2368,
  fond transparent, 3 pts calibration non colinéaires scalés, ratios AR
  segment_map/image identiques, 10/10 pièces cohérentes.
  ✅ **2ᵉ temps carte LIVRÉ** (2026-07-06) : `image-rendering: crisp-edges` retiré
  (+ classe `zoomed` morte). Validation croisée sur device réel : PNG 2384×2368 servi,
  calibration scalée cohérente (selfCheck OK), hit-test spot-check 2 pièces exactes en
  mode Pièce, zoom ×3 net, fond transparent en dark, 0 erreur console.
- **B. Anti-aliasing du PNG visible uniquement** (murs, contours, path, meubles) —
  jamais sur le segment_map (§3.3). Partiellement en place (path super-échantillonné
  ×2 puis thumbnail) ; à étendre aux autres couches vectorielles.
- **C. Qualité des couches** : labels nets à haute résolution, path lissé, tapis/matériaux,
  meubles, seuils, no-go, obstacles lisibles — tout le statique/semi-statique va dans
  le PNG. ⏸ **Murs vectoriels — décodés, rendu différé** (2026-07-06) : `walls_info`
  du device (segments mm réels, portes distinguées `type 1`) est décodé et conservé
  sur `MapData.wall_lines`/`door_lines`, mais **le rendu additif a été retiré** — dessiné
  par-dessus les murs pixel existants, il produisait des cadres rectangulaires gris
  redondants (cf. anomalie ci-dessous, résolue). Le bon usage — **remplacer** le contour
  pixel Moore-Neighbor/Douglas-Peucker par ces vecteurs propres — reste à faire (nécessite
  de désactiver simultanément le rendu pixel des murs, chantier plus large).
- **D. Stabilité temporelle & fluidité du déplacement** : avec `robot_in_map=false`, seul le
  path devrait faire évoluer le PNG pendant un nettoyage (fréquence modérée) ; le robot est
  l'overlay fluide de la carte. Aucun bump de `?v=` sans changement visuel réel.
  - ✅ **Côté intégration : à sa limite, rien à coder** (mesuré 2026-07-06 sur robot en
    mouvement réel). La `vacuum_position` se rafraîchit **~toutes les 3 s** — c'est la
    **cadence de push du cloud Dreame** (frames carte relevées dans `home-assistant.log`
    à 3 s d'intervalle : la donnée n'arrive pas plus souvent), pas une coalescence côté
    serveur. L'intégration relaie chaque position **sans latence ajoutée** (chaîne
    frame → `_property_changed` → coordinator → `async_write_ha_state`). Amplitude typique
    entre deux MAJ : ~170 mm. Le no-bump-inutile du `?v=` est respecté. **On ne peut pas
    rendre la source plus rapide côté intégration.**
  - 🎯 **La fluidité est un travail CARTE** (interpolation) : rendre le robot **glissant**
    entre deux échantillons espacés de ~3 s relève de l'overlay client-side
    (`components/robot-marker.ts`, rendu ~l.420-462) — interpolation/easing de la position
    en % de l'image entre `vacuum_position` successives, cap par transformation de vecteur
    (convention `a` validée §3.5/F). C'est là, et uniquement là, que se gagne le rendu fluide.
    ✅ **LIVRÉ côté carte (2026-07-06) — interpolation adaptative** : la carte mesure la
    cadence réelle entre deux `vacuum_position` distinctes et fait glisser le marqueur sur
    ~90 % de l'intervalle mesuré (borné 400 ms – 4 s, `--rm-glide` piloté par la prop
    `transitionMs` du marqueur ; linear voulu = vitesse constante entre points de passage).
    Fini le 0,4 s de glisse + 2,6 s de pause : mouvement continu à cadence cloud ~3 s.
    Verrouillé par test Chromium (`robot-overlay.test.ts` — adaptativité + clamp + variable
    CSS).
    ✅ **VALIDÉ EN NETTOYAGE RÉEL (2026-07-06, §7.6)** : overlay activé temporairement sur
    le dashboard pendant un vrai nettoyage, position calculée du marqueur échantillonnée à
    10 Hz pendant 16 s → `transitionMs` auto-calé à **2813 ms** (≈ 90 % de la cadence cloud
    mesurée, transitions CSS actives 2,6–2,8 s), **0 saut > 15 px**, drift continu réparti
    sur tous les échantillons (aucun motif stop-and-go), 0 erreur console. Config dashboard
    restaurée après le test.
    ℹ️ **Setup final utilisateur** pour profiter de l'overlay fluide en permanence :
    masquer « Robot Icon » dans les options de l'intégration (Hidden map objects →
    `robot_in_map: false`) ET retirer `robot_overlay: false` de la config de la carte
    (le mode auto prend alors le relais). Sans cela, le robot reste incrusté dans le PNG
    (saut ~3 s, aucune interpolation possible).
  - ⚠ **Prérequis d'activation** : l'overlay carte ne s'active que si `robot_in_map=false`,
    donc si l'utilisateur **masque l'objet « Robot Icon »** (réglage « Hidden map objects »).
    Tant que « Robot Icon » est visible → `robot_in_map=true` → robot incrusté dans le PNG,
    il « saute » de ~170 mm tous les ~3 s (pas d'interpolation possible, c'est une image).
    Le comportement de l'overlay quand `robot_in_map===false` (activation effective du
    marqueur interpolé, cf. §3.7) est à valider côté carte sur le device réel.
- **E. Fix du segment_map dégénéré** à la source (§3.3). ✅ **LIVRÉ** (2026-07-06) :
  `camera._build_segment_map` retourne désormais `None` quand aucune pièce ne mappe vers
  une valeur brute (buffer tout-à-zéro) → l'attribut n'est plus publié dans ce cas, et le
  fallback polygones de la carte peut prendre le relais (il se déclenche sur l'ABSENCE de
  l'attribut). Chemin nominal inchangé (10/10 pièces publiées sur le device réel).
  ✅ **2ᵉ temps carte LIVRÉ** (2026-07-06) : suite navigateur
  `test-browser/segment-map-fallback.test.ts` — le fallback polygones est verrouillé de
  bout en bout (pick-canvas reconstruit depuis les bboxes `rooms`, sélection/désélection
  au clic, clic hors pièce inerte), 2 tests Chromium.
- **F. Documentation de la convention `vacuum_position.a`** (§3.5). ✅ **RÉSOLU — VALIDÉ SUR
  ROBOT EN MOUVEMENT (2026-07-06)** : `a` = angle brut du device, convention standard
  `atan2(Δy, Δx)` du repère vacuum ; la carte le consomme correctement TEL QUEL (écart moyen
  mesuré 14,9° vs direction de déplacement réelle ; alternatives réfutées). Détail complet
  et méthode en §3.5. Rien à changer côté carte ni intégration. La `vacuum_position` se
  rafraîchit ~toutes les 3 s en nettoyage (pas de gel — un « gel » = robot docké).
- **G. Passe en cours dans une pièce multi-passes** (demande utilisateur, 2026-07-06) :
  quand une pièce est nettoyée avec `repeats` > 1, RIEN n'expose aujourd'hui « le robot
  en est à la passe N sur M » (vérifié en live sur le device : le vacuum n'a que
  `cleaning_progress` global, `current_segment`/`current_room`, `active_segments`,
  `segment_cleaning` — aucune notion de passe). **À livrer côté intégration**, deux
  pistes par ordre de préférence :
  1. le protocole Dreame l'expose peut-être déjà (le `cleanset` de la map porte les
     répétitions configurées par segment ; certains firmwares remontent l'avancement
     par segment) — voie propre, à investiguer d'abord ;
  2. sinon **l'inférer côté serveur** : l'intégration voit le path et les transitions
     de `current_segment` — une ré-entrée dans un segment déjà terminé du même job =
     passe suivante. Robuste en Python (historique du job) ; impossible à faire
     proprement côté carte.
  **Format de contrat proposé** (nouvel attribut, à promouvoir en §3.8 à la livraison,
  procédure §6) : `segment_pass: { current: 2, total: 3 }` sur le vacuum ou la caméra.
  `null`/absent hors nettoyage segmenté ; `total` = repeats effectifs du segment en
  cours ; mise à jour au changement de segment ou de passe UNIQUEMENT (pas à chaque
  tick — cf. backlog D, ne pas provoquer de re-render carte inutile).
  **2ᵉ temps carte (après livraison)** : badge « Passe N/M » dans le header de statut /
  barre de progression — travail d'affichage trivial, comme les transferts précédents.

- **H. DÉFAUTS EN DUR — l'overlay fluide doit marcher sans AUCUNE option** (directive
  utilisateur, 2026-07-06 : « il faut que ces options soient par défaut… pas besoin
  d'activer, activer en dur dans le code »). État cible : une install neuve a le robot
  fluide d'office.
  - **Côté intégration (à livrer)** : « Robot Icon » **masqué PAR DÉFAUT** dans le rendu
    PNG (→ `robot_in_map: false` par défaut, en code — pas une option à cocher). Attention
    aux installs existantes (options sauvegardées) et au cas des utilisateurs SANS la
    carte (vue caméra nue : plus de robot visible du tout — à évaluer : le défaut peut
    dépendre de la présence de la carte ou être documenté comme breaking).
  - **Côté carte (✅ déjà en place)** : mode AUTO par défaut (`robot_overlay` absent →
    overlay actif dès que `robot_in_map === false`). L'éditeur ne matérialise PLUS
    `robot_overlay: false` à l'édition (fix 2026-07-06 : décoché = clé absente = AUTO,
    coché = `true` ; un `false` explicite ne peut plus apparaître que par YAML volontaire).
    La carte garde AUTO plutôt qu'un forçage dur : avec une intégration plus ancienne
    (`robot_in_map: true`), un forçage afficherait DEUX robots.
- **I. Icône robot RÉELLE pour l'overlay** (retour utilisateur 2026-07-06 : le fallback
  vectoriel ne suffit pas — « il est où mon robot ? » ; l'intégration a l'asset qu'elle
  incrustait dans le PNG et peut le fournir).
  - **Côté intégration (à livrer)** : exposer l'icône robot sur la caméra, attribut
    **`robot_icon`** = data URI (PNG ou SVG), vue de dessus, **orientée vers +x** (0° =
    vers la droite), fond transparent, taille libre (la carte l'affiche en 28 px).
    Statique tant que le device ne change pas (pas de bump par tick — backlog D).
  - **Côté carte (✅ pré-câblé, 2026-07-06)** : `dreame-robot-marker` accepte `iconUrl`
    et affiche l'image (rotation par le cap) dès que l'attribut existe — **zéro changement
    carte à la livraison**. En attendant : fallback SVG « robot vu de dessus » (corps,
    tourelle lidar, pare-chocs avant en couleur d'accent = cap), surchargeable par thème
    (`--map-card-robot-body/halo/lidar`), qui remplace l'ancien disque bleu générique.

### 🔍 Anomalies (constatées côté carte, traitées côté intégration)

- ✅ **RÉSOLUE (2026-07-06) — Traits rectangulaires gris clair sur le rendu ×2** :
  de fins contours rectangulaires gris apparaissaient autour des pièces (ligne au-dessus
  du Salon, bord droit de la Buanderie vers le Cellier, ligne sous les chambres), nets au
  zoom, dans les deux thèmes. C'étaient bien les couches `WALL_OUTLINE`/`DOOR` du rendu
  `walls_info` : dessinées **par-dessus** les murs pixel existants, elles formaient des
  cadres redondants (un rectangle de segments par pièce). **Correctif** : le rendu additif
  des murs vectoriels a été retiré côté intégration (le décodage reste, cf. backlog C).
  Le fond était déjà bien transparent (alpha=0) ; il n'y a plus de traits en trop.
  ✅ **Contre-validé côté carte** (2026-07-06) : captures light + zoom ×3 sur device réel —
  plus aucun trait, netteté intacte, 0 erreur console.

---

## 6. Procédure de changement de contrat

Si un changement de contrat est réellement nécessaire (nouvel attribut, format modifié) :

1. **Ne pas casser unilatéralement** — les deux côtés se mettent à jour de façon coordonnée.
2. Décrire précisément : attribut, ancien format → nouveau format, stratégie de migration
   (période de double exposition si possible).
3. Côté carte, les points d'entrée à adapter sont listés au §4 ; les fixtures
   `test-browser/fixtures/hass.ts` et les suites navigateur doivent être mises à jour
   dans le même changement.

---

## 7. Checklist de validation croisée (après tout changement de rendu)

Sur `/lovelace/vacuum` (device réel) :

1. ☐ La carte s'affiche **sans** « Invalid calibration » (sinon : `calibration_points`
   désalignés avec la nouvelle image — garde-fou v5.10.0).
2. ☐ Onglet **Pièce** : cliquer CHAQUE pièce → c'est bien elle qui se sélectionne
   (hit-test aligné = segment_map cohérent avec l'image).
3. ☐ Onglet **Zone** : dessiner un rectangle → il suit exactement la souris.
4. ☐ Fond hors pièces transparent (tester un thème sombre : pas de dalle claire).
5. ☐ Zoom à fond → netteté (critère du backlog A).
6. ☐ Nettoyage court réel : pas de flicker d'image, robot fluide, pas de double robot.
7. ☐ Console navigateur (F12) : zéro erreur provenant de la carte.
8. ☐ `home-assistant.log` : zéro erreur/warning côté intégration.

Côté carte, les suites automatisées restent le filet : `npm test` (782 tests) et
`CHROMIUM_BIN=/usr/bin/chromium npm run test:browser` (16 tests Chromium).

---

## 8. Interdits absolus

- Anti-aliasing ou compression avec perte sur le `segment_map`.
- Fond opaque hors pièces dans `entity_picture`.
- Bump du cache-buster `?v=` sans changement réel de contenu.
- `calibration_points` non recalculés lors d'un changement de résolution/crop.
- `robot_in_map` ne reflétant pas l'état réel du rendu.
- Casser un point du contrat sans suivre la procédure du §6.
