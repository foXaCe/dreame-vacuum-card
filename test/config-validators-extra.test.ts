import { describe, it, expect } from "vitest";
import { validateConfig } from "../src/config-validators";
import type { XiaomiVacuumMapCardConfig } from "../src/types/types";

// Cas COMPLEMENTAIRES a test/config-validators.test.ts: on cible les branches
// non couvertes (calibration_source / calibration_points, validateIcon/Label via
// label & icon mal formes, fusion de template, modes multiples, service vide).
// On NE re-teste PAS ce que couvre deja le fichier existant.

const cfg = (overrides: Record<string, unknown>): XiaomiVacuumMapCardConfig =>
    overrides as unknown as XiaomiVacuumMapCardConfig;

// Plateforme par defaut "Dreame": calibration par defaut => calibration_source
// reste optionnel; mais s'il est present il est valide quand meme (ligne 230).
const baseValid = (extra: Record<string, unknown> = {}): XiaomiVacuumMapCardConfig =>
    cfg({
        language: "en",
        entity: "vacuum.test",
        map_source: { camera: "camera.map" },
        ...extra,
    });

// Mode predefini parametrable (selection_type + predefined_selections).
const selectionMode = (selectionType: string, selections: unknown[]): XiaomiVacuumMapCardConfig =>
    baseValid({
        map_modes: [
            {
                name: "M",
                icon: "mdi:x",
                selection_type: selectionType,
                service_call_schema: { service: "vacuum.send_command" },
                predefined_selections: selections,
            },
        ],
    });

const point3 = [
    { map: { x: 0, y: 0 }, vacuum: { x: 0, y: 0 } },
    { map: { x: 100, y: 0 }, vacuum: { x: 1000, y: 0 } },
    { map: { x: 0, y: 100 }, vacuum: { x: 0, y: 1000 } },
];

// --- validateCalibrationSource: cle unique vs ambigu -------------------------

describe("validateConfig - calibration_source: detection d'ambiguite", () => {
    it("accepte une source unique (camera seule)", () => {
        const errors = validateConfig(baseValid({ calibration_source: { camera: true } }));
        expect(errors).not.toContain("Only one calibration source allowed");
    });

    it("accepte une source unique (identity seule)", () => {
        const errors = validateConfig(baseValid({ calibration_source: { identity: true } }));
        expect(errors).not.toContain("Only one calibration source allowed");
    });

    it("ignore 'attribute' dans le decompte: platform + attribute reste non ambigu", () => {
        // Object.keys filtre 'attribute' => 1 cle restante ('platform') => OK.
        const errors = validateConfig(baseValid({ calibration_source: { platform: "X", attribute: "calibration" } }));
        expect(errors).not.toContain("Only one calibration source allowed");
    });

    it("accepte entity + attribute (attribute ne compte pas)", () => {
        const errors = validateConfig(
            baseValid({ calibration_source: { entity: "sensor.cal", attribute: "calibration_points" } })
        );
        expect(errors).not.toContain("Only one calibration source allowed");
    });

    it("signale une source ambigue (camera ET entity)", () => {
        const errors = validateConfig(baseValid({ calibration_source: { camera: true, entity: "sensor.cal" } }));
        expect(errors).toContain("Only one calibration source allowed");
    });

    it("signale une source ambigue (camera ET platform), meme avec attribute present", () => {
        const errors = validateConfig(
            baseValid({ calibration_source: { camera: true, platform: "X", attribute: "a" } })
        );
        expect(errors).toContain("Only one calibration source allowed");
    });

    it("un calibration_source vide ({}) ne produit aucune erreur de calibration", () => {
        // 0 cle => pas ambigu, pas de calibration_points => [].
        const errors = validateConfig(baseValid({ calibration_source: {} }));
        expect(errors).not.toContain("Only one calibration source allowed");
        expect(errors).not.toContain("Exactly 3 or 4 calibration points required");
    });
});

// --- validateCalibrationSource: calibration_points explicites ----------------

