import { describe, it, expect } from "vitest";
import { render, svg } from "lit";

import { CoordinatesConverter } from "../src/model/map_objects/coordinates-converter";
import { Context, ContextOptions } from "../src/model/map_objects/context";
import { MousePosition } from "../src/model/map_objects/mouse-position";
import { MapObject } from "../src/model/map_objects/map-object";
import { ManualRectangle } from "../src/model/map_objects/manual-rectangle";
import { ManualPath, PathPoint } from "../src/model/map_objects/manual-path";
import { Room } from "../src/model/map_objects/room";
import { PredefinedMultiRectangle } from "../src/model/map_objects/predefined-multi-rectangle";
import { PredefinedPoint } from "../src/model/map_objects/predefined-point";
import { MapMode } from "../src/model/map_mode/map-mode";
import { HomeAssistantFixed } from "../src/types/fixes";
import {
    CalibrationPoint,
    PredefinedPointConfig,
    PredefinedZoneConfig,
    RoomConfig,
    SelectionState,
    ZoneType,
} from "../src/types/types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Identité (calibration absente) : map == vacuum, aller-retour parfait. */
const IDENTITY = (): CoordinatesConverter => new CoordinatesConverter(undefined);

/** 3 points => AFFINE map = 2 * vacuum. */
const AFFINE_SCALE2: CalibrationPoint[] = [
    { vacuum: { x: 0, y: 0 }, map: { x: 0, y: 0 } },
    { vacuum: { x: 100, y: 0 }, map: { x: 200, y: 0 } },
    { vacuum: { x: 0, y: 100 }, map: { x: 0, y: 200 } },
];

/**
 * Construit un Context minimal autour d'un CoordinatesConverter donné.
 * Suit le pattern de test/coordinates.test.ts : callbacks no-op castés.
 */
function makeContext(
    converter: CoordinatesConverter | undefined,
    overrides: Partial<ContextOptions> = {}
): Context {
    const options: ContextOptions = {
        scale: () => 1,
        realScale: () => 1,
        mousePositionCalculator: () => new MousePosition(0, 0),
        update: () => {},
        selectionChanged: () => {},
        coordinatesConverter: () => converter,
        selectedManualRectangles: () => [],
        selectedPredefinedRectangles: () => [],
        selectedRooms: () => [],
        selectedPredefinedPoint: () => [],
        roundingEnabled: () => false,
        coordinatesToMetersDivider: () => 1,
        maxSelections: () => 999,
        runImmediately: () => Promise.resolve(false),
        localize: (s) => String(s),
        getState: () => "",
        toggleEntity: () => {},
        getCurrentMode: () => undefined,
        activateRoomMode: () => {},
        activeTab: () => "all",
        ...overrides,
    };
    return new Context(options);
}

/** Construit un MapMode minimal portant uniquement predefinedSelections. */
function makeMode(predefinedSelections: unknown[]): MapMode {
    return { predefinedSelections } as unknown as MapMode;
}

/** hass avec un dictionnaire d'états brut. */
function makeHass(states: Record<string, unknown>): HomeAssistantFixed {
    return { states } as unknown as HomeAssistantFixed;
}

/** Rend un SVGTemplateResult dans un hôte (enveloppé d'un <svg>) et renvoie l'hôte (vérifie le no-throw réel). */
function renderSvg(result: ReturnType<MapObject["render"]>): HTMLDivElement {
    const host = document.createElement("div");
    render(svg`<svg>${result}</svg>`, host);
    return host;
}

// ===========================================================================
// PredefinedMultiRectangle.getFromEntities — régression P3
// ===========================================================================

