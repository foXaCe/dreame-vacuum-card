import { describe, it, expect, vi } from "vitest";
import { stopEvent, getMousePosition } from "../src/utils/dom";
import {
    getWatchedEntitiesForMapMode,
    getWatchedEntitiesForPreset,
    getWatchedEntities,
} from "../src/utils/watched-entities";
import { getAllEntitiesFromTheSameDevice } from "../src/utils/entity-registry";
import { MapMode } from "../src/model/map_mode/map-mode";
import { PlatformGenerator } from "../src/model/generators/platform-generator";
import type {
    CardPresetConfig,
    EntityRegistryEntry,
    MapModeConfig,
    XiaomiVacuumMapCardConfig,
} from "../src/types/types";
import type { HomeAssistantFixed } from "../src/types/fixes";

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

const PLATFORM = PlatformGenerator.TASSHACK_DREAME_VACUUM_PLATFORM; // "Dreame"
const LANG = "en";

const makeMapMode = (config: MapModeConfig): MapMode => new MapMode(PLATFORM, config, LANG);

// Construit un SVGGraphicsElement minimal avec un getBoundingClientRect contrôlable.
const makeSvgElement = (rectX: number, rectY: number): SVGGraphicsElement =>
    ({
        getBoundingClientRect: () => ({ x: rectX, y: rectY }) as DOMRect,
    }) as unknown as SVGGraphicsElement;

// -----------------------------------------------------------------------------
// stopEvent
// -----------------------------------------------------------------------------

describe("stopEvent", () => {
    it("appelle preventDefault, stopPropagation et stopImmediatePropagation", () => {
        const preventDefault = vi.fn();
        const stopPropagation = vi.fn();
        const stopImmediatePropagation = vi.fn();
        const event = {
            preventDefault,
            stopPropagation,
            stopImmediatePropagation,
        } as unknown as MouseEvent;

        stopEvent(event);

        expect(preventDefault).toHaveBeenCalledTimes(1);
        expect(stopPropagation).toHaveBeenCalledTimes(1);
        expect(stopImmediatePropagation).toHaveBeenCalledTimes(1);
    });

    it("ne renvoie rien (void)", () => {
        const event = {
            preventDefault: vi.fn(),
            stopPropagation: vi.fn(),
            stopImmediatePropagation: vi.fn(),
        } as unknown as TouchEvent;
        expect(stopEvent(event)).toBeUndefined();
    });
});

// -----------------------------------------------------------------------------
// getMousePosition
// -----------------------------------------------------------------------------

describe("getMousePosition", () => {
    it("utilise offsetX/offsetY pour un MouseEvent", () => {
        const event = new MouseEvent("mousedown");
        // happy-dom expose offsetX/offsetY (0 par défaut), on les force pour tester le mapping.
        Object.defineProperty(event, "offsetX", { value: 42, configurable: true });
        Object.defineProperty(event, "offsetY", { value: 17, configurable: true });

        const result = getMousePosition(event, makeSvgElement(0, 0), 1);

        expect(result.x).toBe(42);
        expect(result.y).toBe(17);
    });

    it("renvoie offsetX/offsetY=0 par défaut pour un MouseEvent sans offset", () => {
        const event = new MouseEvent("mousedown");
        const result = getMousePosition(event, makeSvgElement(5, 5), 2);
        // Le scale ne s'applique pas au chemin MouseEvent.
        expect(result.x).toBe(0);
        expect(result.y).toBe(0);
    });

    it("calcule la position pour un TouchEvent en tenant compte du rect et du scale", () => {
        const event = new TouchEvent("touchstart", {
            touches: [{ clientX: 100, clientY: 60 } as Touch],
        } as TouchEventInit);
        const element = makeSvgElement(10, 20);

        const result = getMousePosition(event, element, 2);

        // (100 - 10) / 2 = 45 ; (60 - 20) / 2 = 20
        expect(result.x).toBe(45);
        expect(result.y).toBe(20);
    });

    it("correctif: un événement ni MouseEvent ni TouchEvent renvoie x=0 et y=0 (pas NaN/undefined)", () => {
        const event = new Event("custom") as unknown as MouseEvent;
        const result = getMousePosition(event, makeSvgElement(7, 9), 3);

        expect(result.x).toBe(0);
        expect(result.y).toBe(0);
        expect(Number.isNaN(result.x)).toBe(false);
        expect(Number.isNaN(result.y)).toBe(false);
        expect(result.x).not.toBeUndefined();
        expect(result.y).not.toBeUndefined();
    });
});

