import { describe, it, expect } from "vitest";
import { validateConfig, isOldConfig, areAllEntitiesDefined } from "../src/config-validators";
import type { XiaomiVacuumMapCardConfig } from "../src/types/types";
import type { HomeAssistantFixed } from "../src/types/fixes";

// --- Helpers -----------------------------------------------------------------

// validateConfig prend un XiaomiVacuumMapCardConfig; on construit des objets
// partiels castés (cf. pattern test/utils.test.ts).
const cfg = (overrides: Record<string, unknown>): XiaomiVacuumMapCardConfig =>
    overrides as unknown as XiaomiVacuumMapCardConfig;

// Préset minimal valide: plateforme par défaut "Dreame" (calibration par défaut
// fournie => calibration_source non obligatoire), entity + map_source présents.
const baseValid = (extra: Record<string, unknown> = {}): XiaomiVacuumMapCardConfig =>
    cfg({
        language: "en",
        entity: "vacuum.test",
        map_source: { camera: "camera.map" },
        ...extra,
    });

const mkHass = (states: Record<string, unknown>): HomeAssistantFixed =>
    ({ states }) as unknown as HomeAssistantFixed;

// --- validateConfig: configs valides -----------------------------------------

describe("validateConfig - configs valides", () => {
    it("ne retourne aucune erreur pour un préset minimal valide", () => {
        expect(validateConfig(baseValid())).toEqual([]);
    });

    it("accepte map_source via image", () => {
        expect(validateConfig(baseValid({ map_source: { image: "/local/map.png" } }))).toEqual([]);
    });

    it("accepte un mode ROOM avec predefined_selections valides", () => {
        const config = baseValid({
            map_modes: [
                {
                    name: "Rooms",
                    icon: "mdi:floor-plan",
                    selection_type: "ROOM",
                    service_call_schema: { service: "vacuum.send_command" },
                    predefined_selections: [{ id: "living_room" }, { id: 2 }],
                },
            ],
        });
        expect(validateConfig(config)).toEqual([]);
    });

    it("accepte un mode PREDEFINED_RECTANGLE (zones) valide", () => {
        const config = baseValid({
            map_modes: [
                {
                    name: "Zones",
                    icon: "mdi:vector-selection",
                    selection_type: "PREDEFINED_RECTANGLE",
                    service_call_schema: { service: "vacuum.send_command" },
                    predefined_selections: [{ zones: [[1, 2, 3, 4]] }],
                },
            ],
        });
        expect(validateConfig(config)).toEqual([]);
    });

    it("accepte un mode PREDEFINED_POINT (position) valide", () => {
        const config = baseValid({
            map_modes: [
                {
                    name: "Point",
                    icon: "mdi:map-marker",
                    selection_type: "PREDEFINED_POINT",
                    service_call_schema: { service: "vacuum.send_command" },
                    predefined_selections: [{ position: [10, 20] }],
                },
            ],
        });
        expect(validateConfig(config)).toEqual([]);
    });

    it("accepte un mode via template (pas besoin de name/icon/schema explicites)", () => {
        const config = baseValid({
            map_modes: [{ template: "vacuum_clean_segment" }],
        });
        expect(validateConfig(config)).toEqual([]);
    });

    it("accepte une plateforme explicite valide", () => {
        expect(validateConfig(baseValid({ vacuum_platform: "Dreame" }))).toEqual([]);
    });
});

// --- validateConfig: champs obligatoires manquants ---------------------------

describe("validateConfig - champs obligatoires", () => {
    it("signale entity manquant", () => {
        const config = cfg({ language: "en", map_source: { camera: "camera.map" } });
        expect(validateConfig(config)).toContain("Missing property: entity");
    });

    it("signale map_source manquant", () => {
        const config = cfg({ language: "en", entity: "vacuum.test" });
        expect(validateConfig(config)).toContain("Missing property: map_source");
    });

    it("signale entity ET map_source manquants pour un objet quasi vide", () => {
        const config = cfg({ language: "en" });
        const errors = validateConfig(config);
        expect(errors).toContain("Missing property: entity");
        expect(errors).toContain("Missing property: map_source");
    });

    it("n'exige PAS calibration_source sur la plateforme par défaut (Dreame)", () => {
        const errors = validateConfig(baseValid());
        expect(errors).not.toContain("Missing property: calibration_source");
    });

    it("exige calibration_source sur une plateforme sans calibration par défaut", () => {
        // Plateforme inconnue => pas dans getPlatformsWithDefaultCalibration().
        const config = baseValid({ vacuum_platform: "Unknown" });
        const errors = validateConfig(config);
        expect(errors).toContain("Missing property: calibration_source");
    });
});