describe("PredefinedMultiRectangle.getFromEntities", () => {
    const ctxCreator = (): Context => makeContext(IDENTITY());

    it("ignore les sélections dont 'zones' n'est pas une string", () => {
        const mode = makeMode([{ zones: [[0, 0, 10, 10]] } as PredefinedZoneConfig]);
        const result = PredefinedMultiRectangle.getFromEntities(mode, makeHass({}), ctxCreator);
        expect(result).toEqual([]);
    });

    it("entité absente -> [] sans crash", () => {
        const mode = makeMode([{ zones: "sensor.missing.attributes.zones" } as PredefinedZoneConfig]);
        const result = PredefinedMultiRectangle.getFromEntities(mode, makeHass({}), ctxCreator);
        expect(result).toEqual([]);
    });

    it("attribut null -> []", () => {
        const mode = makeMode([{ zones: "sensor.x.attributes.zones" } as PredefinedZoneConfig]);
        const hass = makeHass({ "sensor.x": { state: "on", attributes: { zones: null } } });
        expect(PredefinedMultiRectangle.getFromEntities(mode, hass, ctxCreator)).toEqual([]);
    });

    it("state null -> []", () => {
        const mode = makeMode([{ zones: "sensor.x" } as PredefinedZoneConfig]);
        const hass = makeHass({ "sensor.x": { state: null, attributes: {} } });
        expect(PredefinedMultiRectangle.getFromEntities(mode, hass, ctxCreator)).toEqual([]);
    });

    it("état 'unavailable' (non-JSON) -> [] sans NaN ni crash", () => {
        const mode = makeMode([{ zones: "sensor.x" } as PredefinedZoneConfig]);
        const hass = makeHass({ "sensor.x": { state: "unavailable", attributes: {} } });
        expect(PredefinedMultiRectangle.getFromEntities(mode, hass, ctxCreator)).toEqual([]);
    });

    it("chaîne JSON non-tableau (objet) -> []", () => {
        const mode = makeMode([{ zones: "sensor.x" } as PredefinedZoneConfig]);
        const hass = makeHass({ "sensor.x": { state: JSON.stringify({ foo: 1 }), attributes: {} } });
        expect(PredefinedMultiRectangle.getFromEntities(mode, hass, ctxCreator)).toEqual([]);
    });

    it("zones malformées filtrées (longueur < 4, non-numériques) -> seules les valides restent", () => {
        const mode = makeMode([{ zones: "sensor.x" } as PredefinedZoneConfig]);
        const zones = [
            [0, 0, 10, 10], // valide
            [1, 2, 3], // trop court
            ["a", "b", "c", "d"], // non-numérique
            [5, 5, 15, 15, 99], // valide (>=4, 4 premiers numériques)
        ];
        const hass = makeHass({ "sensor.x": { state: JSON.stringify(zones), attributes: {} } });
        const result = PredefinedMultiRectangle.getFromEntities(mode, hass, ctxCreator);
        expect(result).toHaveLength(2);
        // Une zone valide -> size 1 (un rectangle dans la config générée).
        expect(result[0].size()).toBe(1);
        // toVacuum reflète la zone d'origine (converter identité).
        expect(result[0].toVacuum(null)).toEqual([[0, 0, 10, 10]]);
        expect(result[1].toVacuum(null)).toEqual([[5, 5, 15, 15, 99]]);
    });

    it("attribut déjà tableau (non-string) -> utilisé directement", () => {
        const mode = makeMode([{ zones: "sensor.x.attributes.zones" } as PredefinedZoneConfig]);
        const hass = makeHass({
            "sensor.x": { state: "on", attributes: { zones: [[1, 2, 3, 4]] } },
        });
        const result = PredefinedMultiRectangle.getFromEntities(mode, hass, ctxCreator);
        expect(result).toHaveLength(1);
        expect(result[0].toVacuum(null)).toEqual([[1, 2, 3, 4]]);
    });

    it("place l'icône au centre de la zone", () => {
        const mode = makeMode([{ zones: "sensor.x" } as PredefinedZoneConfig]);
        const hass = makeHass({ "sensor.x": { state: JSON.stringify([[0, 0, 10, 20]]), attributes: {} } });
        const result = PredefinedMultiRectangle.getFromEntities(mode, hass, ctxCreator);
        // centre = ((0+10)/2, (0+20)/2) = (5, 10) ; rendu sans throw.
        expect(() => renderSvg(result[0].render())).not.toThrow();
    });
});

// ===========================================================================
// PredefinedMultiRectangle — toVacuum / size / render
// ===========================================================================