// -----------------------------------------------------------------------------
// getWatchedEntitiesForMapMode
// -----------------------------------------------------------------------------

describe("getWatchedEntitiesForMapMode", () => {
    it("collecte l'entité depuis 'zones' (string) pour PREDEFINED_RECTANGLE en retirant le suffixe .attributes.", () => {
        const mode = makeMapMode({
            selection_type: "PREDEFINED_RECTANGLE",
            predefined_selections: [
                { zones: "sensor.vacuum_rooms.attributes.kitchen" },
                { zones: "sensor.other_zones.attributes.living" },
            ],
        });

        const result = getWatchedEntitiesForMapMode(mode);

        expect(result).toBeInstanceOf(Set);
        expect([...result].sort()).toEqual(["sensor.other_zones", "sensor.vacuum_rooms"]);
    });

    it("ignore les zones non-string pour PREDEFINED_RECTANGLE", () => {
        const mode = makeMapMode({
            selection_type: "PREDEFINED_RECTANGLE",
            predefined_selections: [{ zones: [[1, 2, 3, 4]] }, { zones: "sensor.a.attributes.x" }],
        });

        const result = getWatchedEntitiesForMapMode(mode);

        expect([...result]).toEqual(["sensor.a"]);
    });

    it("collecte l'entité depuis 'position' (string) pour PREDEFINED_POINT", () => {
        const mode = makeMapMode({
            selection_type: "PREDEFINED_POINT",
            predefined_selections: [
                { position: "sensor.points.attributes.p1" },
                { position: "sensor.points.attributes.p2" },
            ],
        });

        const result = getWatchedEntitiesForMapMode(mode);

        // Set déduplique: les deux pointent vers sensor.points
        expect([...result]).toEqual(["sensor.points"]);
    });

    it("ignore les positions non-string pour PREDEFINED_POINT", () => {
        const mode = makeMapMode({
            selection_type: "PREDEFINED_POINT",
            predefined_selections: [{ position: [10, 20] }, { position: "sensor.pt.attributes.k" }],
        });

        const result = getWatchedEntitiesForMapMode(mode);

        expect([...result]).toEqual(["sensor.pt"]);
    });

    it("ajoute toujours les state_entity quelle que soit la selection_type", () => {
        const mode = makeMapMode({
            selection_type: "PREDEFINED_RECTANGLE",
            predefined_selections: [
                { zones: "sensor.z.attributes.a", state_entity: "binary_sensor.state1" },
                { zones: "sensor.z2.attributes.b", state_entity: "binary_sensor.state2" },
            ],
        });

        const result = getWatchedEntitiesForMapMode(mode);

        expect(result.has("binary_sensor.state1")).toBe(true);
        expect(result.has("binary_sensor.state2")).toBe(true);
        expect(result.has("sensor.z")).toBe(true);
        expect(result.has("sensor.z2")).toBe(true);
    });

    it("collecte les state_entity pour une selection_type sans branche zones/position (ROOM)", () => {
        const mode = makeMapMode({
            selection_type: "ROOM",
            predefined_selections: [
                { id: 1, state_entity: "binary_sensor.room1" },
                { id: 2 },
            ],
        });

        const result = getWatchedEntitiesForMapMode(mode);

        expect([...result]).toEqual(["binary_sensor.room1"]);
    });

    it("renvoie un Set vide si aucune sélection prédéfinie", () => {
        const mode = makeMapMode({ selection_type: "PREDEFINED_RECTANGLE" });
        const result = getWatchedEntitiesForMapMode(mode);
        expect(result.size).toBe(0);
    });
});

// -----------------------------------------------------------------------------
// getWatchedEntitiesForPreset
// -----------------------------------------------------------------------------

