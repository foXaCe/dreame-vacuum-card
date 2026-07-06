# CLAUDE.md — dreame-vacuum-card

## Quoi

Carte Lovelace Home Assistant (TypeScript strict + Lit 3) pour l'intégration
[foXaCe/dreame-vacuum](https://github.com/foXaCe/dreame-vacuum), distribuée via HACS.
Fork spécialisé de *Xiaomi Vacuum Map Card* (Piotr Machowski).

## À lire d'abord

- [`ARCHITECTURE.md`](ARCHITECTURE.md) — structure des répertoires, flux de données,
  points d'extension.
- [`docs/INTEGRATION-CONTRACT.md`](docs/INTEGRATION-CONTRACT.md) — **obligatoire avant
  tout travail sur le rendu de carte / `segment_map` / calibration / overlay robot**.

## Commandes de vérification

| Commande | Rôle |
|---|---|
| `npm run lint` | ESLint sur `src/` |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Suite unitaire (Vitest + happy-dom) |
| `npm run format:check` | Prettier (vérifié en CI) |
| `npm run rollup` | Build du bundle `dist/dreame-vacuum-card.js` |
| `CHROMIUM_BIN=/usr/bin/chromium npm run test:browser` | Suite navigateur réel (Chromium headless), en local |

`npm run build` enchaîne lint + typecheck + test + rollup + add-version.
`npm start` lance le dev watch (rollup + serve).

## Invariants — ne jamais casser

- **Tags des custom elements** : `dreame-vacuum-card`, `dreame-vacuum-card-editor`,
  `action-handler-dreame-vacuum-card` (cassent les dashboards existants).
- **Schéma de config YAML** : ne jamais renommer/supprimer une clé existante ; les
  ajouts sont sûrs.
- **Clés de traduction `localize`** : ne jamais renommer les clés existantes.

Détail et justification : `ARCHITECTURE.md` § « Invariants de stabilité ».

## Conventions

- Commits en français, préfixes conventional commits (`fix(...)`, `feat(...)`,
  `docs:`, `test:`, `chore:`) ; jamais de trailer de co-auteur.
- Prettier obligatoire sur `src/` (la CI exécute `format:check`).
- Commentaires de code en français.
- `dist/` est committé volontairement (installation par raw URL) — ne pas l'ajouter
  au `.gitignore` ni le supprimer.

## Pièges connus

- La carte reçoit un objet `hass` complet à chaque state-changed : le filtrage se
  fait via `shouldUpdate`/`watched-entities`, pas par un re-render naïf.
- Les tests navigateur (`test-browser/`) sont le seul filet sur la glu DOM/canvas
  (décodage d'image, hit-test canvas, drag SVG) — les lancer avant de conclure sur
  tout changement touchant `src/dreame-vacuum-card.ts`.