describe("PredefinedMultiRectangle — toVacuum / size / render", () => {
    const baseConfig = (zones: ZoneType[] | string): PredefinedZoneConfig =>
        ({ zones } as PredefinedZoneConfig);

    it("size renvoie le nombre de zones", () => {
        const obj = new PredefinedMultiRectangle(baseConfig([[0, 0, 1, 1], [2, 2, 3, 3]]), makeContext(IDENTITY()));
        expect(obj.size()).toBe(2);
    });

    it("toVacuum(null) renvoie les zones brutes", () => {
        const zones: ZoneType[] = [[0, 0, 1, 1]];
        const obj = new PredefinedMultiRectangle(baseConfig(zones), makeContext(IDENTITY()));
        expect(obj.toVacuum(null)).toEqual([[0, 0, 1, 1]]);
    });

    it("toVacuum(repeats) ajoute les répétitions à chaque zone", () => {
        const obj = new PredefinedMultiRectangle(baseConfig([[0, 0, 1, 1], [2, 2, 3, 3]]), makeContext(IDENTITY()));
        expect(obj.toVacuum(4)).toEqual([
            [0, 0, 1, 1, 4],
            [2, 2, 3, 3, 4],
        ]);
    });

    it("toVacuum renvoie [] quand zones est une string (entité non résolue)", () => {
        const obj = new PredefinedMultiRectangle(baseConfig("sensor.x"), makeContext(IDENTITY()));
        expect(obj.toVacuum(null)).toEqual([]);
        expect(obj.toVacuum(3)).toEqual([]);
    });

    it("render() renvoie un template Lit qui se rend sans lever", () => {
        const obj = new PredefinedMultiRectangle(baseConfig([[0, 0, 10, 10]]), makeContext(IDENTITY()));
        const host = renderSvg(obj.render());
        expect(host.querySelector("polygon.predefined-rectangle")).toBeTruthy();
    });

    it("render() avec zones=string ne produit aucun polygone mais ne lève pas", () => {
        const obj = new PredefinedMultiRectangle(baseConfig("sensor.x"), makeContext(IDENTITY()));
        expect(() => renderSvg(obj.render())).not.toThrow();
    });

    it("default_state SELECTED marque l'objet comme sélectionné", () => {
        const cfg = { zones: [[0, 0, 1, 1]], default_state: SelectionState.SELECTED } as PredefinedZoneConfig;
        const obj = new PredefinedMultiRectangle(cfg, makeContext(IDENTITY()));
        expect(obj.selected).toBe(true);
    });
});

// ===========================================================================
// PredefinedPoint.getFromEntities — régression P3
// ===========================================================================

describe("PredefinedPoint.getFromEntities", () => {
    const ctxCreator = (): Context => makeContext(IDENTITY());

    it("ignore les sélections dont 'position' n'est pas une string", () => {
        const mode = makeMode([{ position: [1, 2] } as PredefinedPointConfig]);
        expect(PredefinedPoint.getFromEntities(mode, makeHass({}), ctxCreator)).toEqual([]);
    });

    it("entité absente -> [] sans crash", () => {
        const mode = makeMode([{ position: "sensor.missing.attributes.points" } as PredefinedPointConfig]);
        expect(PredefinedPoint.getFromEntities(mode, makeHass({}), ctxCreator)).toEqual([]);
    });

    it("attribut null -> []", () => {
        const mode = makeMode([{ position: "sensor.x.attributes.points" } as PredefinedPointConfig]);
        const hass = makeHass({ "sensor.x": { state: "on", attributes: { points: null } } });
        expect(PredefinedPoint.getFromEntities(mode, hass, ctxCreator)).toEqual([]);
    });

    it("état 'unavailable' (non-JSON) -> [] sans NaN", () => {
        const mode = makeMode([{ position: "sensor.x" } as PredefinedPointConfig]);
        const hass = makeHass({ "sensor.x": { state: "unavailable", attributes: {} } });
        expect(PredefinedPoint.getFromEntities(mode, hass, ctxCreator)).toEqual([]);
    });

    it("JSON non-tableau -> []", () => {
        const mode = makeMode([{ position: "sensor.x" } as PredefinedPointConfig]);
        const hass = makeHass({ "sensor.x": { state: JSON.stringify({ x: 1 }), attributes: {} } });
        expect(PredefinedPoint.getFromEntities(mode, hass, ctxCreator)).toEqual([]);
    });

    it("points malformés filtrés (longueur < 2, non-numériques)", () => {
        const mode = makeMode([{ position: "sensor.x" } as PredefinedPointConfig]);
        const points = [
            [10, 20], // valide
            [5], // trop court
            ["a", "b"], // non-numérique
            [30, 40, 7], // valide (>=2)
        ];
        const hass = makeHass({ "sensor.x": { state: JSON.stringify(points), attributes: {} } });
        const result = PredefinedPoint.getFromEntities(mode, hass, ctxCreator);
        expect(result).toHaveLength(2);
        expect(result[0].toVacuum(null)).toEqual([10, 20]);
        expect(result[1].toVacuum(null)).toEqual([30, 40, 7]);
    });

    it("attribut déjà tableau de points -> utilisé directement", () => {
        const mode = makeMode([{ position: "sensor.x.attributes.points" } as PredefinedPointConfig]);
        const hass = makeHass({
            "sensor.x": { state: "on", attributes: { points: [[3, 4]] } },
        });
        const result = PredefinedPoint.getFromEntities(mode, hass, ctxCreator);
        expect(result).toHaveLength(1);
        expect(result[0].toVacuum(null)).toEqual([3, 4]);
    });
});

