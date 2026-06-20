import { CARD_CUSTOM_ELEMENT_NAME } from "../const";
import { PlatformGenerator } from "../model/generators/platform-generator";
import type { HomeAssistantFixed } from "../types/fixes";
import type { XiaomiVacuumMapCardConfig } from "../types/types";

/** Suggestion de carte renvoyée à Home Assistant pour le card picker (HA 2026.6+). */
export interface CardSuggestion {
    readonly label?: string;
    readonly config: XiaomiVacuumMapCardConfig;
}

/** Vrai si l'entité peut servir de source de carte (flux `camera` ou `image`). */
function isCameraLike(entityId: string): boolean {
    const domain = entityId.substring(0, entityId.indexOf("."));
    return domain === "camera" || domain === "image";
}

/**
 * Trouve la meilleure caméra/image servant de source de carte pour un vacuum donné.
 * Priorité : (1) une entité du même device que le vacuum (cas multi-robots),
 * (2) une caméra calibrée (`dreame_vacuum` / `xiaomi_miio` exposent `calibration_points`),
 * (3) à défaut, la première caméra/image disponible.
 * Renvoie `undefined` si aucune source de carte n'existe.
 */
export function findCameraForVacuum(hass: HomeAssistantFixed, vacuumId: string): string | undefined {
    const cameras = Object.keys(hass.states).filter(isCameraLike);
    if (cameras.length === 0) {
        return undefined;
    }
    const vacuumDeviceId = hass?.entities?.[vacuumId]?.device_id;
    if (vacuumDeviceId) {
        const sameDevice = cameras.find((c) => hass?.entities?.[c]?.device_id === vacuumDeviceId);
        if (sameDevice) {
            return sameDevice;
        }
    }
    const calibrated = cameras.find((c) => hass?.states[c]?.attributes?.["calibration_points"]);
    return calibrated ?? cameras[0];
}

/** Assemble une configuration minimale et valide pour un couple caméra + vacuum. */
export function buildSuggestedConfig(cameraId: string, vacuumId: string): XiaomiVacuumMapCardConfig {
    return {
        type: "custom:" + CARD_CUSTOM_ELEMENT_NAME,
        map_source: { camera: cameraId },
        calibration_source: { camera: true },
        entity: vacuumId,
        vacuum_platform: PlatformGenerator.TASSHACK_DREAME_VACUUM_PLATFORM,
    };
}

/**
 * Logique de `getEntitySuggestion` (HA 2026.6+) : propose la carte dans le card picker
 * uniquement pour une entité `vacuum.*` réellement présente ET disposant d'une source de
 * carte (caméra/image). Renvoie `null` dans tous les autres cas, pour ne pas encombrer le
 * picker avec une carte inexploitable.
 */
export function suggestForEntity(hass: HomeAssistantFixed, entityId: string): CardSuggestion | null {
    if (entityId.substring(0, entityId.indexOf(".")) !== "vacuum") {
        return null;
    }
    if (!hass.states[entityId]) {
        return null;
    }
    const camera = findCameraForVacuum(hass, entityId);
    if (!camera) {
        return null;
    }
    return { config: buildSuggestedConfig(camera, entityId) };
}
