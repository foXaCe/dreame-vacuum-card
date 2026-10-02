import type { HomeAssistantFixed } from "../types/fixes";
import type { DreameVacuumCardConfig } from "../types/types";

/** `translation_key` de la caméra « carte courante » de dreame_vacuum — distincte de
 *  `current_map_data`, `current_wifi_map` et des cartes sauvegardées (`saved_map_*`). */
const MAIN_MAP_TRANSLATION_KEY = "current_map";

/** Vrai si la config ne désigne aucune source de carte (clé absente, ou `camera`/`image`
 *  vides — cas de l'éditeur visuel qui écrit `map_source: { camera: "" }`). */
export function needsAutoMapSource(config: DreameVacuumCardConfig): boolean {
    return !config.map_source?.camera && !config.map_source?.image;
}

/**
 * Caméra de carte principale portée par le même device que le vacuum, via le registre
 * d'entités (`hass.entities`) : les entity_id ne se déduisent pas de façon fiable l'un de
 * l'autre (ex. `vacuum.etage` ↔ `camera.etage_x50_map`). Priorité au `translation_key`
 * `current_map` ; à défaut (intégration plus ancienne), une caméra dont l'entity_id finit
 * par `_map` (hors `_wifi_map`). Renvoie `undefined` si rien d'univoque n'est trouvé.
 */
export function findMapCameraOnDevice(hass: HomeAssistantFixed, vacuumId: string): string | undefined {
    const deviceId = hass?.entities?.[vacuumId]?.device_id;
    if (!deviceId) {
        return undefined;
    }
    const cameras = Object.values(hass.entities).filter(
        (e) => e.device_id === deviceId && e.entity_id?.startsWith("camera.")
    );
    const main =
        cameras.find((e) => e.translation_key === MAIN_MAP_TRANSLATION_KEY) ??
        cameras.find((e) => e.entity_id.endsWith("_map") && !e.entity_id.endsWith("_wifi_map"));
    return main?.entity_id;
}

/**
 * Complète `map_source.camera` quand la config n'en fournit pas et que la caméra du
 * device du vacuum est trouvable. Une source explicite (`camera` ou `image`) gagne
 * toujours ; les autres clés de `map_source` (ex. `crop`) sont conservées. Sans
 * `calibration_source`, la calibration de cette caméra est utilisée (comme
 * `buildSuggestedConfig` et l'éditeur). Sans `hass` ou sans caméra trouvée, la config
 * est renvoyée telle quelle (la validation signale alors l'absence comme avant).
 */
export function withAutoMapSource(
    config: DreameVacuumCardConfig,
    hass: HomeAssistantFixed | undefined
): DreameVacuumCardConfig {
    if (!hass || !config.entity || !needsAutoMapSource(config)) {
        return config;
    }
    const camera = findMapCameraOnDevice(hass, config.entity);
    if (!camera) {
        return config;
    }
    return {
        ...config,
        map_source: { ...config.map_source, camera },
        calibration_source: config.calibration_source ?? { camera: true },
    };
}