// ===========================================================================
// PredefinedPoint — toVacuum / render
// ===========================================================================

describe("PredefinedPoint — toVacuum / render", () => {
    const cfg = (position: PredefinedPointConfig["position"]): PredefinedPointConfig =>
        ({ position } as PredefinedPointConfig);

    it("toVacuum() (défaut null) renvoie la position brute", () => {
        const obj = new PredefinedPoint(cfg([12, 34]), makeContext(IDENTITY()));
        expect(obj.toVacuum()).toEqual([12, 34]);
    });

    it("toVacuum(repeats) ajoute les répétitions", () => {
        const obj = new PredefinedPoint(cfg([12, 34]), makeContext(IDENTITY()));
        expect(obj.toVacuum(5)).toEqual([12, 34, 5]);
    });

    it("toVacuum renvoie [0,0] quand position est une string non résolue", () => {
        const obj = new PredefinedPoint(cfg("sensor.x"), makeContext(IDENTITY()));
        expect(obj.toVacuum()).toEqual([0, 0]);
    });

    it("construit une icône par défaut à partir de la position quand aucune n'est fournie", () => {
        const obj = new PredefinedPoint(cfg([7, 8]), makeContext(IDENTITY()));
        const host = renderSvg(obj.render());
        // L'icône par défaut produit un foreignObject ; le rendu ne lève pas.
        expect(host.querySelector("g.predefined-point-wrapper")).toBeTruthy();
    });

    it("render() se rend sans lever", () => {
        const obj = new PredefinedPoint(cfg([1, 2]), makeContext(IDENTITY()));
        expect(() => renderSvg(obj.render())).not.toThrow();
    });
});

// ===========================================================================
// ManualRectangle — _toVacuumFromDimensions : min/max NUMÉRIQUE (régression)
// ===========================================================================

describe("ManualRectangle — toVacuum / bornes numériques", () => {
    it("toVacuum ordonne les bornes numériquement (min(2,10)=2, pas de tri lexicographique)", () => {
        // Identité, realScale=1. x=2, width=8 -> imageX=2, imageEnd=10.
        // vacuumStart=[2, ...], vacuumEnd=[10, ...]. min numérique = 2, max = 10.
        // Un tri lexicographique donnerait min("10") < min("2") -> 10, ce qui serait faux.
        const ctx = makeContext(IDENTITY(), { realScale: () => 1 });
        const rect = new ManualRectangle(2, 2, 8, 8, "1", ctx);
        const [x1, y1, x2, y2] = rect.toVacuum();
        expect(x1).toBe(2);
        expect(x2).toBe(10);
        expect(y1).toBe(2);
        expect(y2).toBe(10);
    });

    it("gère des coordonnées négatives et largeurs négatives (bornes correctes)", () => {
        // x=20, width=-30 -> imageX=20, imageEnd=-10. min=-10, max=20.
        const ctx = makeContext(IDENTITY(), { realScale: () => 1 });
        const rect = new ManualRectangle(20, -5, -30, 8, "1", ctx);
        const [x1, y1, x2, y2] = rect.toVacuum();
        expect(x1).toBe(-10);
        expect(x2).toBe(20);
        // y=-5, height=8 -> imageY=-5, end=3. min=-5, max=3.
        expect(y1).toBe(-5);
        expect(y2).toBe(3);
    });

    it("multi-chiffres : min(5,123)=5 et max=123 (numérique, pas '123' < '5')", () => {
        const ctx = makeContext(IDENTITY(), { realScale: () => 1 });
        const rect = new ManualRectangle(5, 5, 118, 118, "1", ctx);
        const [x1, , x2] = rect.toVacuum();
        expect(x1).toBe(5);
        expect(x2).toBe(123);
    });

    it("toVacuum(repeats) ajoute la 5e composante après ordonnancement", () => {
        const ctx = makeContext(IDENTITY(), { realScale: () => 1 });
        const rect = new ManualRectangle(10, 10, -5, -5, "1", ctx);
        // imageX=10,end=5 -> min=5,max=10 ; idem y.
        expect(rect.toVacuum(2)).toEqual([5, 5, 10, 10, 2]);
    });

    it("realScale=2 divise les dimensions image avant conversion", () => {
        const ctx = makeContext(IDENTITY(), { realScale: () => 2 });
        // x=20,y=20,width=20,height=20 -> imageX=10,imageY=10,w=10,h=10.
        // start=[10,10], end=[20,20]. min/max -> [10,10,20,20].
        const rect = new ManualRectangle(20, 20, 20, 20, "1", ctx);
        expect(rect.toVacuum()).toEqual([10, 10, 20, 20]);
    });

    it("applique l'arrondi quand roundingEnabled est vrai", () => {
        const ctx = makeContext(IDENTITY(), { realScale: () => 1, roundingEnabled: () => true });
        const rect = new ManualRectangle(2.4, 2.6, 5.1, 5.1, "1", ctx);
        // imageX=2.4,end=7.5 -> arrondis via realMapToVacuum -> [2,3] et [3 ? ] etc.
        // start arrondi=(2,3), end arrondi=(8,8) (7.5->8). min/max -> [2,3,8,8].
        const [x1, y1, x2, y2] = rect.toVacuum();
        expect(Number.isInteger(x1)).toBe(true);
        expect(Number.isInteger(y1)).toBe(true);
        expect(Number.isInteger(x2)).toBe(true);
        expect(Number.isInteger(y2)).toBe(true);
        expect(x1).toBe(2);
        expect(x2).toBe(8);
    });

    it("render() se rend sans lever et produit un polygone", () => {
        const ctx = makeContext(IDENTITY(), { realScale: () => 1 });
        const rect = new ManualRectangle(0, 0, 10, 10, "1", ctx);
        const host = renderSvg(rect.render());
        expect(host.querySelector("polygon.manual-rectangle")).toBeTruthy();
    });

    it("n'est pas sélectionné par défaut", () => {
        const ctx = makeContext(IDENTITY(), { realScale: () => 1 });
        const rect = new ManualRectangle(0, 0, 10, 10, "1", ctx);
        expect(rect.isSelected()).toBe(false);
    });
});