describe("getWatchedEntitiesForPreset", () => {
    it("collecte entité, caméra, calibration, conditions et entités des map_modes", () => {
        const config = {
            entity: "vacuum.robot",
            vacuum_platform: PLATFORM,
            map_source: { camera: "camera.vacuum_map" },
            calibration_source: { entity: "sensor.calibration" },
            conditions: [{ entity: "binary_sensor.cond1" }, { entity: "binary_sensor.cond2" }],
            map_modes: [
                {
                    selection_type: "PREDEFINED_RECTANGLE",
                    predefined_selections: [
                        { zones: "sensor.zones.attributes.kitchen", state_entity: "binary_sensor.zone_state" },
                    ],
                },
            ],
        } as unknown as CardPresetConfig;

        const result = getWatchedEntitiesForPreset(config, LANG);

        expect(result).toBeInstanceOf(Set);
        expect([...result].sort()).toEqual(
            [
                "binary_sensor.cond1",
                "binary_sensor.cond2",
                "binary_sensor.zone_state",
                "camera.vacuum_map",
                "sensor.calibration",
                "sensor.zones",
                "vacuum.robot",
            ].sort(),
        );
    });

    it("gère un preset minimal (uniquement entity, pas de caméra/calibration/conditions/map_modes)", () => {
        const config = {
            entity: "vacuum.minimal",
            map_source: {},
        } as unknown as CardPresetConfig;

        const result = getWatchedEntitiesForPreset(config, LANG);

        expect([...result]).toEqual(["vacuum.minimal"]);
    });

    it("ignore une caméra absente et une calibration_source sans entity", () => {
        const config = {
            entity: "vacuum.x",
            map_source: { image: "/local/map.png" },
            calibration_source: { camera: true },
        } as unknown as CardPresetConfig;

        const result = getWatchedEntitiesForPreset(config, LANG);

        expect([...result]).toEqual(["vacuum.x"]);
    });

    it("ignore les conditions sans entity (null/undefined)", () => {
        const config = {
            entity: "vacuum.x",
            map_source: {},
            conditions: [{ entity: "sensor.ok" }, {}, { entity: undefined }, null],
        } as unknown as CardPresetConfig;

        const result = getWatchedEntitiesForPreset(config, LANG);

        expect([...result].sort()).toEqual(["sensor.ok", "vacuum.x"].sort());
    });

    it("agrège les entités de plusieurs map_modes", () => {
        const config = {
            entity: "vacuum.x",
            vacuum_platform: PLATFORM,
            map_source: {},
            map_modes: [
                {
                    selection_type: "PREDEFINED_POINT",
                    predefined_selections: [{ position: "sensor.points.attributes.p1" }],
                },
                {
                    selection_type: "PREDEFINED_RECTANGLE",
                    predefined_selections: [{ zones: "sensor.zones.attributes.z1" }],
                },
            ],
        } as unknown as CardPresetConfig;

        const result = getWatchedEntitiesForPreset(config, LANG);

        expect(result.has("sensor.points")).toBe(true);
        expect(result.has("sensor.zones")).toBe(true);
        expect(result.has("vacuum.x")).toBe(true);
    });
});

// -----------------------------------------------------------------------------
// getWatchedEntities
// -----------------------------------------------------------------------------

describe("getWatchedEntities", () => {
    it("renvoie un tableau (string[]) dédupliqué des entités surveillées", () => {
        const config = {
            entity: "vacuum.robot",
            language: LANG,
            vacuum_platform: PLATFORM,
            map_source: { camera: "camera.map" },
            conditions: [{ entity: "vacuum.robot" }], // doublon volontaire avec entity
        } as unknown as XiaomiVacuumMapCardConfig;

        const result = getWatchedEntities(config);

        expect(Array.isArray(result)).toBe(true);
        expect(result.sort()).toEqual(["camera.map", "vacuum.robot"].sort());
        // pas de doublon
        expect(result.filter((e) => e === "vacuum.robot")).toHaveLength(1);
    });

    it("utilise config.language pour construire les map_modes", () => {
        const config = {
            entity: "vacuum.robot",
            language: undefined,
            map_source: {},
        } as unknown as XiaomiVacuumMapCardConfig;

        const result = getWatchedEntities(config);
        expect(result).toEqual(["vacuum.robot"]);
    });
});

// -----------------------------------------------------------------------------
// getAllEntitiesFromTheSameDevice
// -----------------------------------------------------------------------------

