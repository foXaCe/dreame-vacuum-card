# Plan 002: Stopper les retries après déconnexion et garder `render()` sûr sans `hass`

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat cf8701f..HEAD -- src/dreame-vacuum-card.ts`
> If the file changed since this plan was written, compare the "Current state"
> excerpts against the live code before proceeding; on a mismatch, treat it as
> a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: bug
- **Planned at**: commit `cf8701f`, 2026-07-06

## Why this matters

Deux failles de cycle de vie dans le composant principal :

1. **Retries fantômes** : `_initializeRooms()` se re-programme lui-même toutes les
   500 ms (jusqu'à 20 fois, ≈10 s) tant que `this.modes` n'est pas prêt. Rien ne
   l'arrête à la déconnexion : une carte retirée du DOM (édition de dashboard,
   re-création) continue de tourner, retient son graphe d'objets en mémoire via la
   closure, et appelle `_getRoomsConfig()` qui déréférence `this.hass.states` sans
   garde — crash possible sur instance obsolète. L'ironie : le flag `this.connected`
   existe et est correctement maintenu, il n'est juste pas consulté.
2. **`render()` sans garde `hass`** : `render()` appelle
   `areAllEntitiesDefined(this.watchedEntities, this.hass)` qui fait
   `Object.keys(hass.states)` — `TypeError` si `hass` n'est pas encore assigné
   (fenêtre possible entre `setConfig()` et l'assignation de `.hass` par Lovelace,
   notamment en preview d'éditeur). Les lignes 410 et 446 déréférencent aussi
   `this.hass.states[...]` directement alors que la ligne 442 utilise `this.hass?.`.

## Current state

Tout est dans `src/dreame-vacuum-card.ts` :

- Lignes 291-304 (`connectedCallback`) : pose `this.connected = true` (l.300) puis
  appelle `this._initializeRooms()` (l.302).
- Lignes 306-319 (`disconnectedCallback`) : pose `this.connected = false` (l.314) et
  n'annule que `_throttledRenderTimer` (l.315-318).
- Lignes 1582-1591 :

  ```ts
  private _initializeRoomsRetries = 0;

  private _initializeRooms(): void {
      if (!this.modes || this.modes.length === 0) {
          if (this._initializeRoomsRetries >= 20) return;
          this._initializeRoomsRetries++;
          delay(500).then(() => this._initializeRooms());
          return;
      }
      this._initializeRoomsRetries = 0;
  ```

- Lignes 387-397 (`render()`, en-tête) :

  ```ts
  protected render(): TemplateResult | void {
      if (this.oldConfig) {
          return this._showOldConfig();
      }
      if (this.configErrors.length > 0) {
          return this._showConfigErrors(this.configErrors);
      }
      const invalidEntities = areAllEntitiesDefined(this.watchedEntities, this.hass);
  ```

  `areAllEntitiesDefined` (`src/config-validators.ts:253`) fait `Object.keys(hass.states)`
  sans garde.

- Ligne 410 : `const camState = this.hass.states[preset.map_source.camera];` (bloc
  chargeur) ; ligne 446 : idem (bloc robot). Ligne 442 (contraste) :
  `this.hass?.states[preset.map_source.camera]`.

- Lignes 1228-1233 (`_getRoomsConfig`) :

  ```ts
  private _getRoomsConfig(): RoomConfigEventData | undefined {
      const config = this._getCurrentPreset();
      const rooms = this.hass.states[config.map_source?.camera ?? ""]?.attributes["rooms"] as ...
  ```

- Convention : commentaires en français, TypeScript strict, Prettier.

## Commands you will need

| Purpose   | Command                  | Expected on success |
|-----------|--------------------------|---------------------|
| Typecheck | `npm run typecheck`      | exit 0              |
| Lint + format | `npm run lint && npm run format:check` | exit 0 |
| Tests unitaires | `npm test`         | tous verts          |
| Tests navigateur | `CHROMIUM_BIN=/usr/bin/chromium npm run test:browser` | tous verts |

## Scope

**In scope**:
- `src/dreame-vacuum-card.ts` (uniquement : `_initializeRooms`, `render()` en-tête,
  `_getRoomsConfig` en-tête)
- `test-browser/card-mount.test.ts` ou nouveau fichier `test-browser/lifecycle.test.ts` (tests)

**Out of scope**:
- `disconnectedCallback` au-delà de ce qui existe (ne pas y déplacer d'autre logique).
- `src/config-validators.ts` — ne pas modifier `areAllEntitiesDefined` : la garde se
  fait côté appelant.
- Le mécanisme de throttling `shouldUpdate` (l.325-354) — il fonctionne, ne pas y toucher.

## Git workflow

- Ne committe pas et ne pousse pas : l'utilisateur contrôle git. Laisse les
  modifications dans l'arbre de travail et signale-les dans ton rapport final.

## Steps

### Step 1: Garde `connected` dans `_initializeRooms`

En tête de `_initializeRooms()` (avant le test `!this.modes`), ajouter :

```ts
// Instance déconnectée : ne pas poursuivre la chaîne de retries (cf. connectedCallback).
if (!this.connected) return;
```

Note : `connectedCallback` pose `this.connected = true` **avant** d'appeler
`_initializeRooms()` (l.300→302), donc le chemin nominal est inchangé.

**Verify**: `npm run typecheck` → exit 0

### Step 2: Garde `hass` dans `render()`

Après le bloc `configErrors` (l.391-393) et avant l'appel à
`areAllEntitiesDefined` (l.394), ajouter :

```ts
// hass peut ne pas être encore assigné (setConfig → premier render, preview éditeur).
if (!this.hass) {
    return;
}
```

(`render()` retourne `TemplateResult | void` : `return;` est valide et ne rend rien.)
Les déréférencements directs des lignes 410 et 446 deviennent sûrs grâce à cette
garde — ne pas les modifier.

**Verify**: `npm run typecheck` → exit 0

### Step 3: Garde `hass` dans `_getRoomsConfig`

En tête de `_getRoomsConfig()`, avant `const config = ...` :

```ts
if (!this.hass) return undefined;
```

**Verify**: `npm run typecheck && npm run lint && npm run format:check` → exit 0

### Step 4: Tests

Voir « Test plan », puis :

**Verify**: `npm test && CHROMIUM_BIN=/usr/bin/chromium npm run test:browser` → verts.

## Test plan

Dans la suite navigateur (les fixtures `mountCard`/`makeHass`/`until` sont dans
`test-browser/fixtures/hass.ts` ; suivre la structure de
`test-browser/card-mount.test.ts`) :

1. **Pas de crash sans hass** : `document.createElement("dreame-vacuum-card")`,
   `setConfig(makeCardConfig())`, `document.body.appendChild(card)`, **sans jamais
   assigner `card.hass`** ; attendre `card.updateComplete` → aucune exception, le
   shadow root existe. (Avant ce plan, ce scénario lève `TypeError` dans `render()`.)
2. **Arrêt des retries à la déconnexion** : monter une carte avec une config dont
   `map_modes` reste vide/invalide pour que `_initializeRooms` parte en retry (ou
   forcer `(card as any).modes = []` puis appeler `(card as any)._initializeRooms()`),
   retirer la carte du DOM (`card.remove()`), attendre ~1,2 s, et asserter que
   `(card as any)._initializeRoomsRetries` n'augmente plus entre deux mesures
   espacées de 600 ms.

Vérification : `npm run test:browser` vert avec 2 nouveaux tests.

## Done criteria

- [ ] `npm run typecheck`, `npm run lint`, `npm run format:check` → exit 0
- [ ] `npm test` exit 0 ; `CHROMIUM_BIN=/usr/bin/chromium npm run test:browser` exit 0
      avec les 2 nouveaux tests
- [ ] `grep -n "if (!this.connected) return;" src/dreame-vacuum-card.ts` → 1 occurrence
      dans `_initializeRooms`
- [ ] `grep -n "if (!this.hass)" src/dreame-vacuum-card.ts` → présent dans `render()`
      et `_getRoomsConfig`
- [ ] Aucun fichier hors scope modifié (`git status`)
- [ ] Ligne de statut mise à jour dans `plans/README.md`

## STOP conditions

- Les extraits « Current state » ne correspondent plus au code (drift).
- Le test 1 (carte sans hass) échoue **encore après** l'ajout de la garde — cela
  signifierait qu'un autre chemin déréférence `hass` en amont de `render()` ;
  rapporter la stack au lieu de patcher au hasard.
- Un test navigateur existant casse suite à la garde `render()` (une suite
  s'appuierait sur un rendu partiel sans hass) — rapporter lequel.

## Maintenance notes

- Tout nouveau timer/chaîne asynchrone dans ce composant doit vérifier
  `this.connected` (ou être annulé dans `disconnectedCallback`) — point de vigilance
  reviewer.
- Le plan 014 (découpage du god file) déplacera peut-être `_initializeRooms` ; la
  garde doit suivre le code déplacé.