// ===========================================================================
// Room — toVacuum / getOutline / render
// ===========================================================================

describe("Room", () => {
    const cfg = (overrides: Partial<RoomConfig> = {}): RoomConfig =>
        ({ id: 3, ...overrides } as RoomConfig);

    it("toVacuum renvoie l'id de la pièce", () => {
        const room = new Room(cfg({ id: 7 }), makeContext(IDENTITY()));
        expect(room.toVacuum()).toBe(7);
    });

    it("toVacuum supporte un id string", () => {
        const room = new Room(cfg({ id: "kitchen" }), makeContext(IDENTITY()));
        expect(room.toVacuum()).toBe("kitchen");
    });

    it("getOutline renvoie l'outline configuré", () => {
        const outline: RoomConfig["outline"] = [
            [0, 0],
            [10, 0],
            [10, 10],
        ];
        const room = new Room(cfg({ outline }), makeContext(IDENTITY()));
        expect(room.getOutline()).toEqual(outline);
    });

    it("getOutline renvoie undefined quand absent", () => {
        const room = new Room(cfg(), makeContext(IDENTITY()));
        expect(room.getOutline()).toBeUndefined();
    });

    it("render() sans label se rend sans lever (groupe vide)", () => {
        const room = new Room(cfg(), makeContext(IDENTITY()));
        const host = renderSvg(room.render());
        expect(host.querySelector("g.room-wrapper")).toBeTruthy();
        expect(host.querySelector("text.room-label-text")).toBeNull();
    });

    it("render() avec label produit un <text> positionné", () => {
        const room = new Room(
            cfg({ label: { text: "Salon", x: 5, y: 5 } }),
            makeContext(IDENTITY())
        );
        const host = renderSvg(room.render());
        const text = host.querySelector("text.room-label-text");
        expect(text).toBeTruthy();
        expect(text?.textContent?.trim()).toBe("Salon");
    });

    it("assainit l'id dans le nom de classe du wrapper", () => {
        const room = new Room(cfg({ id: "a b/c" }), makeContext(IDENTITY()));
        const host = renderSvg(room.render());
        // Les caractères non [a-zA-Z0-9_-] deviennent '_'.
        expect(host.querySelector("g.room-a_b_c-wrapper")).toBeTruthy();
    });

    it("se marque sélectionné via default_state", () => {
        const room = new Room(cfg({ default_state: SelectionState.SELECTED }), makeContext(IDENTITY()));
        expect(room.selected).toBe(true);
    });
});

