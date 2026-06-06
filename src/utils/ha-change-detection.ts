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
