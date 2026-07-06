import { describe, it, expect, vi } from "vitest";
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
import { SelectionType } from "../src/model/map_mode/selection-type";
import { HomeAssistantFixed } from "../src/types/fixes";
import {
    CalibrationPoint,
    LabelConfig,
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

// ===========================================================================
// MapObject.renderLabel — badge de texte réel (config non nulle)
// ===========================================================================

describe("MapObject.renderLabel (via PredefinedPoint)", () => {
    it("produit un badge <div class='label-badge'> avec le texte configuré", () => {
        const ctx = makeContext(IDENTITY());
        const label: LabelConfig = { text: "Cuisine", x: 5, y: 5, offset_x: 2, offset_y: -2 };
        const obj = new PredefinedPoint({ position: [5, 5], label } as PredefinedPointConfig, ctx);
        const host = renderSvg(obj.render());
        const badge = host.querySelector(".label-badge.predefined-point-label");
        expect(badge?.textContent?.trim()).toBe("Cuisine");
    });

    it("ne produit aucun badge quand label est absent", () => {
        const ctx = makeContext(IDENTITY());
        const obj = new PredefinedPoint({ position: [5, 5] } as PredefinedPointConfig, ctx);
        const host = renderSvg(obj.render());
        expect(host.querySelector(".label-badge")).toBeNull();
    });
});

// ===========================================================================
// Room.toggleFromHitTest — activation du mode room, sélection, limites, revert
// ===========================================================================

describe("Room.toggleFromHitTest", () => {
    const cfg = (overrides: Partial<RoomConfig> = {}): RoomConfig => ({ id: 1, ...overrides }) as RoomConfig;

    it("bascule directement la sélection quand le mode courant est déjà ROOM", async () => {
        const rooms: Room[] = [];
        const ctx = makeContext(IDENTITY(), {
            getCurrentMode: () => ({ selectionType: SelectionType.ROOM }) as unknown as MapMode,
            selectedRooms: () => rooms,
        });
        const room = new Room(cfg({ id: 5 }), ctx);
        await room.toggleFromHitTest();
        expect(room.selected).toBe(true);
        expect(rooms).toEqual([room]);
    });

    it("désélectionne une pièce déjà sélectionnée (retrait du tableau)", async () => {
        const rooms: Room[] = [];
        const ctx = makeContext(IDENTITY(), {
            getCurrentMode: () => ({ selectionType: SelectionType.ROOM }) as unknown as MapMode,
            selectedRooms: () => rooms,
        });
        const room = new Room(cfg({ id: 2, default_state: SelectionState.SELECTED }), ctx);
        rooms.push(room);
        expect(room.selected).toBe(true);
        await room.toggleFromHitTest();
        expect(room.selected).toBe(false);
        expect(rooms).toEqual([]);
    });

    it("refuse la sélection quand maxSelections est atteint (haptic failure)", async () => {
        const hapticSpy = vi.fn();
        window.addEventListener("haptic", hapticSpy);
        const rooms: Room[] = [];
        const ctx = makeContext(IDENTITY(), {
            getCurrentMode: () => ({ selectionType: SelectionType.ROOM }) as unknown as MapMode,
            selectedRooms: () => rooms,
            maxSelections: () => 0,
        });
        const room = new Room(cfg(), ctx);
        await room.toggleFromHitTest();
        expect(room.selected).toBe(false);
        expect(rooms).toEqual([]);
        expect(hapticSpy).toHaveBeenCalledOnce();
        expect((hapticSpy.mock.calls[0][0] as CustomEvent).detail).toBe("failure");
        window.removeEventListener("haptic", hapticSpy);
    });

    it("annule la sélection quand runImmediately résout true (exécution immédiate)", async () => {
        const rooms: Room[] = [];
        const selectionChanged = vi.fn();
        const ctx = makeContext(IDENTITY(), {
            getCurrentMode: () => ({ selectionType: SelectionType.ROOM }) as unknown as MapMode,
            selectedRooms: () => rooms,
            runImmediately: () => Promise.resolve(true),
            selectionChanged,
        });
        const room = new Room(cfg({ id: 9 }), ctx);
        await room.toggleFromHitTest();
        expect(room.selected).toBe(false);
        expect(rooms).toEqual([]);
        expect(selectionChanged).toHaveBeenCalledTimes(2);
    });

    it("traite un rejet de runImmediately comme un skip (comportement normal, pas de revert)", async () => {
        const rooms: Room[] = [];
        const ctx = makeContext(IDENTITY(), {
            getCurrentMode: () => ({ selectionType: SelectionType.ROOM }) as unknown as MapMode,
            selectedRooms: () => rooms,
            runImmediately: () => Promise.reject(new Error("boom")),
        });
        const room = new Room(cfg(), ctx);
        await room.toggleFromHitTest();
        expect(room.selected).toBe(true);
        expect(rooms).toEqual([room]);
    });

    it("active le mode room automatiquement quand le mode courant n'est pas ROOM, puis procède", async () => {
        vi.useFakeTimers();
        try {
            let currentMode: MapMode | undefined = undefined;
            const activateRoomMode = vi.fn(() => {
                currentMode = { selectionType: SelectionType.ROOM } as unknown as MapMode;
            });
            const rooms: Room[] = [];
            const ctx = makeContext(IDENTITY(), {
                getCurrentMode: () => currentMode,
                activateRoomMode,
                selectedRooms: () => rooms,
            });
            const room = new Room(cfg(), ctx);
            const promise = room.toggleFromHitTest();
            await vi.advanceTimersByTimeAsync(150);
            await promise;
            expect(activateRoomMode).toHaveBeenCalledOnce();
            expect(room.selected).toBe(true);
            expect(rooms).toContain(room);
        } finally {
            vi.useRealTimers();
        }
    });

    it("n'active pas la sélection si le mode room ne s'active pas (early return)", async () => {
        vi.useFakeTimers();
        try {
            const activateRoomMode = vi.fn(); // ne change jamais le mode courant
            const ctx = makeContext(IDENTITY(), {
                getCurrentMode: () => undefined,
                activateRoomMode,
            });
            const room = new Room(cfg(), ctx);
            const promise = room.toggleFromHitTest();
            await vi.advanceTimersByTimeAsync(150);
            await promise;
            expect(activateRoomMode).toHaveBeenCalledOnce();
            expect(room.selected).toBe(false);
        } finally {
            vi.useRealTimers();
        }
    });
});

// ===========================================================================
// PredefinedMapObject (état commun : state_entity / deselect / isDynamic)
// ===========================================================================

describe("PredefinedMapObject (état commun) — via Room", () => {
    it("state_entity présent : l'état initial suit getState() ('on' => sélectionné)", () => {
        const ctx = makeContext(IDENTITY(), { getState: () => "on" });
        const room = new Room({ id: 1, state_entity: "input_boolean.x" } as RoomConfig, ctx);
        expect(room.selected).toBe(true);
        expect(room.isDynamic()).toBe(true);
    });

    it("state_entity présent mais état != 'on' => non sélectionné", () => {
        const ctx = makeContext(IDENTITY(), { getState: () => "off" });
        const room = new Room({ id: 1, state_entity: "input_boolean.x" } as RoomConfig, ctx);
        expect(room.selected).toBe(false);
    });

    it("isDynamic() est false sans state_entity", () => {
        const room = new Room({ id: 1 } as RoomConfig, makeContext(IDENTITY()));
        expect(room.isDynamic()).toBe(false);
    });

    it("deselect() force l'état non sélectionné", () => {
        const room = new Room(
            { id: 1, default_state: SelectionState.SELECTED } as RoomConfig,
            makeContext(IDENTITY())
        );
        expect(room.selected).toBe(true);
        room.deselect();
        expect(room.selected).toBe(false);
    });

    it("_toggleSelected avec state_entity appelle toggleEntity et suit l'inverse de l'état courant", () => {
        const toggleEntity = vi.fn();
        const ctx = makeContext(IDENTITY(), { getState: () => "off", toggleEntity });
        const room = new Room({ id: 1, state_entity: "input_boolean.x" } as RoomConfig, ctx);
        expect(room.selected).toBe(false);
        (room as unknown as { _toggleSelected(): void })._toggleSelected();
        expect(toggleEntity).toHaveBeenCalledWith("input_boolean.x");
        expect(room.selected).toBe(true);
    });

    it("variables renvoie config.variables si fourni, sinon l'objet vide par défaut", () => {
        const withVars = new Room({ id: 1, variables: { foo: "bar" } } as RoomConfig, makeContext(IDENTITY()));
        expect(withVars.variables).toEqual({ foo: "bar" });
        const withoutVars = new Room({ id: 1 } as RoomConfig, makeContext(IDENTITY()));
        expect(withoutVars.variables).toEqual({});
    });
});

// ===========================================================================
// PredefinedPoint._click — sélection unique, remplacement, revert
// ===========================================================================

describe("PredefinedPoint._click (sélection exclusive)", () => {
    function click(point: PredefinedPoint): Promise<void> {
        return (point as unknown as { _click(): Promise<void> })._click();
    }

    it("sélectionne un point sans sélection préalable", async () => {
        const selected: PredefinedPoint[] = [];
        const ctx = makeContext(IDENTITY(), { selectedPredefinedPoint: () => selected });
        const point = new PredefinedPoint({ position: [1, 1] } as PredefinedPointConfig, ctx);
        await click(point);
        expect(point.selected).toBe(true);
        expect(selected).toEqual([point]);
    });

    it("remplace le point précédemment sélectionné (sélection exclusive)", async () => {
        const selected: PredefinedPoint[] = [];
        const ctx = makeContext(IDENTITY(), { selectedPredefinedPoint: () => selected });
        const first = new PredefinedPoint({ position: [1, 1] } as PredefinedPointConfig, ctx);
        const second = new PredefinedPoint({ position: [2, 2] } as PredefinedPointConfig, ctx);
        await click(first);
        expect(selected).toEqual([first]);
        await click(second);
        expect(first.selected).toBe(false);
        expect(second.selected).toBe(true);
        expect(selected).toEqual([second]);
    });

    it("désélectionne un point déjà sélectionné", async () => {
        const selected: PredefinedPoint[] = [];
        const ctx = makeContext(IDENTITY(), { selectedPredefinedPoint: () => selected });
        const point = new PredefinedPoint(
            { position: [1, 1], default_state: SelectionState.SELECTED } as PredefinedPointConfig,
            ctx
        );
        selected.push(point);
        await click(point);
        expect(point.selected).toBe(false);
        expect(selected).toEqual([]);
    });

    it("annule la sélection quand runImmediately résout true", async () => {
        const selected: PredefinedPoint[] = [];
        const ctx = makeContext(IDENTITY(), {
            selectedPredefinedPoint: () => selected,
            runImmediately: () => Promise.resolve(true),
        });
        const point = new PredefinedPoint({ position: [1, 1] } as PredefinedPointConfig, ctx);
        await click(point);
        expect(point.selected).toBe(false);
        expect(selected).toEqual([]);
    });

    it("traite un rejet de runImmediately comme un skip", async () => {
        const selected: PredefinedPoint[] = [];
        const ctx = makeContext(IDENTITY(), {
            selectedPredefinedPoint: () => selected,
            runImmediately: () => Promise.reject(new Error("boom")),
        });
        const point = new PredefinedPoint({ position: [1, 1] } as PredefinedPointConfig, ctx);
        await click(point);
        expect(point.selected).toBe(true);
        expect(selected).toEqual([point]);
    });
});

// ===========================================================================
// PredefinedMultiRectangle._click — limite maxSelections, sélection, revert
// ===========================================================================

describe("PredefinedMultiRectangle._click", () => {
    function click(zone: PredefinedMultiRectangle): Promise<void> {
        return (zone as unknown as { _click(): Promise<void> })._click();
    }

    it("refuse la sélection au-delà de maxSelections (haptic failure)", async () => {
        const hapticSpy = vi.fn();
        window.addEventListener("haptic", hapticSpy);
        const selected: PredefinedMultiRectangle[] = [];
        const ctx = makeContext(IDENTITY(), {
            selectedPredefinedRectangles: () => selected,
            maxSelections: () => 0,
        });
        const zone = new PredefinedMultiRectangle({ zones: [[0, 0, 1, 1]] } as PredefinedZoneConfig, ctx);
        await click(zone);
        expect(zone.selected).toBe(false);
        expect(selected).toEqual([]);
        expect(hapticSpy).toHaveBeenCalledOnce();
        expect((hapticSpy.mock.calls[0][0] as CustomEvent).detail).toBe("failure");
        window.removeEventListener("haptic", hapticSpy);
    });

    it("sélectionne la zone et l'ajoute à selectedPredefinedRectangles", async () => {
        const selected: PredefinedMultiRectangle[] = [];
        const update = vi.fn();
        const ctx = makeContext(IDENTITY(), { selectedPredefinedRectangles: () => selected, update });
        const zone = new PredefinedMultiRectangle({ zones: [[0, 0, 1, 1]] } as PredefinedZoneConfig, ctx);
        await click(zone);
        expect(zone.selected).toBe(true);
        expect(selected).toEqual([zone]);
        expect(update).toHaveBeenCalledOnce();
    });

    it("désélectionne une zone déjà sélectionnée", async () => {
        const selected: PredefinedMultiRectangle[] = [];
        const ctx = makeContext(IDENTITY(), { selectedPredefinedRectangles: () => selected });
        const zone = new PredefinedMultiRectangle(
            { zones: [[0, 0, 1, 1]], default_state: SelectionState.SELECTED } as PredefinedZoneConfig,
            ctx
        );
        selected.push(zone);
        await click(zone);
        expect(zone.selected).toBe(false);
        expect(selected).toEqual([]);
    });

    it("annule la sélection quand runImmediately résout true", async () => {
        const selected: PredefinedMultiRectangle[] = [];
        const ctx = makeContext(IDENTITY(), {
            selectedPredefinedRectangles: () => selected,
            runImmediately: () => Promise.resolve(true),
        });
        const zone = new PredefinedMultiRectangle({ zones: [[0, 0, 1, 1]] } as PredefinedZoneConfig, ctx);
        await click(zone);
        expect(zone.selected).toBe(false);
        expect(selected).toEqual([]);
    });

    it("le clic réel sur le polygone rendu déclenche la sélection", async () => {
        const selected: PredefinedMultiRectangle[] = [];
        const ctx = makeContext(IDENTITY(), { selectedPredefinedRectangles: () => selected });
        const zone = new PredefinedMultiRectangle({ zones: [[0, 0, 10, 10]] } as PredefinedZoneConfig, ctx);
        const host = renderSvg(zone.render());
        const polygon = host.querySelector("polygon.predefined-rectangle") as SVGElement;
        expect(polygon).toBeTruthy();
        polygon.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        // _click() est asynchrone (await runImmediately()) : laisser les microtâches s'écouler.
        await new Promise((resolve) => setTimeout(resolve, 0));
        expect(zone.selected).toBe(true);
        expect(selected).toEqual([zone]);
    });
});

// ===========================================================================
// ManualRectangle — drag / resize / delete via événements souris réels
// ===========================================================================

describe("ManualRectangle — événements souris (drag/resize/delete)", () => {
    /** Contexte de drag avec position de souris pilotable manuellement. */
    function makeDragContext(overrides: Partial<ContextOptions> = {}): {
        ctx: Context;
        setPos: (x: number, y: number) => void;
    } {
        let pos = new MousePosition(0, 0);
        const ctx = makeContext(IDENTITY(), {
            realScale: () => 1,
            mousePositionCalculator: () => pos,
            ...overrides,
        });
        return { ctx, setPos: (x, y) => (pos = new MousePosition(x, y)) };
    }

    it("mousedown sur le polygone déplaçable sélectionne le rectangle et déclenche update()", () => {
        const update = vi.fn();
        const { ctx, setPos } = makeDragContext({ update });
        const rect = new ManualRectangle(0, 0, 10, 10, "1", ctx);
        const host = renderSvg(rect.render());
        const polygon = host.querySelector("polygon.manual-rectangle") as SVGElement;
        expect(rect.isSelected()).toBe(false);
        setPos(0, 0);
        polygon.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
        expect(rect.isSelected()).toBe(true);
        expect(update).toHaveBeenCalledOnce();
    });

    it("un déplacement (MOVE) translate le rectangle du diff souris, endDrag désélectionne", () => {
        const { ctx, setPos } = makeDragContext();
        const rect = new ManualRectangle(0, 0, 10, 10, "1", ctx);
        const host = renderSvg(rect.render());
        const polygon = host.querySelector("polygon.manual-rectangle") as SVGElement;

        setPos(0, 0);
        polygon.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
        const pointsBefore = polygon.getAttribute("points");

        setPos(5, 7);
        polygon.dispatchEvent(new MouseEvent("mousemove", { bubbles: true }));
        expect(rect.toVacuum()).toEqual([5, 7, 15, 17]);
        expect(polygon.getAttribute("points")).not.toBe(pointsBefore);

        polygon.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
        expect(rect.isSelected()).toBe(false);
        // La position finale reste celle du dernier déplacement.
        expect(rect.toVacuum()).toEqual([5, 7, 15, 17]);
    });

    it("externalDrag() délègue à la logique de drag interne (même effet qu'un mousemove)", () => {
        const { ctx, setPos } = makeDragContext();
        const rect = new ManualRectangle(0, 0, 10, 10, "1", ctx);
        const host = renderSvg(rect.render());
        const polygon = host.querySelector("polygon.manual-rectangle") as SVGElement;

        setPos(0, 0);
        polygon.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
        setPos(2, 3);
        rect.externalDrag(new MouseEvent("mousemove"));
        expect(rect.toVacuum()).toEqual([2, 3, 12, 13]);
    });

    it("un redimensionnement (RESIZE) déplace le coin opposé à l'ancre", () => {
        const { ctx, setPos } = makeDragContext();
        const rect = new ManualRectangle(0, 0, 10, 10, "1", ctx);
        const host = renderSvg(rect.render());
        const resizer = host.querySelector("circle.manual-rectangle-resize-circle") as SVGElement;

        setPos(0, 0);
        resizer.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
        setPos(5, 7);
        resizer.dispatchEvent(new MouseEvent("mousemove", { bubbles: true }));
        expect(rect.toVacuum()).toEqual([0, 0, 15, 17]);
    });

    it("un redimensionnement qui inverserait les bornes est annulé (retour à l'état précédent)", () => {
        const { ctx, setPos } = makeDragContext();
        const rect = new ManualRectangle(0, 0, 10, 10, "1", ctx);
        const host = renderSvg(rect.render());
        const resizer = host.querySelector("circle.manual-rectangle-resize-circle") as SVGElement;

        setPos(0, 0);
        resizer.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
        // diffX = -20 : le coin passerait de l'autre côté de l'ancre -> inversion refusée.
        setPos(-20, 0);
        resizer.dispatchEvent(new MouseEvent("mousemove", { bubbles: true }));
        expect(rect.toVacuum()).toEqual([0, 0, 10, 10]);
    });

    it("mousedown sur un élément non draggable est ignoré", () => {
        const { ctx } = makeDragContext();
        const rect = new ManualRectangle(0, 0, 10, 10, "1", ctx);
        const host = renderSvg(rect.render());
        const description = host.querySelector("g.manual-rectangle-description") as SVGElement;
        description.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
        expect(rect.isSelected()).toBe(false);
    });

    it("mousedown sur un élément draggable dont le parent n'est pas le wrapper est ignoré", () => {
        const { ctx } = makeDragContext();
        const rect = new ManualRectangle(0, 0, 10, 10, "1", ctx);
        const fakeEl = document.createElement("div");
        fakeEl.classList.add("draggable");
        const wrongParent = document.createElement("div");
        wrongParent.appendChild(fakeEl);
        const ev = new MouseEvent("mousedown");
        Object.defineProperty(ev, "target", { value: fakeEl });
        (rect as unknown as { _startDrag(e: MouseEvent): void })._startDrag(ev);
        expect(rect.isSelected()).toBe(false);
    });

    it("un touchstart multi-doigts (>1) est ignoré (pas de démarrage de drag)", () => {
        const { ctx } = makeDragContext();
        const rect = new ManualRectangle(0, 0, 10, 10, "1", ctx);
        const host = renderSvg(rect.render());
        const polygon = host.querySelector("polygon.manual-rectangle") as SVGElement;
        const touchEvent = new TouchEvent("touchstart", {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            touches: [{}, {}] as any,
            bubbles: true,
        });
        polygon.dispatchEvent(touchEvent);
        expect(rect.isSelected()).toBe(false);
    });

    it("_drag ne fait rien si aucun élément n'est actuellement sélectionné (pas de mousedown préalable)", () => {
        const { ctx, setPos } = makeDragContext();
        const rect = new ManualRectangle(0, 0, 10, 10, "1", ctx);
        const host = renderSvg(rect.render());
        const polygon = host.querySelector("polygon.manual-rectangle") as SVGElement;
        setPos(5, 5);
        polygon.dispatchEvent(new MouseEvent("mousemove", { bubbles: true }));
        expect(rect.toVacuum()).toEqual([0, 0, 10, 10]);
    });

    it("_getDimensions renvoie une chaîne vide quand coordinatesToMetersDivider vaut -1", () => {
        const ctx = makeContext(IDENTITY(), { realScale: () => 1, coordinatesToMetersDivider: () => -1 });
        const rect = new ManualRectangle(0, 0, 10, 10, "7", ctx);
        const host = renderSvg(rect.render());
        const text = host.querySelector("g.manual-rectangle-description text");
        expect(text?.textContent?.trim()).toBe("7");
    });

    it("le clic sur le cercle de suppression retire le rectangle et renumérote les suivants", () => {
        const rects: ManualRectangle[] = [];
        const update = vi.fn();
        const ctx = makeContext(IDENTITY(), { realScale: () => 1, selectedManualRectangles: () => rects, update });
        const rectA = new ManualRectangle(0, 0, 1, 1, "1", ctx);
        const rectB = new ManualRectangle(0, 0, 1, 1, "2", ctx);
        const rectC = new ManualRectangle(0, 0, 1, 1, "3", ctx);
        rects.push(rectA, rectB, rectC);

        const hapticSpy = vi.fn();
        window.addEventListener("haptic", hapticSpy);
        const host = renderSvg(rectB.render());
        const deleteCircle = host.querySelector("circle.manual-rectangle-delete-circle") as SVGElement;
        deleteCircle.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
        window.removeEventListener("haptic", hapticSpy);

        expect(rects).toEqual([rectA, rectC]);
        expect(rectC._id).toBe("2");
        expect(hapticSpy).toHaveBeenCalledOnce();
        expect(update).toHaveBeenCalledOnce();
    });

    it("le clic sur le cercle de suppression ne fait rien si le rectangle n'est pas dans la sélection", () => {
        const update = vi.fn();
        const ctx = makeContext(IDENTITY(), { realScale: () => 1, selectedManualRectangles: () => [], update });
        const rect = new ManualRectangle(0, 0, 1, 1, "1", ctx);
        const host = renderSvg(rect.render());
        const deleteCircle = host.querySelector("circle.manual-rectangle-delete-circle") as SVGElement;
        deleteCircle.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
        expect(update).not.toHaveBeenCalled();
    });
});