describe("validateConfig - calibration_source: calibration_points explicites", () => {
    it("accepte 3 points valides (aucune erreur)", () => {
        expect(validateConfig(baseValid({ calibration_source: { calibration_points: point3 } }))).toEqual([]);
    });

    it("accepte 4 points valides", () => {
        const point4 = [...point3, { map: { x: 100, y: 100 }, vacuum: { x: 1000, y: 1000 } }];
        expect(validateConfig(baseValid({ calibration_source: { calibration_points: point4 } }))).toEqual([]);
    });

    it("signale un nombre de points invalide (2)", () => {
        const errors = validateConfig(baseValid({ calibration_source: { calibration_points: point3.slice(0, 2) } }));
        expect(errors).toContain("Exactly 3 or 4 calibration points required");
    });

    it("signale un nombre de points invalide (5)", () => {
        const five = [...point3, point3[0], point3[1]];
        const errors = validateConfig(baseValid({ calibration_source: { calibration_points: five } }));
        expect(errors).toContain("Exactly 3 or 4 calibration points required");
    });

    it("signale un nombre de points invalide (0)", () => {
        const errors = validateConfig(baseValid({ calibration_source: { calibration_points: [] } }));
        expect(errors).toContain("Exactly 3 or 4 calibration points required");
    });

    it("signale une coordonnee manquante (map.x absent) sans crash", () => {
        const points = [{ map: { y: 0 }, vacuum: { x: 0, y: 0 } }, point3[1], point3[2]];
        const errors = validateConfig(baseValid({ calibration_source: { calibration_points: points } }));
        expect(errors).toContain("Map and vacuum calibration points must contain both x and y coordinate");
    });

    it("signale une coordonnee manquante (vacuum.y absent)", () => {
        const points = [{ map: { x: 0, y: 0 }, vacuum: { x: 0 } }, point3[1], point3[2]];
        const errors = validateConfig(baseValid({ calibration_source: { calibration_points: points } }));
        expect(errors).toContain("Map and vacuum calibration points must contain both x and y coordinate");
    });

    it("signale (sans crasher) un point sans 'map'", () => {
        // Correctif: l'acces a p.x/p.y est garde (p?.x) -> plus de TypeError ;
        // l'erreur 'missing_map' est bien rendue (+ 'missing_coordinate' car map absent).
        const points = [{ vacuum: { x: 0, y: 0 } }, point3[1], point3[2]];
        const errors = validateConfig(baseValid({ calibration_source: { calibration_points: points } }));
        expect(errors).toContain("Each calibration point must contain map coordinates");
    });

    it("signale (sans crasher) un point sans 'vacuum'", () => {
        const points = [{ map: { x: 0, y: 0 } }, point3[1], point3[2]];
        const errors = validateConfig(baseValid({ calibration_source: { calibration_points: points } }));
        expect(errors).toContain("Each calibration point must contain vacuum coordinates");
    });
});

// --- validateIcon: branches y/name manquantes (via PREDEFINED_POINT & ROOM) --

describe("validateConfig - validateIcon (branches y/name)", () => {
    it("signale y manquant dans l'icone d'un point predefini", () => {
        const errors = validateConfig(selectionMode("PREDEFINED_POINT", [{ position: [1, 2], icon: { x: 1, name: "n" } }]));
        expect(errors).toContain("Icon must have y property");
    });

    it("signale name manquant dans l'icone d'une room", () => {
        const errors = validateConfig(selectionMode("ROOM", [{ id: 1, icon: { x: 1, y: 2 } }]));
        expect(errors).toContain("Icon must have name property");
    });

    it("signale x manquant dans l'icone d'un point predefini", () => {
        const errors = validateConfig(selectionMode("PREDEFINED_POINT", [{ position: [1, 2], icon: { y: 2, name: "n" } }]));
        expect(errors).toContain("Icon must have x property");
    });

    it("accepte une icone complete sur un point predefini (aucune erreur d'icone)", () => {
        const errors = validateConfig(
            selectionMode("PREDEFINED_POINT", [{ position: [1, 2], icon: { x: 1, y: 2, name: "n" } }])
        );
        expect(errors.some((e) => e.startsWith("Icon must have"))).toBe(false);
    });
});

// --- validateLabel: branches x/y manquantes (via ROOM & PREDEFINED_POINT) ----

describe("validateConfig - validateLabel (branches x/y)", () => {
    it("signale x manquant dans le label d'une room", () => {
        const errors = validateConfig(selectionMode("ROOM", [{ id: 1, label: { y: 2, text: "t" } }]));
        expect(errors).toContain("Label must have x property");
    });

    it("signale y manquant dans le label d'un point predefini", () => {
        const errors = validateConfig(selectionMode("PREDEFINED_POINT", [{ position: [1, 2], label: { x: 1, text: "t" } }]));
        expect(errors).toContain("Label must have y property");
    });

    it("signale text manquant dans le label d'une room", () => {
        const errors = validateConfig(selectionMode("ROOM", [{ id: 1, label: { x: 1, y: 2 } }]));
        expect(errors).toContain("Label must have text property");
    });

    it("accepte un label complet sur une room (aucune erreur de label)", () => {
        const errors = validateConfig(selectionMode("ROOM", [{ id: 1, label: { x: 1, y: 2, text: "t" } }]));
        expect(errors.some((e) => e.startsWith("Label must have"))).toBe(false);
    });
});

// --- icon + label valides combines (point & room) ----------------------------

describe("validateConfig - icon + label valides sur selections predefinies", () => {
    it("point predefini avec icon ET label complets => aucune erreur", () => {
        const errors = validateConfig(
            selectionMode("PREDEFINED_POINT", [
                { position: [10, 20], icon: { x: 1, y: 2, name: "n" }, label: { x: 3, y: 4, text: "t" } },
            ])
        );
        expect(errors).toEqual([]);
    });

    it("room avec icon ET label complets => aucune erreur", () => {
        const errors = validateConfig(
            selectionMode("ROOM", [{ id: 5, icon: { x: 1, y: 2, name: "n" }, label: { x: 3, y: 4, text: "t" } }])
        );
        expect(errors).toEqual([]);
    });
});