describe("getAllEntitiesFromTheSameDevice", () => {
    const makeHass = (callWS: HomeAssistantFixed["callWS"]): HomeAssistantFixed =>
        ({ callWS }) as unknown as HomeAssistantFixed;

    it("récupère le device_id, liste les entités du device et filtre les disabled_by", async () => {
        const listEntries = [
            { device_id: "dev1", entity_id: "vacuum.robot" },
            { device_id: "dev1", entity_id: "sensor.battery" },
            { device_id: "dev2", entity_id: "sensor.other" },
            { device_id: "dev1", entity_id: "sensor.disabled" },
        ];
        const getEntries: Record<string, EntityRegistryEntry> = {
            "vacuum.robot": {
                entity_id: "vacuum.robot",
                original_icon: "mdi:robot",
                unique_id: "u1",
                device_id: "dev1",
                disabled_by: undefined,
            },
            "sensor.battery": {
                entity_id: "sensor.battery",
                original_icon: "mdi:battery",
                unique_id: "u2",
                device_id: "dev1",
                disabled_by: undefined,
            },
            "sensor.disabled": {
                entity_id: "sensor.disabled",
                original_icon: "mdi:cancel",
                unique_id: "u3",
                device_id: "dev1",
                disabled_by: "user",
            },
        };

        const callWS = vi.fn(async (msg: { type: string; entity_id?: string }) => {
            if (msg.type === "config/entity_registry/get") {
                return getEntries[msg.entity_id as string];
            }
            if (msg.type === "config/entity_registry/list") {
                return listEntries;
            }
            throw new Error("unexpected type " + msg.type);
        }) as unknown as HomeAssistantFixed["callWS"];

        const result = await getAllEntitiesFromTheSameDevice(makeHass(callWS), "vacuum.robot");

        const ids = result.map((e) => e.entity_id).sort();
        // sensor.other appartient à dev2 (exclu), sensor.disabled est désactivé (exclu)
        expect(ids).toEqual(["sensor.battery", "vacuum.robot"]);
        expect(result.every((e) => e.disabled_by == null)).toBe(true);
    });

    it("traite disabled_by==null comme actif (==, non strict)", async () => {
        const listEntries = [{ device_id: "dev1", entity_id: "vacuum.robot" }];
        const callWS = vi.fn(async (msg: { type: string; entity_id?: string }) => {
            if (msg.type === "config/entity_registry/get") {
                return {
                    entity_id: "vacuum.robot",
                    original_icon: "mdi:robot",
                    unique_id: "u1",
                    device_id: "dev1",
                    disabled_by: null,
                } as unknown as EntityRegistryEntry;
            }
            return listEntries;
        }) as unknown as HomeAssistantFixed["callWS"];

        const result = await getAllEntitiesFromTheSameDevice(makeHass(callWS), "vacuum.robot");

        expect(result.map((e) => e.entity_id)).toEqual(["vacuum.robot"]);
    });

    it("renvoie [] si aucune entité ne partage le device_id", async () => {
        const listEntries = [{ device_id: "devX", entity_id: "sensor.foo" }];
        const callWS = vi.fn(async (msg: { type: string; entity_id?: string }) => {
            if (msg.type === "config/entity_registry/get") {
                return {
                    entity_id: "vacuum.robot",
                    original_icon: "mdi:robot",
                    unique_id: "u1",
                    device_id: "dev1",
                } as unknown as EntityRegistryEntry;
            }
            return listEntries;
        }) as unknown as HomeAssistantFixed["callWS"];

        const result = await getAllEntitiesFromTheSameDevice(makeHass(callWS), "vacuum.robot");

        expect(result).toEqual([]);
    });

    it("renvoie [] si callWS lève une exception (dégradation gracieuse)", async () => {
        const callWS = vi.fn(async () => {
            throw new Error("WS down");
        }) as unknown as HomeAssistantFixed["callWS"];

        const result = await getAllEntitiesFromTheSameDevice(makeHass(callWS), "vacuum.robot");

        expect(result).toEqual([]);
    });

    it("renvoie [] si le second appel (list) rejette", async () => {
        const callWS = vi.fn(async (msg: { type: string }) => {
            if (msg.type === "config/entity_registry/get") {
                return { entity_id: "vacuum.robot", device_id: "dev1" } as unknown as EntityRegistryEntry;
            }
            throw new Error("list failed");
        }) as unknown as HomeAssistantFixed["callWS"];

        const result = await getAllEntitiesFromTheSameDevice(makeHass(callWS), "vacuum.robot");

        expect(result).toEqual([]);
    });
});
