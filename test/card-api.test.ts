import { describe, it, expect, beforeEach, vi } from "vitest";
import type { HomeAssistantFixed } from "../src/types/fixes";
import type { XiaomiVacuumMapCardConfig } from "../src/types/types";
import { CARD_CUSTOM_ELEMENT_NAME } from "../src/const";
import { PlatformGenerator } from "../src/model/generators/platform-generator";

// lottie-web touches a canvas 2D context at import time, which happy-dom does not
// implement. dreame-vacuum-card.ts imports "./components/robot-animation" (among many
// other modules), so it transitively needs the same defensive mock used by the other
// test files that pull in the full component tree. We assert the card's public API,
// not lottie itself.
vi.mock("lottie-web/build/player/lottie_light", () => ({
    default: {
        loadAnimation: vi.fn(() => ({ destroy: vi.fn() })),
    },
}));

// Importing the module registers the custom element AND pushes the window.customCards
// entry as a side effect (top-level code in dreame-vacuum-card.ts).
import { XiaomiVacuumMapCard } from "../src/dreame-vacuum-card";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeHass(overrides: Partial<HomeAssistantFixed> = {}): HomeAssistantFixed {
    return {
        states: {},
        entities: {},
        locale: { language: "en" },
        localize: () => "",
        ...overrides,
    } as unknown as HomeAssistantFixed;
}

/** NOTE : `new XiaomiVacuumMapCard()` évite le même piège d'upgrade happy-dom que celui
 *  documenté pour RobotAnimation dans components-extra.test.ts — construction directe,
 *  sans passer par `document.createElement` + connexion au DOM (non nécessaire pour ces
 *  tests d'API pure, aucun d'eux n'a besoin d'un rendu). */
function makeCard(): XiaomiVacuumMapCard {
    return new XiaomiVacuumMapCard();
}

/** Config utilisateur réelle, telle qu'elle existe en prod (non-régression YAML). */
function prodConfig(overrides: Partial<XiaomiVacuumMapCardConfig> = {}): XiaomiVacuumMapCardConfig {
    return {
        type: "custom:dreame-vacuum-card",
        entity: "vacuum.a",
        map_source: { camera: "camera.b" },
        calibration_source: { camera: true },
        vacuum_platform: "Dreame",
        show_title: false,
        map_locked: false,
        two_finger_pan: false,
        clean_selection_on_start: true,
        robot_overlay: false,
        ...overrides,
    } as XiaomiVacuumMapCardConfig;
}

beforeEach(() => {
    document.body.innerHTML = "";
});

// ===========================================================================
// Sections view / layout API
// ===========================================================================

describe("XiaomiVacuumMapCard layout API", () => {
    it("getGridOptions returns a full-width, content-driven Sections view config", () => {
        const card = makeCard();
        const options = card.getGridOptions();
        expect(options.columns).toBe(12);
        expect(options.columns % 3).toBe(0);
        // "auto" (string, not a number) : la carte est content-driven, un nombre fixe
        // clipperait la map via .fit-rows (ha-card en overflow:hidden).
        expect(options.rows).toBe("auto");
        expect(typeof options.rows).toBe("string");
        expect(options.min_columns).toBe(6);
        expect(options.max_columns).toBe(12);
        expect(options.min_rows).toBeDefined();
        expect(options.max_rows).toBeDefined();
    });

    it("getLayoutOptions exposes the legacy fallback for HA < 2024.10", () => {
        const card = makeCard();
        const options = card.getLayoutOptions();
        expect(options).toEqual({
            grid_columns: 4,
            grid_min_columns: 2,
            grid_rows: 10,
            grid_min_rows: 6,
        });
    });

    it("getCardSize returns a number", () => {
        const card = makeCard();
        expect(typeof card.getCardSize()).toBe("number");
    });
});

// ===========================================================================
// getStubConfig
// ===========================================================================

