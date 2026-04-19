# Prompt Claude — Optimisation de l'intégration `dreame_vacuum`

Copie-colle ce prompt dans une nouvelle session Claude Code, depuis le dossier du custom_component `dreame_vacuum` (le fork foXaCe/dreame-vacuum).

---

## Contexte

Je maintiens une carte Lovelace Home Assistant `dreame-vacuum-card` qui consomme les attributs de l'entité caméra et de l'entité vacuum exposées par ton intégration `dreame_vacuum` (fork de `Tasshack/dreame-vacuum`, branche `foXaCe/dreame-vacuum`). Cette intégration parle à l'aspirateur via MiIO (LAN) et/ou cloud Xiaomi.

**Symptôme observé côté utilisateur** : pendant un nettoyage actif, la carte est lente à se mettre à jour — parfois jusqu'à plusieurs secondes de latence entre le mouvement réel du robot et son affichage. Après optimisation côté carte (cache sur hash structure au lieu de `last_updated`, mémoïsation calibration, cache `getImageData`), la carte rend très vite. Il reste donc à vérifier le côté intégration.

## Objectif

Auditer et optimiser l'intégration **sans régression fonctionnelle**. Produire un rapport d'optimisations + appliquer celles qui sont sûres. **Ne pas changer le format des attributs publiés** (la carte en dépend) sauf ajout rétrocompatible.

## Zones à auditer en priorité

### 1. Cadence et stratégie de polling
- Quelle est la fréquence de polling quand `state == cleaning` vs `idle` ? (chercher `SCAN_INTERVAL`, `async_update`, `DataUpdateCoordinator.update_interval`, `_update_interval`, `UpdateCoordinator`).
- L'intégration utilise-t-elle du **push** (MiIO `miot.events`, MQTT local, cloud push) ou du pur **polling** ?
- Y a-t-il un backoff/jitter ou au contraire un polling agressif qui sature le LAN ?
- Chercher les appels réseau redondants : 2 timers indépendants qui font le même `miot.get_properties` ?
- Vérifier si `async_request_refresh` vs `async_refresh` est bien utilisé.

### 2. Génération de l'image caméra
- Où est généré le PNG de la map ? (chercher `camera.py`, `map_renderer`, `PIL.Image`, `Pillow`, `map_image`).
- À quelle fréquence est-il régénéré ? Est-ce à chaque `async_update` ou seulement quand la map réelle change ?
- Le PNG est-il recompressé à chaque fois ? (vérifier level de compression PIL, presence d'un hash pour skipper si identique).
- Le PNG contient-il la position du robot dessinée dessus (bloquant le cache) ou est-elle exposée via attribut `charger_position` / `robot_position` consommé par la carte ?
- Si le robot est dessiné sur le PNG : **c'est le vrai problème**. Il faudrait séparer `map_image` (structure, invalidée rarement) de `robot_overlay` (position, tick 1s).
- Taille du PNG généré : résolution native ou sur-échantillonnée ? (impact CPU sur host HA).

### 3. Attributs exposés
- Vérifier les attributs `rooms`, `segment_map`, `calibration_points`, `charger_position`, `robot_position`, `obstacles`, `furniture`, `no_go_zones`.
- Sont-ils recalculés à chaque update ou mis en cache avec invalidation sur hash ?
- `segment_map` (base64 PNG du canal bleu = ID segment) est-il régénéré à chaque poll ? Il ne change qu'au mapping initial ou lors d'une ré-exploration — jamais pendant un nettoyage normal. **À cacher agressivement.**
- `rooms` idem — structure stable pendant le nettoyage.

### 4. Sérialisation / JSON
- Chercher les `json.dumps` coûteux dans le chemin chaud (`async_update`).
- Vérifier si des objets énormes (`map_data`, `history`) sont ré-encodés à chaque tick.
- L'attribut `map_data` (visible dans mes logs, ~600 KB) est-il poussé à chaque update ? Si oui, il sature le websocket HA.

### 5. Historique / recorder
- Les attributs lourds (`map_data`, `segment_map`, `rooms`) sont-ils exclus du recorder (`extra_state_attributes` vs `_attr_extra_state_attributes`) ?
- Sans exclusion, le recorder écrit un blob de 600 KB dans SQLite à chaque update → latence IO énorme.
- Vérifier `_attr_should_poll`, présence de `entity_registry_enabled_default`, et liste blanche/noire du recorder.

### 6. Blocage du thread async
- Chercher des appels synchrones dans le contexte async : `requests.get`, `time.sleep`, décodage Pillow sans `hass.async_add_executor_job`.
- Vérifier les `await` bloquants longs (> 50 ms) dans `async_update`.

### 7. WebSocket / event bus
- L'intégration dispatche-t-elle trop d'events (`async_dispatcher_send`) qui provoquent N re-render HA ?
- Si oui, déduplication avec un throttle suffit.

## Livrables attendus

1. **Rapport d'audit** structuré par section ci-dessus, avec `fichier.py:ligne` précis pour chaque point problématique.
2. **Mesure avant/après** si possible :
   - Temps moyen de `async_update` (logger DEBUG).
   - Taille des attributs publiés (longueur des strings).
   - Fréquence effective des updates pendant cleanage vs idle.
3. **Fixs appliqués**, avec diff minimaliste, dans cet ordre de priorité :
   - a. Exclure les attributs lourds du recorder.
   - b. Mettre en cache `segment_map` / `rooms` / `calibration_points` sur un hash (invalidation uniquement si structure change).
   - c. Séparer `map_image` (lent à changer) et `robot_position` (rapide).
   - d. Vérifier la stratégie de polling (push > polling).

## Contraintes

- **Pas de breaking change** sur les attributs consommés par la carte : `calibration_points`, `rooms`, `segment_map`, `charger_position`, `entity_picture`.
- **Pas de downgrade de fonctionnalité** : la carte a besoin du tick ~2 s pour l'animation du robot. Si tu réduis la cadence globale, expose au moins `robot_position` en push.
- **Compatibilité HA 2024.3+** : utiliser les patterns modernes (`DataUpdateCoordinator`, `runtime_data`, etc.).
- **Tester sur un aspirateur réel** ou mock avant de commit.

## Commandes utiles

```bash
# Recherche des points chauds
grep -rn "async_update\|update_interval\|SCAN_INTERVAL" custom_components/dreame_vacuum/

# Taille des attributs publiés
grep -rn "extra_state_attributes\|_attr_extra_state_attributes" custom_components/dreame_vacuum/

# Exclusions recorder
grep -rn "exclude\|EXCLUDE_ATTRIBUTES" custom_components/dreame_vacuum/

# Appels PIL / décodage image
grep -rn "PIL\|Image\.\|save\|encode" custom_components/dreame_vacuum/

# Appels synchrones suspects
grep -rn "requests\.\|urllib\|time\.sleep" custom_components/dreame_vacuum/
```

Démarre par le rapport d'audit (sans coder), puis on valide les pistes avant d'appliquer les fixs.
