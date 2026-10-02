import { describe, it, expect } from "vitest";
import type { HomeAssistantFixed } from "../src/types/fixes";
import type { DreameVacuumCardConfig } from "../src/types/types";
import { findMapCameraOnDevice, needsAutoMapSource, withAutoMapSource } from "../src/utils/auto-map-source";

const VACUUM = "vacuum.top_floor_master";

/** Registre d'entités d'un robot dreame_vacuum réel : entity_id de la caméra non
 *  déductible de celui du vacuum, plusieurs caméras sur le même device. */
function makeHass(entities: Record<string, Record<string, unknown>> = {}): HomeAssistantFixed {
    const registry: Record<string, unknown> = {
        [VACUUM]: { entity_id: VACUUM, device_id: "dev1", platform: "dreame_vacuum" },
    };
    for (const [id, entry] of Object.entries(entities)) {
        registry[id] = { entity_id: id, platform: "dreame_vacuum", ...entry };
    }
    return { states: {}, entities: registry } as unknown as HomeAssistantFixed;
}

const DREAME_CAMERAS = {
    "camera.top_floor_x50_master_map_data": { device_id: "dev1", translation_key: "current_map_data" },
    "camera.top_floor_x50_master_map_1": { device_id: "dev1", translation_key: "saved_map_named" },
    "camera.top_floor_x50_master_wifi_map": { device_id: "dev1", translation_key: "current_wifi_map" },
    "camera.top_floor_x50_master_map": { device_id: "dev1", translation_key: "current_map" },
    "camera.other_robot_map": { device_id: "dev2", translation_key: "current_map" },
};

function config(overrides: Partial<DreameVacuumCardConfig> = {}): DreameVacuumCardConfig {
    return { type: "custom:dreame-vacuum-card", entity: VACUUM, ...overrides } as DreameVacuumCardConfig;
}

describe("findMapCameraOnDevice", () => {
    it("picks the current map camera of the vacuum's device by translation_key", () => {
        expect(findMapCameraOnDevice(makeHass(DREAME_CAMERAS), VACUUM)).toBe("camera.top_floor_x50_master_map");
    });

    it("falls back to an entity id ending in _map when no translation_key is exposed", () => {
        const hass = makeHass({
            "camera.robot_wifi_map": { device_id: "dev1" },
            "camera.robot_map_data": { device_id: "dev1" },
            "camera.robot_map": { device_id: "dev1" },
        });
        expect(findMapCameraOnDevice(hass, VACUUM)).toBe("camera.robot_map");
    });

    it("returns undefined without a matching camera on the same device", () => {
        expect(findMapCameraOnDevice(makeHass({ "camera.other_robot_map": { device_id: "dev2" } }), VACUUM)).toBe(
            undefined
        );
    });

    it("returns undefined when the vacuum has no device in the registry", () => {
        const hass = { states: {}, entities: {} } as unknown as HomeAssistantFixed;
        expect(findMapCameraOnDevice(hass, VACUUM)).toBeUndefined();
    });
});

describe("withAutoMapSource", () => {
    it("keeps an explicit camera untouched", () => {
        const cfg = config({ map_source: { camera: "camera.explicit" } });
        expect(withAutoMapSource(cfg, makeHass(DREAME_CAMERAS))).toBe(cfg);
    });

    it("keeps an explicit image untouched", () => {
        const cfg = config({ map_source: { image: "/local/map.png" } });
        expect(withAutoMapSource(cfg, makeHass(DREAME_CAMERAS))).toBe(cfg);
    });

    it("fills map_source.camera and its camera calibration for a minimal { type, entity } config", () => {
        const resolved = withAutoMapSource(config(), makeHass(DREAME_CAMERAS));
        expect(resolved.map_source).toEqual({ camera: "camera.top_floor_x50_master_map" });
        expect(resolved.calibration_source).toEqual({ camera: true });
    });

    it("keeps an explicit calibration_source", () => {
        const calibration_source = { entity: "sensor.calibration" };
        const resolved = withAutoMapSource(config({ calibration_source }), makeHass(DREAME_CAMERAS));
        expect(resolved.calibration_source).toBe(calibration_source);
    });

    it("fills an empty camera (visual editor) and keeps the other map_source keys", () => {
        const crop = { top: 10 };
        const cfg = config({ map_source: { camera: "", crop } });
        expect(withAutoMapSource(cfg, makeHass(DREAME_CAMERAS)).map_source).toEqual({
            camera: "camera.top_floor_x50_master_map",
            crop,
        });
    });

    it("returns the config unchanged without hass or without a camera found", () => {
        const cfg = config();
        expect(withAutoMapSource(cfg, undefined)).toBe(cfg);
        expect(withAutoMapSource(cfg, makeHass())).toBe(cfg);
        expect(needsAutoMapSource(cfg)).toBe(true);
    });
});