// --- validateConfig: map_source -----------------------------------------------

describe("validateConfig - map_source", () => {
    it("signale aucune source fournie (ni camera ni image)", () => {
        const config = baseValid({ map_source: {} });
        expect(validateConfig(config)).toContain("No camera neither image provided");
    });

    it("signale source ambiguë (camera ET image)", () => {
        const config = baseValid({ map_source: { camera: "camera.map", image: "/local/m.png" } });
        expect(validateConfig(config)).toContain("Only one map source allowed");
    });
});

// --- validateConfig: plateforme invalide -------------------------------------

describe("validateConfig - plateforme", () => {
    it("signale une plateforme invalide avec interpolation {0}", () => {
        const config = baseValid({ vacuum_platform: "Unknown" });
        const errors = validateConfig(config);
        expect(errors).toContain("Invalid vacuum platform: Unknown");
    });

    it("accepte les alias legacy de plateforme (Tasshack/dreame-vacuum)", () => {
        const config = baseValid({ vacuum_platform: "Tasshack/dreame-vacuum" });
        const errors = validateConfig(config);
        expect(errors).not.toContain("Invalid vacuum platform: Tasshack/dreame-vacuum");
        // L'alias resolve vers Dreame qui a une calibration par défaut.
        expect(errors).not.toContain("Missing property: calibration_source");
    });
});

// --- validateConfig: validateRoomConfig (correctifs id) ----------------------

describe("validateConfig - validateRoomConfig (garde id)", () => {
    const roomMode = (selections: unknown[]) =>
        baseValid({
            map_modes: [
                {
                    name: "Rooms",
                    icon: "mdi:floor-plan",
                    selection_type: "ROOM",
                    service_call_schema: { service: "vacuum.send_command" },
                    predefined_selections: selections,
                },
            ],
        });

    it("signale id manquant (undefined) sans crash toString", () => {
        const errors = validateConfig(roomMode([{}]));
        expect(errors).toContain("Missing room id");
    });

    it("signale id manquant (null) sans crash toString", () => {
        const errors = validateConfig(roomMode([{ id: null }]));
        expect(errors).toContain("Missing room id");
    });

    it("signale id au format invalide (caractères interdits) avec interpolation", () => {
        const errors = validateConfig(roomMode([{ id: "bad!id" }]));
        expect(errors).toContain("Invalid room id: bad!id");
    });

    it("n'émet PAS d'erreur de format quand id est absent (else-if, pas de double erreur)", () => {
        const errors = validateConfig(roomMode([{}]));
        expect(errors).toContain("Missing room id");
        // Aucune entrée 'Invalid room id' ne doit apparaître.
        expect(errors.some((e) => e.startsWith("Invalid room id"))).toBe(false);
    });

    it("accepte un id numérique (toString -> chiffres valides)", () => {
        const errors = validateConfig(roomMode([{ id: 3 }]));
        expect(errors).toEqual([]);
    });

    it("accepte un id alphanumérique avec espaces et underscores", () => {
        const errors = validateConfig(roomMode([{ id: "Living Room_1" }]));
        expect(errors).toEqual([]);
    });

    it("signale outline avec un nombre de paramètres invalide", () => {
        const errors = validateConfig(roomMode([{ id: 1, outline: [[1, 2, 3]] }]));
        expect(errors).toContain("Each point of room outline must have 2 parameters");
    });

    it("ne crash pas quand outline est absent (?? [])", () => {
        expect(() => validateConfig(roomMode([{ id: 1 }]))).not.toThrow();
    });
});

// --- validateConfig: validatePredefinedRectangleConfig (garde Array.isArray) --

