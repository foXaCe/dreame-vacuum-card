import { describe, it, expect } from "vitest";
import { resolveCalibration } from "../src/model/map/calibration-resolver";
import type { HomeAssistantFixed } from "../src/types/fixes";
import type { CardPresetConfig } from "../src/types/types";

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 3 points -> mode AFFINE, vacuum = map x 10 (mêmes valeurs que les fixtures navigateur). */
const CALIBRATION_POINTS = [
    { map: { x: 0, y: 0 }, vacuum: { x: 0, y: 0 } },
    { map: { x: 100, y: 0 }, vacuum: { x: 1000, y: 0 } },
    { map: { x: 0, y: 100 }, vacuum: { x: 0, y: 1000 } },
];

function makeConfig(overrides: Partial<CardPresetConfig> = {}): CardPresetConfig {
    return {
        entity: "vacuum.test",
        map_source: { camera: "camera.test" },
        ...overrides,
    } as unknown as CardPresetConfig;
}

function makeHass(overrides: Partial<HomeAssistantFixed> = {}): HomeAssistantFixed {
    return {
        states: {},
        entities: {},
        locale: { language: "en" },
        localize: () => "",
        ...overrides,
    } as unknown as HomeAssistantFixed;
}

describe("resolveCalibration", () => {
    it("identity: true -> 3 points triviaux, sans dépendre de hass", () => {
        const config = makeConfig({ calibration_source: { identity: true } });
        expect(resolveCalibration(config, undefined)).toEqual([
            { map: { x: 0, y: 0 }, vacuum: { x: 0, y: 0 } },
            { map: { x: 1, y: 0 }, vacuum: { x: 1, y: 0 } },
            { map: { x: 0, y: 1 }, vacuum: { x: 0, y: 1 } },
        ]);
    });

    it("calibration_points explicites (3 points) -> renvoyés tels quels", () => {
        const config = makeConfig({ calibration_source: { calibration_points: CALIBRATION_POINTS } });
        expect(resolveCalibration(config, undefined)).toBe(CALIBRATION_POINTS);
    });

    it("calibration_points explicites (4 points) -> renvoyés tels quels", () => {
        const fourPoints = [...CALIBRATION_POINTS, { map: { x: 50, y: 50 }, vacuum: { x: 500, y: 500 } }];
        const config = makeConfig({ calibration_source: { calibration_points: fourPoints } });
        expect(resolveCalibration(config, undefined)).toBe(fourPoints);
    });

    it("calibration_points avec une longueur invalide (2 points) -> ignorés, retombe plus loin", () => {
        const twoPoints = CALIBRATION_POINTS.slice(0, 2);
        const config = makeConfig({ calibration_source: { calibration_points: twoPoints } });
        // hass indéfini + pas d'autre source -> undefined (pas les 2 points invalides)
        expect(resolveCalibration(config, undefined)).toBeUndefined();
    });

    it("hass === undefined et aucune source directe (identity/points) -> undefined", () => {
        const config = makeConfig({ calibration_source: { entity: "sensor.cal" } });
        expect(resolveCalibration(config, undefined)).toBeUndefined();
    });

    it("entity + JSON valide -> parse et renvoie les points", () => {
        const config = makeConfig({ calibration_source: { entity: "sensor.cal" } });
        const hass = makeHass({
            states: { "sensor.cal": { state: JSON.stringify(CALIBRATION_POINTS) } } as any,
        });
        expect(resolveCalibration(config, hass)).toEqual(CALIBRATION_POINTS);
    });

    it('entity + état "unknown" -> undefined (pas d\'exception)', () => {
        const config = makeConfig({ calibration_source: { entity: "sensor.cal" } });
        const hass = makeHass({ states: { "sensor.cal": { state: "unknown" } } as any });
        expect(resolveCalibration(config, hass)).toBeUndefined();
    });

    it('entity + état "unavailable" -> undefined', () => {
        const config = makeConfig({ calibration_source: { entity: "sensor.cal" } });
        const hass = makeHass({ states: { "sensor.cal": { state: "unavailable" } } as any });
        expect(resolveCalibration(config, hass)).toBeUndefined();
    });

    it("entity + JSON tronqué -> undefined via catch (pas d'exception)", () => {
        const config = makeConfig({ calibration_source: { entity: "sensor.cal" } });
        const hass = makeHass({ states: { "sensor.cal": { state: "{invalid json" } } as any });
        expect(() => resolveCalibration(config, hass)).not.toThrow();
        expect(resolveCalibration(config, hass)).toBeUndefined();
    });

    it("entity absent de hass.states -> undefined (pas d'exception)", () => {
        const config = makeConfig({ calibration_source: { entity: "sensor.absent" } });
        const hass = makeHass({ states: {} as any });
        expect(resolveCalibration(config, hass)).toBeUndefined();
    });

    it("entity + attribute -> lit l'attribut de l'entité", () => {
        const config = makeConfig({ calibration_source: { entity: "sensor.cal", attribute: "points" } });
        const hass = makeHass({
            states: { "sensor.cal": { state: "ok", attributes: { points: CALIBRATION_POINTS } } } as any,
        });
        expect(resolveCalibration(config, hass)).toEqual(CALIBRATION_POINTS);
    });

    it("entity + attribute absent -> undefined", () => {
        const config = makeConfig({ calibration_source: { entity: "sensor.cal", attribute: "missing" } });
        const hass = makeHass({
            states: { "sensor.cal": { state: "ok", attributes: {} } } as any,
        });
        expect(resolveCalibration(config, hass)).toBeUndefined();
    });

    it("camera -> lit calibration_points sur l'attribut de la caméra de map_source", () => {
        const config = makeConfig({
            map_source: { camera: "camera.vacuum" },
            calibration_source: { camera: true },
        });
        const hass = makeHass({
            states: {
                "camera.vacuum": { state: "idle", attributes: { calibration_points: CALIBRATION_POINTS } },
            } as any,
        });
        expect(resolveCalibration(config, hass)).toEqual(CALIBRATION_POINTS);
    });

    it("camera sans map_source.camera -> lit l'état vide '' -> undefined", () => {
        const config = makeConfig({
            map_source: {},
            calibration_source: { camera: true },
        });
        const hass = makeHass({ states: {} as any });
        expect(resolveCalibration(config, hass)).toBeUndefined();
    });

    it("platform explicite dans calibration_source -> délègue à PlatformGenerator", () => {
        const config = makeConfig({ calibration_source: { platform: "Dreame" } });
        const hass = makeHass();
        // Le template Dreame n'a pas de calibration_points -> undefined (comportement figé,
        // cf. test/platform-generator.test.ts).
        expect(resolveCalibration(config, hass)).toBeUndefined();
    });

    it("fallback plateforme via vacuum_platform quand aucune autre source -> undefined pour Dreame", () => {
        const config = makeConfig({ vacuum_platform: "Dreame" });
        const hass = makeHass();
        expect(resolveCalibration(config, hass)).toBeUndefined();
    });

    it("aucune source ni vacuum_platform -> undefined (fallback Dreame implicite)", () => {
        const config = makeConfig();
        const hass = makeHass();
        expect(resolveCalibration(config, hass)).toBeUndefined();
    });
});
