import { describe, it, expect } from "vitest";
import type { HomeAssistantFixed } from "../src/types/fixes";
import { buildSuggestedConfig, findCameraForVacuum, suggestForEntity } from "../src/utils/suggestion";
import { CARD_CUSTOM_ELEMENT_NAME } from "../src/const";
import { PlatformGenerator } from "../src/model/generators/platform-generator";

/** Minimal hass mock — only `states` / `entities` are read by the suggestion logic. */
function makeHass(overrides: Partial<HomeAssistantFixed> = {}): HomeAssistantFixed {
    return {
        states: {},
        entities: {},
        ...overrides,
    } as unknown as HomeAssistantFixed;
}

const VACUUM = "vacuum.robot";
const CAMERA = "camera.robot_map";
const IMAGE = "image.robot_map";

describe("findCameraForVacuum", () => {
    it("returns undefined when no camera/image entity exists", () => {
        const hass = makeHass({
            states: { [VACUUM]: { entity_id: VACUUM, state: "docked", attributes: {} } } as never,
        });
        expect(findCameraForVacuum(hass, VACUUM)).toBeUndefined();
    });

    it("prefers a camera on the same device as the vacuum (multi-robot setups)", () => {
        const hass = makeHass({
            states: {
                [VACUUM]: { entity_id: VACUUM, state: "docked", attributes: {} },
                "camera.other": { entity_id: "camera.other", state: "idle", attributes: {} },
                [CAMERA]: { entity_id: CAMERA, state: "idle", attributes: {} },
            } as never,
            entities: {
                [VACUUM]: { device_id: "dev1" },
                "camera.other": { device_id: "dev2" },
                [CAMERA]: { device_id: "dev1" },
            } as never,
        });
        expect(findCameraForVacuum(hass, VACUUM)).toBe(CAMERA);
    });

    it("falls back to a calibrated camera when none shares the device", () => {
        const hass = makeHass({
            states: {
                [VACUUM]: { entity_id: VACUUM, state: "docked", attributes: {} },
                "camera.plain": { entity_id: "camera.plain", state: "idle", attributes: {} },
                [CAMERA]: { entity_id: CAMERA, state: "idle", attributes: { calibration_points: [] } },
            } as never,
            entities: { [VACUUM]: { device_id: "dev1" } } as never,
        });
        expect(findCameraForVacuum(hass, VACUUM)).toBe(CAMERA);
    });

    it("falls back to the first camera when nothing matches device or calibration", () => {
        const hass = makeHass({
            states: {
                [VACUUM]: { entity_id: VACUUM, state: "docked", attributes: {} },
                "camera.plain": { entity_id: "camera.plain", state: "idle", attributes: {} },
            } as never,
            entities: { [VACUUM]: { device_id: "dev1" } } as never,
        });
        expect(findCameraForVacuum(hass, VACUUM)).toBe("camera.plain");
    });

    it("accepts image.* entities as a map source", () => {
        const hass = makeHass({
            states: {
                [VACUUM]: { entity_id: VACUUM, state: "docked", attributes: {} },
                [IMAGE]: { entity_id: IMAGE, state: "idle", attributes: {} },
            } as never,
        });
        expect(findCameraForVacuum(hass, VACUUM)).toBe(IMAGE);
    });
});

describe("buildSuggestedConfig", () => {
    it("builds a valid custom-card config for a camera + vacuum pair", () => {
        expect(buildSuggestedConfig(CAMERA, VACUUM)).toEqual({
            type: "custom:" + CARD_CUSTOM_ELEMENT_NAME,
            map_source: { camera: CAMERA },
            calibration_source: { camera: true },
            entity: VACUUM,
            vacuum_platform: PlatformGenerator.TASSHACK_DREAME_VACUUM_PLATFORM,
        });
    });
});

describe("suggestForEntity", () => {
    function hassWithPair(): HomeAssistantFixed {
        return makeHass({
            states: {
                [VACUUM]: { entity_id: VACUUM, state: "docked", attributes: {} },
                [CAMERA]: { entity_id: CAMERA, state: "idle", attributes: {} },
            } as never,
            entities: {
                [VACUUM]: { device_id: "dev1" },
                [CAMERA]: { device_id: "dev1" },
            } as never,
        });
    }

    it("returns null for a non-vacuum entity", () => {
        expect(suggestForEntity(hassWithPair(), "light.kitchen")).toBeNull();
    });

    it("returns null when the vacuum is not present in hass.states", () => {
        expect(suggestForEntity(hassWithPair(), "vacuum.absent")).toBeNull();
    });

    it("returns null when no camera/image source is available", () => {
        const hass = makeHass({
            states: { [VACUUM]: { entity_id: VACUUM, state: "docked", attributes: {} } } as never,
        });
        expect(suggestForEntity(hass, VACUUM)).toBeNull();
    });

    it("suggests the card with a full config for a vacuum that has a map source", () => {
        const suggestion = suggestForEntity(hassWithPair(), VACUUM);
        expect(suggestion).not.toBeNull();
        expect(suggestion?.config.type).toBe("custom:" + CARD_CUSTOM_ELEMENT_NAME);
        expect(suggestion?.config.entity).toBe(VACUUM);
        expect(suggestion?.config.map_source.camera).toBe(CAMERA);
    });
});