describe("validateConfig - validatePredefinedRectangleConfig (garde zones)", () => {
    const zoneMode = (selections: unknown[]) =>
        baseValid({
            map_modes: [
                {
                    name: "Zones",
                    icon: "mdi:vector-selection",
                    selection_type: "PREDEFINED_RECTANGLE",
                    service_call_schema: { service: "vacuum.send_command" },
                    predefined_selections: selections,
                },
            ],
        });

    it("signale zones manquantes (undefined) sans crash", () => {
        const errors = validateConfig(zoneMode([{}]));
        expect(errors).toContain("Missing zones configuration");
    });

    it("ne crash pas quand zones n'est pas un tableau (string template)", () => {
        // zones="{{ ... }}" est truthy -> pas de 'missing', et Array.isArray=false
        // -> pas d'appel .filter sur un non-tableau.
        let errors: string[] = [];
        expect(() => {
            errors = validateConfig(zoneMode([{ zones: "{{ states('input_text.zone') }}" }]));
        }).not.toThrow();
        expect(errors).not.toContain("Missing zones configuration");
        expect(errors).not.toContain("Each zone must have 4 parameters");
    });

    it("signale une zone avec un nombre de paramètres invalide", () => {
        const errors = validateConfig(zoneMode([{ zones: [[1, 2, 3]] }]));
        expect(errors).toContain("Each zone must have 4 parameters");
    });

    it("signale x manquant dans l'icône d'une zone", () => {
        const errors = validateConfig(zoneMode([{ zones: [[1, 2, 3, 4]], icon: { y: 5, name: "x" } }]));
        expect(errors).toContain("Icon must have x property");
    });

    it("signale text manquant dans le label d'une zone", () => {
        const errors = validateConfig(zoneMode([{ zones: [[1, 2, 3, 4]], label: { x: 1, y: 2 } }]));
        expect(errors).toContain("Label must have text property");
    });
});

// --- validateConfig: validatePredefinedPointConfig ---------------------------

describe("validateConfig - validatePredefinedPointConfig", () => {
    const pointMode = (selections: unknown[]) =>
        baseValid({
            map_modes: [
                {
                    name: "Point",
                    icon: "mdi:map-marker",
                    selection_type: "PREDEFINED_POINT",
                    service_call_schema: { service: "vacuum.send_command" },
                    predefined_selections: selections,
                },
            ],
        });

    it("signale position manquante", () => {
        const errors = validateConfig(pointMode([{}]));
        expect(errors).toContain("Missing points configuration");
    });

    it("signale position avec un mauvais nombre de paramètres", () => {
        const errors = validateConfig(pointMode([{ position: [1, 2, 3] }]));
        expect(errors).toContain("Each point must have 2 parameters");
    });

    it("accepte une position string (template) sans erreur de nombre de paramètres", () => {
        const errors = validateConfig(pointMode([{ position: "{{ template }}" }]));
        expect(errors).not.toContain("Each point must have 2 parameters");
        expect(errors).not.toContain("Missing points configuration");
    });
});

// --- validateConfig: precedence MANUAL_* / predefined_selections -------------

describe("validateConfig - precedence predefined_selections sur modes MANUAL_*", () => {
    const manualMode = (selectionType: string, predefined?: unknown[]) =>
        baseValid({
            map_modes: [
                {
                    name: "Manual",
                    icon: "mdi:select-drag",
                    selection_type: selectionType,
                    service_call_schema: { service: "vacuum.send_command" },
                    ...(predefined ? { predefined_selections: predefined } : {}),
                },
            ],
        });

    it("MANUAL_RECTANGLE avec predefined_selections => not_applicable (nom du type interpolé)", () => {
        const errors = validateConfig(manualMode("MANUAL_RECTANGLE", [{ zones: [[1, 2, 3, 4]] }]));
        expect(errors).toContain("Mode MANUAL_RECTANGLE does not support predefined selections");
    });

    it("MANUAL_PATH avec predefined_selections => not_applicable", () => {
        const errors = validateConfig(manualMode("MANUAL_PATH", [{ position: [1, 2] }]));
        expect(errors).toContain("Mode MANUAL_PATH does not support predefined selections");
    });

    it("MANUAL_POINT avec predefined_selections => not_applicable", () => {
        const errors = validateConfig(manualMode("MANUAL_POINT", [{ position: [1, 2] }]));
        expect(errors).toContain("Mode MANUAL_POINT does not support predefined selections");
    });

    it("MANUAL_RECTANGLE SANS predefined_selections => aucune erreur not_applicable", () => {
        const errors = validateConfig(manualMode("MANUAL_RECTANGLE"));
        expect(errors.some((e) => e.includes("does not support predefined selections"))).toBe(false);
    });

    it("MANUAL_RECTANGLE avec predefined_selections vide => pas de not_applicable", () => {
        const errors = validateConfig(manualMode("MANUAL_RECTANGLE", []));
        expect(errors.some((e) => e.includes("does not support predefined selections"))).toBe(false);
    });

    it("MANUAL_* ne valide PAS le contenu des predefined_selections (pas de check zones/position)", () => {
        // Une zone malformée ne doit PAS produire 'Each zone must have 4 parameters'
        // car MANUAL_RECTANGLE n'entre pas dans la branche PREDEFINED_RECTANGLE.
        const errors = validateConfig(manualMode("MANUAL_RECTANGLE", [{ zones: [[1]] }]));
        expect(errors).not.toContain("Each zone must have 4 parameters");
        expect(errors).toContain("Mode MANUAL_RECTANGLE does not support predefined selections");
    });
});

