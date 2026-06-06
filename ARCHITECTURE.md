# Architecture — dreame-vacuum-card

Carte Lovelace **frontend** (TypeScript + [Lit](https://lit.dev) 3) pour Home Assistant,
packagée pour HACS. Fork de *Xiaomi Vacuum Map Card* (Piotr Machowski) spécialisé pour
l'intégration [foXaCe/dreame-vacuum](https://github.com/foXaCe/dreame-vacuum).

## Build & outillage

| Aspect | Choix |
|---|---|
| Langage | TypeScript strict (`strict: true`, `noImplicitAny: true`) |
| UI | Lit 3 (Web Components / Shadow DOM) |
| Bundler | Rollup → `dist/dreame-vacuum-card.js` (ESM, terser) |
| Tests | Vitest + happy-dom |
| Lint/format | ESLint (flat config) + Prettier |
| i18n | 28 langues JSON + portage de helpers du frontend HA |

Scripts : `npm run build` (lint + typecheck + test + rollup + add-version), `npm run start`
(dev watch + serve), `npm run test:coverage`.

> **Déploiement HA** : la carte est servie comme ressource frontend
> (`config/www/.../dreame-vacuum-card.js`). Pas de redémarrage HA nécessaire — un
> hard-refresh navigateur suffit pour recharger la ressource.

## Flux de données

```
Home Assistant (hass)
   │  states (vacuum, sensors, camera) + locale + connection
   ▼
dreame-vacuum-card.ts  ── le composant Lit principal (orchestration + état + rendu)
   ├─ config-validators.ts   valide la config YAML utilisateur → clés i18n d'erreur
   ├─ utils/                  détection de changement, entités surveillées, conditions, actions
   ├─ model/map_mode/         construit les appels de service depuis les modes de carte
   │     MapMode → ServiceCallSchema → ServiceCall (via template-utils + Jinja)
   ├─ model/map_objects/      objets dessinés sur la carte (zones, points, pièces…)
   │     MapObject (base) ← Context (dépendances injectées)
   │     CoordinatesConverter : vacuum ↔ pixels carte (affine/perspective)
   ├─ components/             sous-composants UI (dreame-*)
   └─ localize/               résolution i18n + helpers d'affichage HA
```

### Pipeline d'un appel de service (sélection → action)

1. L'utilisateur sélectionne des pièces/zones/points sur la carte (hit-test canvas pixel
   pour les pièces, interactions SVG pour les zones/points).
2. `MapObject` (room/predefined-*/manual-*) accumule la sélection via le `Context`.
3. À l'action, `MapMode.getServiceCall()` applique le `ServiceCallSchema` :
   `getDefaultVariables` + templates `[[variable]]` (`template-utils`) + évaluation Jinja
   optionnelle (`evaluateJinjaTemplate`, avec timeout et repli gracieux).
4. `hass.callService(domain, service, data, target)`.

## Structure des répertoires

```
src/
├── dreame-vacuum-card.ts     Composant principal : carte/zoom, calibration, image
│                             (double-buffer anti-flash), hit-test pièces, overlay,
│                             sélections/modes, robot-overlay, appels de service.
├── card-styles.ts            Styles CSS du composant principal (extrait, CSSResultGroup).
├── editor.ts                 Éditeur visuel (ha-form déclaratif).
├── config-validators.ts      Validation déclarative de la config → clés i18n.
├── const.ts                  Constantes : tags custom, events, états vacuum, timings.
├── action-handler-directive.ts  Directive Lit tap/hold/double-tap (singleton body).
├── template-utils.ts         Primitives de substitution de variables/templates + Jinja.
│
├── components/               Sous-composants Lit `dreame-*` (Shadow DOM) :
│     action-buttons · cleaning-mode-chip · cleaning-progress-bar · robot-animation
│     · robot-marker · status-header · tab-selector
│
├── model/
│   ├── map_mode/             Modes de carte → appels de service
│   │     map-mode · service-call-schema · service-call · templatable-value
│   │     · modifier · repeats-type · selection-type
│   ├── map_objects/          Objets dessinés (héritage depuis MapObject)
│   │     context (deps injectées, objet nommé) · coordinates-converter
│   │     · map-object · map-point · predefined-map-object · room
│   │     · manual-rectangle · manual-point · manual-path
│   │     · predefined-multi-rectangle · predefined-point · mouse-position
│   └── generators/
│         platform-generator   Accès au template de plateforme (Dreame).
│
├── utils/                    Utilitaires (éclatés par responsabilité, ré-exportés via index)
│     conditions · ha-change-detection · watched-entities · actions
│     · dom · entity-registry · misc
│
├── localize/
│   ├── localize.ts           Résolution i18n (fallback langue → en).
│   ├── languages/*.json      28 langues.
│   └── hass/                 Helpers d'affichage portés du frontend HA.
│
├── ha/index.ts               Vendorisation de helpers custom-card (fireEvent, handleAction…).
├── pinch-zoom/               Zoom/pan tactile (PointerTracker).
└── types/                    types.ts · fixes.ts (surcharges HA) · pointer-tracker.d.ts
```

## Invariants de stabilité (ne jamais casser sans migration)

- **Tags des custom elements** : `dreame-vacuum-card`, `dreame-vacuum-card-editor`,
  `action-handler-dreame-vacuum-card` (cassent les dashboards existants).
- **Schéma de config YAML** : ne pas renommer/supprimer une clé existante (les
  utilisateurs l'ont dans leurs dashboards). Les ajouts (ex. `robot_overlay`) sont sûrs.
- **Clés de traduction `localize`** : ne pas renommer les clés existantes.

## Points d'extension

**Ajouter un type d'objet de carte** : créer `model/map_objects/<type>.ts` étendant
`MapObject` (ou `PredefinedMapObject`), implémenter `render()` (SVG) et la logique
métier ; l'alimenter via le `Context`. Ajouter `${<Type>.styles}` aux styles
(`card-styles.ts`) si nécessaire, et l'instancier dans le composant principal.

**Ajouter un sous-composant UI** : créer `components/<nom>.ts` (`@customElement("dreame-<nom>")`),
l'importer dans `dreame-vacuum-card.ts`, le rendre dans le template. Privilégier de vrais
`<button>` ou `role`/`tabindex`/`@keydown` pour l'accessibilité.

**Ajouter une langue** : déposer `localize/languages/<code>.json` et l'enregistrer dans
`localize/localize.ts`. Les clés absentes retombent automatiquement sur `en`.

**Ajouter une option de config** : déclarer la clé dans `types.ts` (`CardPresetConfig` /
`XiaomiVacuumMapCardConfig`), l'exposer dans `editor.ts` (schéma + data + handler) avec
un label i18n (`editor.label.<clé>` dans en.json + fr.json), et la lire dans le composant.

## Tests

Suite Vitest (`test/**/*.test.ts`, environnement happy-dom). La **couche logique** est
couverte à ≥ 90 % (validators, map_mode, coordinates, utils, template-utils, localize,
platform-generator, map_objects). La **glu DOM/canvas** du composant principal
(`dreame-vacuum-card.ts`), `pinch-zoom`, `editor` et `action-handler-directive` nécessite
un vrai navigateur (canvas `getImageData`, décodage d'image, layout) : non couverte par
happy-dom. Pour une couverture complète de cette couche, un harnais navigateur réel
(Playwright / @web/test-runner) serait nécessaire — voir « Restant » dans le CHANGELOG.