// --- service_call_schema: service absent dans un schema present --------------

describe("validateConfig - service_call_schema service manquant", () => {
    it("signale 'service' manquant quand service_call_schema est present mais vide", () => {
        // {} est truthy => pas de "Missing service call schema", mais
        // validateServiceCallSchemaConfig signale le service absent (l.152).
        const config = baseValid({
            map_modes: [{ name: "M", icon: "mdi:x", selection_type: "MANUAL_POINT", service_call_schema: {} }],
        });
        const errors = validateConfig(config);
        expect(errors).toContain("Service call schema must contain service");
        expect(errors).not.toContain("Missing service call schema");
    });
});

// --- fusion de template de mode (template + config additionnelle) ------------

describe("validateConfig - fusion de template de mode", () => {
    it("template PREDEFINED valide + predefined_selections invalides => erreur de zone", () => {
        // Le selection_type vient du template (PREDEFINED_RECTANGLE), donc le
        // validateur descend dans la branche PREDEFINED_RECTANGLE et controle les
        // zones explicites fournies en complement du template.
        const config = baseValid({
            map_modes: [{ template: "vacuum_clean_zone_predefined", predefined_selections: [{ zones: [[1, 2, 3]] }] }],
        });
        const errors = validateConfig(config);
        expect(errors).toContain("Each zone must have 4 parameters");
        // Le template etant valide, pas d'erreur 'Invalid template'.
        expect(errors.some((e) => e.startsWith("Invalid template"))).toBe(false);
    });

    it("template PREDEFINED valide + predefined_selections valides => aucune erreur", () => {
        const config = baseValid({
            map_modes: [
                { template: "vacuum_clean_zone_predefined", predefined_selections: [{ zones: [[1, 2, 3, 4]] }] },
            ],
        });
        expect(validateConfig(config)).toEqual([]);
    });

    it("template MANUAL valide + predefined_selections => not_applicable (selection_type du template)", () => {
        // vacuum_clean_zone est MANUAL_RECTANGLE; fournir des predefined_selections
        // declenche la garde not_applicable avec le nom du type interpole.
        const config = baseValid({
            map_modes: [{ template: "vacuum_clean_zone", predefined_selections: [{ zones: [[1, 2, 3, 4]] }] }],
        });
        const errors = validateConfig(config);
        expect(errors).toContain("Mode MANUAL_RECTANGLE does not support predefined selections");
    });

    it("template valide + name/icon explicites surchargent sans erreur", () => {
        const config = baseValid({
            map_modes: [{ template: "vacuum_clean_segment", name: "Custom", icon: "mdi:custom" }],
        });
        expect(validateConfig(config)).toEqual([]);
    });
});

// --- modes multiples: agregation des erreurs ---------------------------------

describe("validateConfig - modes multiples", () => {
    it("agrege les erreurs de plusieurs modes (template invalide + zone invalide)", () => {
        const config = baseValid({
            map_modes: [
                { template: "does_not_exist" },
                {
                    name: "Z",
                    icon: "mdi:z",
                    selection_type: "PREDEFINED_RECTANGLE",
                    service_call_schema: { service: "vacuum.send_command" },
                    predefined_selections: [{ zones: [[1, 2, 3]] }],
                },
            ],
        });
        const errors = validateConfig(config);
        expect(errors).toContain("Invalid template: does_not_exist");
        expect(errors).toContain("Each zone must have 4 parameters");
    });

    it("plusieurs modes valides de types differents => aucune erreur", () => {
        const config = baseValid({
            map_modes: [
                {
                    name: "Rooms",
                    icon: "mdi:floor-plan",
                    selection_type: "ROOM",
                    service_call_schema: { service: "vacuum.send_command" },
                    predefined_selections: [{ id: 1 }],
                },
                {
                    name: "Point",
                    icon: "mdi:map-marker",
                    selection_type: "PREDEFINED_POINT",
                    service_call_schema: { service: "vacuum.send_command" },
                    predefined_selections: [{ position: [1, 2] }],
                },
                { template: "vacuum_clean_zone" },
            ],
        });
        expect(validateConfig(config)).toEqual([]);
    });

    it("agrege erreurs d'un meme mode: plusieurs selections invalides", () => {
        const config = selectionMode("PREDEFINED_RECTANGLE", [
            { zones: [[1, 2, 3]] },
            { zones: [[1, 2, 3, 4]], icon: { y: 2, name: "n" } },
        ]);
        const errors = validateConfig(config);
        expect(errors).toContain("Each zone must have 4 parameters");
        expect(errors).toContain("Icon must have x property");
    });
});
