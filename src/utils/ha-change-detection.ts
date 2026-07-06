import { PropertyValues } from "lit";

import { HomeAssistantFixed } from "../types/fixes";

/** Compare la version HA courante (`hass.config.version`, ex. "2024.10.3") à un seuil
 *  "MAJOR.MINOR" et retourne true si HA est plus récent ou égal.
 *  Utile pour activer une fonctionnalité conditionnellement (selectors avancés,
 *  champs UI 2024.10+, etc.) sans casser sur les anciennes versions HA. */
export function isHaVersionAtLeast(hass: HomeAssistantFixed | undefined, target: `${number}.${number}`): boolean {
    const version = hass?.config?.version;
    if (typeof version !== "string") return false;
    const [hMajor, hMinor] = version.split(".").map((n) => parseInt(n, 10));
    const [tMajor, tMinor] = target.split(".").map((n) => parseInt(n, 10));
    if (Number.isNaN(hMajor) || Number.isNaN(hMinor)) return false;
    if (hMajor !== tMajor) return hMajor > tMajor;
    return hMinor >= tMinor;
}

export function hasConfigOrAnyEntityChanged(
    watchedEntities: string[],
    changedProps: PropertyValues,
    forceUpdate: boolean,
    hass?: HomeAssistantFixed
): boolean {
    if (changedProps.has("config") || forceUpdate) {
        return true;
    }
    const oldHass = changedProps.get("_hass") as HomeAssistantFixed | undefined;
    const entitesChanged =
        !oldHass || watchedEntities.some((entity) => oldHass.states[entity] !== hass?.states[entity]);
    if (entitesChanged) return true;
    const changedKeys = Array.from(changedProps.keys());
    return changedKeys.length > 1 || (changedKeys.length === 1 && changedKeys[0] !== "_hass");
}

export function checkIfEntitiesChanged(
    entities: string[],
    oldHass: HomeAssistantFixed,
    newHass: HomeAssistantFixed
): boolean {
    const changedEntities = entities.filter((entity) => oldHass.states[entity] !== newHass.states[entity]);
    return changedEntities.length > 0;
}

/** shouldUpdate pour un composant feuille qui ne lit que quelques entités de `hass` :
 *  si SEUL `hass` a changé, ne re-rendre que si l'une des entités listées a changé
 *  de référence. Tout autre changement de propriété force le rendu. */
export function shouldUpdateForEntities(
    changedProps: PropertyValues,
    newHass: HomeAssistantFixed | undefined,
    entityIds: (string | null | undefined)[]
): boolean {
    const keys = Array.from(changedProps.keys());
    if (!(keys.length === 1 && keys[0] === "hass")) return true;
    const oldHass = changedProps.get("hass") as HomeAssistantFixed | undefined;
    if (!oldHass || !newHass) return true;
    return entityIds.some((id) => !!id && oldHass.states[id] !== newHass.states[id]);
}