describe("XiaomiVacuumMapCard.getStubConfig", () => {
    const VACUUM = "vacuum.y";
    const CAMERA = "camera.x";

    it("returns undefined when there is no vacuum entity", () => {
        const hass = makeHass({
            states: { [CAMERA]: { entity_id: CAMERA, state: "idle", attributes: {} } } as never,
        });
        expect(XiaomiVacuumMapCard.getStubConfig(hass)).toBeUndefined();
    });

    it("returns undefined when there is no camera/image entity", () => {
        const hass = makeHass({
            states: { [VACUUM]: { entity_id: VACUUM, state: "docked", attributes: {} } } as never,
        });
        expect(XiaomiVacuumMapCard.getStubConfig(hass)).toBeUndefined();
    });

    it("builds a config from a calibrated camera + vacuum sharing the same device_id", () => {
        const hass = makeHass({
            states: {
                [CAMERA]: {
                    entity_id: CAMERA,
                    state: "idle",
                    attributes: { calibration_points: [{}, {}, {}] },
                } as never,
                [VACUUM]: { entity_id: VACUUM, state: "docked", attributes: {} } as never,
            },
            entities: {
                [CAMERA]: { device_id: "dev1" },
                [VACUUM]: { device_id: "dev1" },
            } as never,
        });
        const config = XiaomiVacuumMapCard.getStubConfig(hass);
        expect(config).toEqual({
            type: "custom:" + CARD_CUSTOM_ELEMENT_NAME,
            entity: VACUUM,
            map_source: { camera: CAMERA },
            calibration_source: { camera: true },
            vacuum_platform: PlatformGenerator.TASSHACK_DREAME_VACUUM_PLATFORM,
        });
    });

    it("matches camera <-> vacuum by device_id in priority over the first available pair", () => {
        const hass = makeHass({
            states: {
                // Caméra non calibrée, listée en premier : ne doit PAS être choisie.
                "camera.other": { entity_id: "camera.other", state: "idle", attributes: {} } as never,
                // Caméra calibrée : préférée par `calibrated[0] ?? cameras[0]`.
                [CAMERA]: {
                    entity_id: CAMERA,
                    state: "idle",
                    attributes: { calibration_points: [{}, {}, {}] },
                } as never,
                // Vacuum sur un autre device : candidat par défaut (vacuums[0]) mais écarté.
                "vacuum.other": { entity_id: "vacuum.other", state: "docked", attributes: {} } as never,
                // Vacuum partageant le device_id de la caméra calibrée : doit gagner.
                [VACUUM]: { entity_id: VACUUM, state: "docked", attributes: {} } as never,
            },
            entities: {
                "camera.other": { device_id: "devA" },
                [CAMERA]: { device_id: "devB" },
                "vacuum.other": { device_id: "devC" },
                [VACUUM]: { device_id: "devB" },
            } as never,
        });
        const config = XiaomiVacuumMapCard.getStubConfig(hass);
        expect(config?.entity).toBe(VACUUM);
        expect(config?.map_source.camera).toBe(CAMERA);
        expect(config?.calibration_source).toEqual({ camera: true });
        expect(config?.vacuum_platform).toBe("Dreame");
    });
});

// ===========================================================================
// window.customCards registration
// ===========================================================================

describe("window.customCards registration", () => {
    it("registers the card in the HA card picker with an entity suggestion hook", () => {
        const cards = (window as unknown as { customCards: Array<Record<string, unknown>> }).customCards;
        const entry = cards.find((c) => c.type === "dreame-vacuum-card");
        expect(entry).toBeDefined();
        expect(entry?.name).toBe("Dreame Vacuum Card");
        expect(entry?.preview).toBe(true);
        expect(typeof entry?.documentationURL).toBe("string");
        expect(typeof entry?.getEntitySuggestion).toBe("function");
    });
});

// ===========================================================================
// setConfig
// ===========================================================================

describe("XiaomiVacuumMapCard.setConfig", () => {
    it("throws when config is null", () => {
        const card = makeCard();
        expect(() => card.setConfig(null as unknown as XiaomiVacuumMapCardConfig)).toThrow();
    });

    it("throws when config is undefined", () => {
        const card = makeCard();
        expect(() => card.setConfig(undefined as unknown as XiaomiVacuumMapCardConfig)).toThrow();
    });

    it("accepts the real production YAML config without throwing (backwards-compat)", () => {
        const card = makeCard();
        expect(() => card.setConfig(prodConfig())).not.toThrow();
        // La config passe la validation complète : aucune erreur détectée.
        expect((card as unknown as { configErrors: string[] }).configErrors).toEqual([]);
    });

    it("accepts appearance: 'minimal'", () => {
        const card = makeCard();
        expect(() => card.setConfig(prodConfig({ appearance: "minimal" }))).not.toThrow();
        expect((card as unknown as { configErrors: string[] }).configErrors).toEqual([]);
    });
});
