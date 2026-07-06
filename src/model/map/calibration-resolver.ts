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
 * elles retournent `undefined` via un `catch`. Ce module ne fait AUCUNE différence
 * entre "pas de source configurée" et "source configurée mais en échec" — les deux
 * renvoient `undefined` ici. C'est le rôle de `isCalibrationSourceConfigured`
 * ci-dessous : l'appelant (`dreame-vacuum-card.ts` → `_updateCalibration`) l'utilise
 * pour signaler l'échec à `CoordinatesConverter` sans changer la valeur de retour de
 * `resolveCalibration` elle-même (contrat inchangé, voir `test/map-calibration-resolver.test.ts`).
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

/**
 * Indique si le preset a explicitement demandé une source de calibration (entité,
 * caméra, plateforme ou points bruts). Sert à distinguer, quand `resolveCalibration`
 * renvoie `undefined`, un ÉCHEC de résolution (source configurée mais qui n'a produit
 * aucun point exploitable — entité "unknown"/"unavailable", JSON invalide, attribut
 * absent, caméra sans `calibration_points`…) d'une absence de besoin de calibration
 * (aucune source demandée : plateforme fonctionnant nativement en identité) — voir
 * §3.2 du contrat carte↔intégration.
 *
 * `identity: true` n'est jamais concerné par cette distinction : cette branche renvoie
 * toujours des points triviaux valides, jamais `undefined`.
 */
export function isCalibrationSourceConfigured(config: CardPresetConfig): boolean {
    const source = config.calibration_source;
    return !!(source?.entity || source?.camera || source?.platform || source?.calibration_points);
}