// --- validateConfig: map_modes invalides + service_call_schema ---------------

describe("validateConfig - map_modes et service_call_schema", () => {
    it("signale un mode invalide (null)", () => {
        const errors = validateConfig(baseValid({ map_modes: [null] }));
        expect(errors).toContain("Error in configuration: map_modes");
    });

    it("signale un template invalide avec interpolation {0}", () => {
        const errors = validateConfig(baseValid({ map_modes: [{ template: "does_not_exist" }] }));
        expect(errors).toContain("Invalid template: does_not_exist");
    });

    it("signale icon/name/service_call_schema manquants sur un mode sans template", () => {
        const errors = validateConfig(baseValid({ map_modes: [{}] }));
        expect(errors).toContain("Missing icon of map mode");
        expect(errors).toContain("Missing name of map mode");
        expect(errors).toContain("Missing service call schema");
    });

    it("signale un service sans point (invalide)", () => {
        const config = baseValid({
            map_modes: [
                {
                    name: "M",
                    icon: "mdi:x",
                    selection_type: "MANUAL_POINT",
                    service_call_schema: { service: "noDotService" },
                },
            ],
        });
        expect(validateConfig(config)).toContain("Invalid service: noDotService");
    });

    it("ne crash pas quand map_modes est absent", () => {
        expect(() => validateConfig(baseValid())).not.toThrow();
    });

    it("ne crash pas quand map_modes est un tableau vide", () => {
        expect(validateConfig(baseValid({ map_modes: [] }))).toEqual([]);
    });
});

// --- isOldConfig -------------------------------------------------------------

describe("isOldConfig", () => {
    it("retourne true pour l'ancienne structure (map_image)", () => {
        expect(isOldConfig(cfg({ map_image: "/local/map.png" }))).toBe(true);
    });

    it("retourne true pour l'ancienne structure (map_camera)", () => {
        expect(isOldConfig(cfg({ map_camera: "camera.map" }))).toBe(true);
    });

    it("retourne true quand map_image ET map_camera présents", () => {
        expect(isOldConfig(cfg({ map_image: "/local/m.png", map_camera: "camera.map" }))).toBe(true);
    });

    it("retourne false pour la nouvelle structure (map_source)", () => {
        expect(isOldConfig(baseValid())).toBe(false);
    });

    it("retourne false pour un objet vide", () => {
        expect(isOldConfig(cfg({}))).toBe(false);
    });

    it("retourne false quand map_image/map_camera sont des valeurs falsy", () => {
        expect(isOldConfig(cfg({ map_image: "", map_camera: undefined }))).toBe(false);
    });
});

// --- areAllEntitiesDefined ---------------------------------------------------

describe("areAllEntitiesDefined", () => {
    it("retourne un tableau vide quand toutes les entités existent", () => {
        const hass = mkHass({ "vacuum.a": {}, "sensor.b": {} });
        expect(areAllEntitiesDefined(["vacuum.a", "sensor.b"], hass)).toEqual([]);
    });

    it("retourne les entités manquantes uniquement", () => {
        const hass = mkHass({ "vacuum.a": {} });
        expect(areAllEntitiesDefined(["vacuum.a", "sensor.missing"], hass)).toEqual(["sensor.missing"]);
    });

    it("retourne toutes les entités quand hass.states est vide", () => {
        const hass = mkHass({});
        expect(areAllEntitiesDefined(["vacuum.a", "sensor.b"], hass)).toEqual(["vacuum.a", "sensor.b"]);
    });

    it("retourne un tableau vide quand la liste demandée est vide", () => {
        const hass = mkHass({ "vacuum.a": {} });
        expect(areAllEntitiesDefined([], hass)).toEqual([]);
    });

    it("conserve l'ordre et les doublons de la liste d'entrée", () => {
        const hass = mkHass({ "vacuum.a": {} });
        expect(areAllEntitiesDefined(["x", "vacuum.a", "x"], hass)).toEqual(["x", "x"]);
    });
});
