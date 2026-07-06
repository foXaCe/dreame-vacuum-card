# Plan 007: Durcissements mineurs — allowlist d'URL et conditions à valeur vide

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat cf8701f..HEAD -- src/ha/index.ts src/utils/conditions.ts`
> On a mismatch with the "Current state" excerpts, STOP.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: security (A) + bug (B)
- **Planned at**: commit `cf8701f`, 2026-07-06

## Why this matters

Deux petits correctifs indépendants regroupés :

**A — Filtre d'URL contournable.** L'action `url` (tap/hold/double_tap sur la carte)
refuse `javascript:` par une regex blacklist. Les navigateurs suppriment les
caractères de contrôle (tab, CR, LF) d'une URL avant d'en déterminer le schéma
(normalisation WHATWG) : `java\tscript:...` contourne la regex tout en restant un
schéma `javascript:` pour le moteur. La config YAML est écrite par l'admin du
dashboard, donc la sévérité est basse (défense en profondeur contre le YAML copié
depuis des forums), mais le fix — allowlist au lieu de blacklist — est trivial et
strictement plus sûr.

**B — Condition à valeur vide ignorée.** `isConditionMet` teste `if (condition.value)`
(truthy) au lieu de `!== undefined` : une condition configurée `value: ""` (matcher
un état/attribut légitimement vide) ne matche jamais et retombe silencieusement sur
`false`. Bug de frontière difficile à diagnostiquer côté utilisateur.

## Current state

- **A** — `src/ha/index.ts:232-239` :

  ```ts
  case "url": {
      const cfg = actionConfig as UrlActionConfig;
      // Refuse le schéma javascript: (XSS) et ouvre sans accès `window.opener` (noopener).
      if (cfg.url_path && !/^\s*javascript:/i.test(cfg.url_path)) {
          window.open(cfg.url_path, "_blank", "noopener");
      }
      break;
  }
  ```

- **B** — `src/utils/conditions.ts:17-23` :

  ```ts
  if (condition.value) {
      return String(currentValue) === String(condition.value);
  }
  if (condition.value_not) {
      return String(currentValue) !== String(condition.value_not);
  }
  return false;
  ```

  Types : `src/types/types.ts:181-182` — `value?: string; value_not?: string;`
  (la chaîne vide est une valeur légale).

- Tests existants : `test/ha.test.ts` (couvre `handleAction`) et
  `test/utils-conditions.test.ts` (couvre `isConditionMet`) — suivre leurs patterns.

## Commands you will need

| Purpose   | Command | Expected on success |
|-----------|---------|---------------------|
| Typecheck / lint / format | `npm run typecheck && npm run lint && npm run format:check` | exit 0 |
| Tests unitaires | `npm test` | tous verts |

## Scope

**In scope**:
- `src/ha/index.ts` (uniquement le `case "url"`)
- `src/utils/conditions.ts` (uniquement `isConditionMet`)
- `test/ha.test.ts`, `test/utils-conditions.test.ts`

**Out of scope**:
- Les autres branches de `handleAction` (`navigate`, `call-service`, …).
- `areConditionsMet` (elle délègue, rien à changer).

## Git workflow

- Ne committe pas et ne pousse pas : l'utilisateur contrôle git.

## Steps

### Step 1: Allowlist d'URL

> **Note de revue (2026-07-06)** : implémentation finale retenue SANS la regex de
> pré-nettoyage ci-dessous — `new URL()` applique déjà la normalisation WHATWG
> (strip tab/CR/LF, casse du schéma), identique à celle du navigateur au moment du
> `window.open`, donc valider `resolved.protocol` sur la chaîne brute suffit et
> évite tout risque de corrompre une URL légitime. Garde `if (!raw) break;` pour
> préserver le comportement historique « url_path vide → ne rien ouvrir ».

Remplacer le corps du `case "url"` par une validation par allowlist (commentaire en
français, style du fichier) :

```ts
case "url": {
    const cfg = actionConfig as UrlActionConfig;
    // Allowlist de schémas (http/https + chemins relatifs) : plus sûr qu'une
    // blacklist de `javascript:` — les navigateurs strippent les caractères de
    // contrôle avant de résoudre le schéma, ce qui contournait la regex.
    const raw = (cfg.url_path ?? "").replace(/[\u0000-\u001F\u007F]/g, "");
    let allowed = false;
    try {
        const resolved = new URL(raw, window.location.href);
        allowed = resolved.protocol === "http:" || resolved.protocol === "https:";
    } catch {
        allowed = false;
    }
    if (allowed) {
        window.open(raw, "_blank", "noopener");
    }
    break;
}
```

Changement de comportement assumé : les schémas non-http(s) (`mailto:`, `tel:`, …)
sont désormais refusés. Aucun usage documenté dans le README/docs ne s'en sert.

**Verify**: `npm run typecheck` → exit 0

### Step 2: Conditions `!== undefined`

Dans `isConditionMet`, remplacer les deux tests truthy :

```ts
if (condition.value !== undefined) {
    return String(currentValue) === String(condition.value);
}
if (condition.value_not !== undefined) {
    return String(currentValue) !== String(condition.value_not);
}
return false;
```

**Verify**: `npm run typecheck && npm run lint && npm run format:check` → exit 0

### Step 3: Tests

Voir « Test plan », puis :

**Verify**: `npm test` → verts, nouveaux tests inclus.

## Test plan

- `test/ha.test.ts` (suivre les tests `handleAction` existants ; spy sur
  `window.open`) :
  - `url_path: "https://example.com"` → `window.open` appelé.
  - `url_path: "/local/dashboard"` (relatif) → appelé.
  - `url_path: "javascript:alert(1)"` → PAS appelé.
  - `url_path: "java\tscript:alert(1)"` (contournement contrôle) → PAS appelé.
  - `url_path: "JaVaScRiPt:alert(1)"` → PAS appelé.
  - `url_path: "mailto:x@y.z"` → PAS appelé (nouveau comportement, documenté).
- `test/utils-conditions.test.ts` :
  - `{ entity, value: "" }` avec état `""` → `true` (le bug corrigé).
  - `{ entity, value: "" }` avec état `"on"` → `false`.
  - `{ entity, value_not: "" }` avec état `"on"` → `true` ; avec état `""` → `false`.
  - Non-régression : `value: "0"`, `value_not: "off"` inchangés.
- Vérification : `npm test` vert, ≥10 nouveaux cas.

## Done criteria

- [ ] `npm run typecheck && npm run lint && npm run format:check` → exit 0
- [ ] `npm test` exit 0 avec les nouveaux tests
- [ ] `grep -n "javascript:" src/ha/index.ts` → plus aucune regex blacklist (le mot
      ne survit que dans un commentaire éventuel)
- [ ] `grep -n "!== undefined" src/utils/conditions.ts` → 2 occurrences
- [ ] Aucun fichier hors scope modifié (`git status`)
- [ ] Ligne de statut mise à jour dans `plans/README.md`

## STOP conditions

- Les extraits ne correspondent plus (drift).
- Un test existant de `test/ha.test.ts` couvre un schéma non-http(s) comme
  comportement ATTENDU (ex. `mailto:`) → conflit de spécification, rapporter au lieu
  de casser le test.
- `new URL()` indisponible/défaillant dans happy-dom pour les chemins relatifs →
  rapporter le message exact.

## Maintenance notes

- Si un utilisateur demande un jour le support `mailto:`/`tel:` dans `url_path`,
  étendre l'allowlist explicitement (une ligne) — ne pas revenir à une blacklist.
- Précédence `value` sur `value_not` : une config posant les deux à la fois voit
  `value` gagner (comportement historique conservé).
