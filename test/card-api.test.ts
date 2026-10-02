import { describe, it, expect, beforeEach, vi } from "vitest";
import type { HomeAssistantFixed } from "../src/types/fixes";
import type { DreameVacuumCardConfig } from "../src/types/types";
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
import { DreameVacuumCard } from "../src/dreame-vacuum-card";

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

/** NOTE : `new DreameVacuumCard()` évite le même piège d'upgrade happy-dom que celui
 *  documenté pour RobotAnimation dans components-extra.test.ts — construction directe,
 *  sans passer par `document.createElement` + connexion au DOM (non nécessaire pour ces
 *  tests d'API pure, aucun d'eux n'a besoin d'un rendu). */
function makeCard(): DreameVacuumCard {
    return new DreameVacuumCard();
}

/** Config utilisateur réelle, telle qu'elle existe en prod (non-régression YAML). */
function prodConfig(overrides: Partial<DreameVacuumCardConfig> = {}): DreameVacuumCardConfig {
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
    } as DreameVacuumCardConfig;
}

beforeEach(() => {
    document.body.innerHTML = "";
});

// ===========================================================================
// Sections view / layout API
// ===========================================================================

describe("DreameVacuumCard layout API", () => {
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

describe("DreameVacuumCard.getStubConfig", () => {
    const VACUUM = "vacuum.y";
    const CAMERA = "camera.x";

    it("returns undefined when there is no vacuum entity", () => {
        const hass = makeHass({
            states: { [CAMERA]: { entity_id: CAMERA, state: "idle", attributes: {} } } as never,
        });
        expect(DreameVacuumCard.getStubConfig(hass)).toBeUndefined();
    });

    it("returns undefined when there is no camera/image entity", () => {
        const hass = makeHass({
            states: { [VACUUM]: { entity_id: VACUUM, state: "docked", attributes: {} } } as never,
        });
        expect(DreameVacuumCard.getStubConfig(hass)).toBeUndefined();
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
        const config = DreameVacuumCard.getStubConfig(hass);
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
        const config = DreameVacuumCard.getStubConfig(hass);
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

describe("DreameVacuumCard.setConfig", () => {
    it("throws when config is null", () => {
        const card = makeCard();
        expect(() => card.setConfig(null as unknown as DreameVacuumCardConfig)).toThrow();
    });

    it("throws when config is undefined", () => {
        const card = makeCard();
        expect(() => card.setConfig(undefined as unknown as DreameVacuumCardConfig)).toThrow();
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

// ===========================================================================
// map_source auto-détecté depuis le device du vacuum
// ===========================================================================

describe("DreameVacuumCard map_source auto-detection", () => {
    const MAP = "camera.top_floor_x50_master_map";

    function hassWithMap(): HomeAssistantFixed {
        return makeHass({
            states: {
                "vacuum.a": { entity_id: "vacuum.a", state: "docked", attributes: {} },
                [MAP]: { entity_id: MAP, state: "idle", attributes: {} },
                "camera.b": { entity_id: "camera.b", state: "idle", attributes: {} },
            } as never,
            entities: {
                "vacuum.a": { entity_id: "vacuum.a", device_id: "dev1" },
                [`${MAP}_data`]: { entity_id: `${MAP}_data`, device_id: "dev1", translation_key: "current_map_data" },
                [MAP]: { entity_id: MAP, device_id: "dev1", translation_key: "current_map" },
            } as never,
        });
    }

    type CardInternals = { configErrors: string[]; config: DreameVacuumCardConfig };
    const internals = (card: DreameVacuumCard) => card as unknown as CardInternals;
    const withoutMapSource = (): DreameVacuumCardConfig => {
        const { map_source: _omit, ...rest } = prodConfig();
        return rest as DreameVacuumCardConfig;
    };

    // NB : dans HA, setConfig précède toujours la première assignation de hass.
    it("an explicit map_source always wins", () => {
        const card = makeCard();
        card.setConfig(prodConfig());
        card.hass = hassWithMap();
        expect(internals(card).configErrors).toEqual([]);
        expect(internals(card).config.map_source.camera).toBe("camera.b");
    });

    it("derives the main map camera when map_source is missing (hass already set, e.g. editor preview)", () => {
        const card = makeCard();
        card.setConfig(prodConfig());
        card.hass = hassWithMap();
        card.setConfig(withoutMapSource());
        expect(internals(card).configErrors).toEqual([]);
        expect(internals(card).config.map_source.camera).toBe(MAP);
    });

    it("defers the derivation until hass is available (setConfig runs first)", () => {
        const card = makeCard();
        card.setConfig(withoutMapSource());
        // Pas d'erreur affichée avant hass : la carte ne rend rien tant que hass manque.
        expect(internals(card).configErrors).toEqual([]);
        card.hass = hassWithMap();
        expect(internals(card).configErrors).toEqual([]);
        expect(internals(card).config.map_source.camera).toBe(MAP);
    });

    it("works with a truly minimal { type, entity } config (camera calibration included)", () => {
        const card = makeCard();
        card.setConfig({ type: "custom:dreame-vacuum-card", entity: "vacuum.a" } as DreameVacuumCardConfig);
        card.hass = hassWithMap();
        expect(internals(card).configErrors).toEqual([]);
        expect(internals(card).config.map_source).toEqual({ camera: MAP });
        expect(internals(card).config.calibration_source).toEqual({ camera: true });
    });

    it("follows a renamed map camera on entity registry updates", () => {
        const card = makeCard();
        card.setConfig(withoutMapSource());
        card.hass = hassWithMap();
        const renamed = "camera.renamed_map";
        const hass = hassWithMap();
        card.hass = makeHass({
            states: { ...hass.states, [renamed]: { entity_id: renamed, state: "idle", attributes: {} } } as never,
            entities: {
                "vacuum.a": { entity_id: "vacuum.a", device_id: "dev1" },
                [renamed]: { entity_id: renamed, device_id: "dev1", translation_key: "current_map" },
            } as never,
        });
        expect(internals(card).configErrors).toEqual([]);
        expect(internals(card).config.map_source.camera).toBe(renamed);
    });

    it("does not re-apply the config when the registry changes but the camera stays the same", () => {
        const card = makeCard();
        card.setConfig(withoutMapSource());
        card.hass = hassWithMap();
        const applied = internals(card).config;
        const setPresetIndex = vi.spyOn(card as unknown as { _setPresetIndex: () => void }, "_setPresetIndex");
        card.hass = hassWithMap(); // nouvel objet `entities`, même caméra
        expect(setPresetIndex).not.toHaveBeenCalled();
        expect(internals(card).config).toBe(applied);
    });

    it("keeps the previous 'Missing property: map_source' error when no camera can be derived", () => {
        const card = makeCard();
        card.setConfig(withoutMapSource());
        card.hass = makeHass({ entities: { "vacuum.a": { entity_id: "vacuum.a", device_id: "dev1" } } as never });
        expect(internals(card).configErrors).toEqual(["Missing property: map_source"]);
    });

    it("reports the error, without crashing, when hass exposes no entity registry", () => {
        const card = makeCard();
        card.setConfig(withoutMapSource());
        card.hass = makeHass({ entities: undefined } as never);
        expect(internals(card).configErrors).toEqual(["Missing property: map_source"]);
    });

    it("retries when the entity registry is updated after a failed derivation", () => {
        const card = makeCard();
        card.setConfig(withoutMapSource());
        card.hass = makeHass({ entities: { "vacuum.a": { entity_id: "vacuum.a", device_id: "dev1" } } as never });
        expect(internals(card).configErrors).toEqual(["Missing property: map_source"]);
        card.hass = hassWithMap();
        expect(internals(card).configErrors).toEqual([]);
        expect(internals(card).config.map_source.camera).toBe(MAP);
    });
});
