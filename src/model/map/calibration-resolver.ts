import { CalibrationPoint, CardPresetConfig } from "../../types/types";
import { HomeAssistantFixed } from "../../types/fixes";
import { PlatformGenerator } from "../generators/platform-generator";

/**
 * Résout les points de calibration d'un preset selon ses 6 sources possibles
 * (identity / points explicites / entity+JSON / entity+attribute / camera /
 * plateforme). Fonction pure : aucune dépendance à un composant, seulement
 * `config` et `hass`.
 *
 * Comportement figé (voir `test-browser/calibration-fallback.test.ts`) : les
 * branches "entity" dégradées (état "unknown", JSON invalide) ne jettent jamais,
 * elles retournent `undefined` via un `catch`.
 */
export function resolveCalibration(
    config: CardPresetConfig,
    hass: HomeAssistantFixed | undefined
): CalibrationPoint[] | undefined {
    if (config.calibration_source?.identity) {
        return [
            { map: { x: 0, y: 0 }, vacuum: { x: 0, y: 0 } },
            { map: { x: 1, y: 0 }, vacuum: { x: 1, y: 0 } },
            { map: { x: 0, y: 1 }, vacuum: { x: 0, y: 1 } },
        ];
    }
    if (
        config.calibration_source?.calibration_points &&
        [3, 4].includes(config.calibration_source.calibration_points.length)
    ) {
        return config.calibration_source.calibration_points;
    }
    if (!hass) {
        return undefined;
    }
    if (config.calibration_source?.entity && !config.calibration_source?.attribute) {
        try {
            const state = hass.states[config.calibration_source.entity]?.state;
            if (!state || state === "unavailable" || state === "unknown") return undefined;
            return JSON.parse(state);
        } catch {
            return undefined;
        }
    }
    if (config.calibration_source?.entity && config.calibration_source?.attribute) {
        return hass.states[config.calibration_source.entity]?.attributes[config.calibration_source.attribute];
    }
    if (config.calibration_source?.camera) {
        return hass.states[config.map_source?.camera ?? ""]?.attributes["calibration_points"];
    }
    if (config.calibration_source?.platform) {
        return PlatformGenerator.getCalibration(config.calibration_source.platform);
    }
    const platformCalibration = PlatformGenerator.getCalibration(config.vacuum_platform);
    if (platformCalibration) {
        return platformCalibration;
    }
    return undefined;
}