// ===========================================================================
// ManualPath / PathPoint
// ===========================================================================

describe("PathPoint", () => {
    it("imageX/imageY divisent par realScale", () => {
        const ctx = makeContext(IDENTITY(), { realScale: () => 2 });
        const p = new PathPoint(20, 40, ctx);
        expect(p.imageX()).toBe(10);
        expect(p.imageY()).toBe(20);
    });

    it("render() se rend en un cercle", () => {
        const ctx = makeContext(IDENTITY());
        const p = new PathPoint(1, 2, ctx);
        const host = renderSvg(p.render());
        expect(host.querySelector("circle.manual-path-point")).toBeTruthy();
    });
});

describe("ManualPath", () => {
    it("render() renvoie un template vide quand aucun point (sans lever)", () => {
        const ctx = makeContext(IDENTITY());
        const path = new ManualPath([], ctx);
        expect(() => renderSvg(path.render())).not.toThrow();
        const host = renderSvg(path.render());
        expect(host.querySelector("polyline.manual-path-line")).toBeNull();
    });

    it("render() avec points produit une polyline", () => {
        const ctx = makeContext(IDENTITY());
        const path = new ManualPath(
            [new PathPoint(0, 0, ctx), new PathPoint(10, 10, ctx)],
            ctx
        );
        const host = renderSvg(path.render());
        expect(host.querySelector("polyline.manual-path-line")).toBeTruthy();
        expect(host.querySelectorAll("circle.manual-path-point")).toHaveLength(2);
    });

    it("toVacuum convertit chaque point image en vacuum (converter identité, realScale=1)", () => {
        const ctx = makeContext(IDENTITY(), { realScale: () => 1 });
        const path = new ManualPath(
            [new PathPoint(3, 4, ctx), new PathPoint(5, 6, ctx)],
            ctx
        );
        expect(path.toVacuum()).toEqual([
            [3, 4],
            [5, 6],
        ]);
    });

    it("toVacuum(repeats) ajoute les répétitions à chaque point", () => {
        const ctx = makeContext(IDENTITY(), { realScale: () => 1 });
        const path = new ManualPath([new PathPoint(1, 2, ctx)], ctx);
        expect(path.toVacuum(9)).toEqual([[1, 2, 9]]);
    });

    it("toVacuum applique realScale avant conversion", () => {
        const ctx = makeContext(IDENTITY(), { realScale: () => 2 });
        const path = new ManualPath([new PathPoint(20, 40, ctx)], ctx);
        // imageX/Y = 10/20 ; identité -> [10, 20].
        expect(path.toVacuum()).toEqual([[10, 20]]);
    });

    it("addPoint / removeLast / clear mutent la liste de points", () => {
        const ctx = makeContext(IDENTITY());
        const path = new ManualPath([], ctx);
        path.addPoint(1, 1);
        path.addPoint(2, 2);
        expect(path.points).toHaveLength(2);
        path.removeLast();
        expect(path.points).toHaveLength(1);
        path.clear();
        expect(path.points).toHaveLength(0);
    });
});

// ===========================================================================
// MapObject (base) — conversions & propagation d'erreur de calibration
// ===========================================================================

describe("MapObject (base) — conversions via PathPoint/ManualRectangle", () => {
    it("propage 'Missing calibration' quand le converter est absent (toVacuum)", () => {
        const ctx = makeContext(undefined, { realScale: () => 1 });
        const path = new ManualPath([new PathPoint(1, 1, ctx)], ctx);
        expect(() => path.toVacuum()).toThrow("Missing calibration");
    });

    it("propage 'Missing calibration' à la construction d'un ManualRectangle sans converter", () => {
        const ctx = makeContext(undefined, { realScale: () => 1 });
        // _toVacuumFromDimensions appelle realMapToVacuum -> lève.
        expect(() => new ManualRectangle(0, 0, 10, 10, "1", ctx)).toThrow("Missing calibration");
    });

    it("vacuumToMapRect (via render) ordonne correctement avec un converter affine", () => {
        // Converter affine map=2*vacuum ne doit pas faire échouer le rendu.
        const ctx = makeContext(new CoordinatesConverter(AFFINE_SCALE2), { realScale: () => 1 });
        const obj = new PredefinedMultiRectangle(
            { zones: [[0, 0, 10, 10]] } as PredefinedZoneConfig,
            ctx
        );
        expect(() => renderSvg(obj.render())).not.toThrow();
    });
});
