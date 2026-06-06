import { describe, it, expect } from "vitest";

import { CoordinatesConverter } from "../src/model/map_objects/coordinates-converter";
import { Context, ContextOptions } from "../src/model/map_objects/context";
import { ManualPoint } from "../src/model/map_objects/manual-point";
import { MousePosition } from "../src/model/map_objects/mouse-position";
import { CalibrationPoint } from "../src/types/types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** 3 points => mode AFFINE. Calibration map = 2 * vacuum (échelle pure, sans rotation). */
const AFFINE_SCALE2: CalibrationPoint[] = [
    { vacuum: { x: 0, y: 0 }, map: { x: 0, y: 0 } },
    { vacuum: { x: 100, y: 0 }, map: { x: 200, y: 0 } },
    { vacuum: { x: 0, y: 100 }, map: { x: 0, y: 200 } },
];

/** 3 points => AFFINE avec translation (map = vacuum + (10,20)). */
const AFFINE_TRANSLATE: CalibrationPoint[] = [
    { vacuum: { x: 0, y: 0 }, map: { x: 10, y: 20 } },
    { vacuum: { x: 100, y: 0 }, map: { x: 110, y: 20 } },
    { vacuum: { x: 0, y: 100 }, map: { x: 10, y: 120 } },
];

/** 4 points => mode PERSPECTIVE (quad non rectangulaire pour exercer la projection). */
const PERSPECTIVE_QUAD: CalibrationPoint[] = [
    { vacuum: { x: -1000, y: -1000 }, map: { x: 0, y: 0 } },
    { vacuum: { x: 1000, y: -1000 }, map: { x: 500, y: 10 } },
    { vacuum: { x: 1000, y: 1000 }, map: { x: 520, y: 480 } },
    { vacuum: { x: -1000, y: 1000 }, map: { x: 5, y: 495 } },
];

/**
 * Construit un Context minimal autour d'un CoordinatesConverter donné.
 * Seuls realScale / coordinatesConverter / roundingEnabled sont réellement exercés
 * par ManualPoint ; le reste est rempli avec des no-op castés.
 */
function makeContext(
    converter: CoordinatesConverter | undefined,
    overrides: Partial<ContextOptions> = {}
): Context {
    const options: ContextOptions = {
        scale: () => 1,
        realScale: () => 2,
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
        maxSelections: () => 1,
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

// ---------------------------------------------------------------------------
// CoordinatesConverter — mode AFFINE (3 points de calibration)
// ---------------------------------------------------------------------------

describe("CoordinatesConverter — AFFINE (3 points)", () => {
    it("se marque calibré et expose les deux matrices", () => {
        const cc = new CoordinatesConverter(AFFINE_SCALE2);
        expect(cc.calibrated).toBe(true);
        expect(cc.transformMode).toBe(0); // TransformMode.AFFINE
        expect(cc.mapToVacuumMatrix).toBeDefined();
        expect(cc.vacuumToMapMatrix).toBeDefined();
        // Le mode perspective n'est pas utilisé.
        expect(cc.transformMode).not.toBe(1);
    });

    it("applique l'échelle map = 2 * vacuum dans vacuumToMap", () => {
        const cc = new CoordinatesConverter(AFFINE_SCALE2);
        expect(cc.vacuumToMap(50, 50)).toEqual([100, 100]);
        expect(cc.vacuumToMap(0, 0)).toEqual([0, 0]);
        expect(cc.vacuumToMap(10, 20)).toEqual([20, 40]);
    });

    it("applique l'inverse vacuum = map / 2 dans mapToVacuum", () => {
        const cc = new CoordinatesConverter(AFFINE_SCALE2);
        expect(cc.mapToVacuum(100, 100)).toEqual([50, 50]);
        expect(cc.mapToVacuum(20, 40)).toEqual([10, 20]);
    });

    it("gère une calibration purement translationnelle", () => {
        const cc = new CoordinatesConverter(AFFINE_TRANSLATE);
        // map = vacuum + (10, 20)
        expect(cc.vacuumToMap(50, 50)).toEqual([60, 70]);
        expect(cc.mapToVacuum(60, 70)).toEqual([50, 50]);
    });

    it("est cohérent en aller-retour vacuum -> map -> vacuum", () => {
        const cc = new CoordinatesConverter(AFFINE_TRANSLATE);
        const samples: Array<[number, number]> = [
            [0, 0],
            [37, -12],
            [-450, 980],
            [1234.5, -6789.25],
        ];
        for (const [x, y] of samples) {
            const [mx, my] = cc.vacuumToMap(x, y);
            const [vx, vy] = cc.mapToVacuum(mx, my);
            expect(vx).toBeCloseTo(x, 9);
            expect(vy).toBeCloseTo(y, 9);
        }
    });

    it("est cohérent en aller-retour map -> vacuum -> map", () => {
        const cc = new CoordinatesConverter(AFFINE_SCALE2);
        const samples: Array<[number, number]> = [
            [0, 0],
            [200, 400],
            [-15.5, 88.25],
        ];
        for (const [x, y] of samples) {
            const [vx, vy] = cc.mapToVacuum(x, y);
            const [mx, my] = cc.vacuumToMap(vx, vy);
            expect(mx).toBeCloseTo(x, 9);
            expect(my).toBeCloseTo(y, 9);
        }
    });
});

// ---------------------------------------------------------------------------
// CoordinatesConverter — mode PERSPECTIVE (4 points de calibration)
// ---------------------------------------------------------------------------

describe("CoordinatesConverter — PERSPECTIVE (4 points)", () => {
    it("se marque calibré en mode perspective", () => {
        const cc = new CoordinatesConverter(PERSPECTIVE_QUAD);
        expect(cc.calibrated).toBe(true);
        expect(cc.transformMode).toBe(1); // TransformMode.PERSPECTIVE
        // En perspective, les matrices affines ne sont pas construites.
        expect(cc.mapToVacuumMatrix).toBeUndefined();
        expect(cc.vacuumToMapMatrix).toBeUndefined();
    });

    it("mappe les sommets de calibration vers leurs cibles map", () => {
        const cc = new CoordinatesConverter(PERSPECTIVE_QUAD);
        const [mx, my] = cc.vacuumToMap(-1000, -1000);
        expect(mx).toBeCloseTo(0, 3);
        expect(my).toBeCloseTo(0, 3);
        const [mx2, my2] = cc.vacuumToMap(1000, 1000);
        expect(mx2).toBeCloseTo(520, 3);
        expect(my2).toBeCloseTo(480, 3);
    });

    it("est cohérent en aller-retour vacuum -> map -> vacuum (tolérance projective)", () => {
        const cc = new CoordinatesConverter(PERSPECTIVE_QUAD);
        const samples: Array<[number, number]> = [
            [0, 0],
            [123, -456],
            [-789, 321],
            [500, 500],
        ];
        for (const [x, y] of samples) {
            const [mx, my] = cc.vacuumToMap(x, y);
            const [vx, vy] = cc.mapToVacuum(mx, my);
            // La transformation perspective introduit une légère erreur numérique.
            expect(vx).toBeCloseTo(x, 2);
            expect(vy).toBeCloseTo(y, 2);
        }
    });

    it("rend un mapping rectangulaire trivial fidèle (map = 2 * vacuum)", () => {
        const square: CalibrationPoint[] = [
            { vacuum: { x: 0, y: 0 }, map: { x: 0, y: 0 } },
            { vacuum: { x: 100, y: 0 }, map: { x: 200, y: 0 } },
            { vacuum: { x: 100, y: 100 }, map: { x: 200, y: 200 } },
            { vacuum: { x: 0, y: 100 }, map: { x: 0, y: 200 } },
        ];
        const cc = new CoordinatesConverter(square);
        const [mx, my] = cc.vacuumToMap(50, 50);
        expect(mx).toBeCloseTo(100, 3);
        expect(my).toBeCloseTo(100, 3);
        const [vx, vy] = cc.mapToVacuum(100, 100);
        expect(vx).toBeCloseTo(50, 3);
        expect(vy).toBeCloseTo(50, 3);
    });
});

// ---------------------------------------------------------------------------
// CoordinatesConverter — calibration absente (identité)
// ---------------------------------------------------------------------------

describe("CoordinatesConverter — calibration absente", () => {
    it("utilise l'identité quand calibrationPoints est undefined", () => {
        const cc = new CoordinatesConverter(undefined);
        // Reste considéré comme calibré (calibration par défaut de la plateforme).
        expect(cc.calibrated).toBe(true);
        expect(cc.transformMode).toBeUndefined();
        expect(cc.mapToVacuum(5, 7)).toEqual([5, 7]);
        expect(cc.vacuumToMap(5, 7)).toEqual([5, 7]);
        // L'identité est un aller-retour parfait par construction.
        expect(cc.vacuumToMap(-42.5, 1000)).toEqual([-42.5, 1000]);
        expect(cc.mapToVacuum(-42.5, 1000)).toEqual([-42.5, 1000]);
    });
});

// ---------------------------------------------------------------------------
// CoordinatesConverter — calibration insuffisante / dégénérée
//
// NB comportement RÉEL (non supposé) : la lib change-perspective tolère les
// entrées mal formées et renvoie l'identité ; fromTriangles sur points
// colinéaires renvoie une matrice de valeurs null (=> NaN). L'exception
// "Missing calibration" n'est donc PAS atteignable via le constructeur public
// (voir notes du rapport).
// ---------------------------------------------------------------------------

describe("CoordinatesConverter — calibration insuffisante / dégénérée", () => {
    it("2 points : bascule en perspective et reste 'calibré' (tolérance de la lib)", () => {
        const twoPoints: CalibrationPoint[] = [
            { vacuum: { x: 0, y: 0 }, map: { x: 0, y: 0 } },
            { vacuum: { x: 100, y: 0 }, map: { x: 200, y: 0 } },
        ];
        const cc = new CoordinatesConverter(twoPoints);
        expect(cc.transformMode).toBe(1); // perspective (branche else)
        expect(cc.calibrated).toBe(true);
        // change-perspective renvoie l'identité sur des QuadPoints incomplets.
        expect(cc.vacuumToMap(50, 50)).toEqual([50, 50]);
        expect(cc.mapToVacuum(50, 50)).toEqual([50, 50]);
    });

    it("tableau vide : perspective, identité, jamais d'exception", () => {
        const cc = new CoordinatesConverter([]);
        expect(cc.transformMode).toBe(1);
        expect(cc.calibrated).toBe(true);
        expect(() => cc.vacuumToMap(50, 50)).not.toThrow();
        expect(cc.vacuumToMap(50, 50)).toEqual([50, 50]);
        expect(cc.mapToVacuum(7, 9)).toEqual([7, 9]);
    });

    it("3 points colinéaires : matrice dégénérée -> NaN (bug latent, voir notes)", () => {
        const collinear: CalibrationPoint[] = [
            { vacuum: { x: 0, y: 0 }, map: { x: 0, y: 0 } },
            { vacuum: { x: 1, y: 1 }, map: { x: 1, y: 1 } },
            { vacuum: { x: 2, y: 2 }, map: { x: 2, y: 2 } },
        ];
        const cc = new CoordinatesConverter(collinear);
        // calibrated reste true car l'objet matrice est truthy (ses champs sont null).
        expect(cc.calibrated).toBe(true);
        expect(cc.transformMode).toBe(0);
        const [x, y] = cc.vacuumToMap(5, 5);
        expect(Number.isNaN(x)).toBe(true);
        expect(Number.isNaN(y)).toBe(true);
    });
});

// ---------------------------------------------------------------------------
// MousePosition
// ---------------------------------------------------------------------------

describe("MousePosition", () => {
    it("stocke x et y tels quels", () => {
        const mp = new MousePosition(12, 34);
        expect(mp.x).toBe(12);
        expect(mp.y).toBe(34);
    });

    it("accepte des coordonnées négatives et fractionnaires", () => {
        const mp = new MousePosition(-1.5, 0);
        expect(mp.x).toBe(-1.5);
        expect(mp.y).toBe(0);
    });

    it("expose des champs mutables", () => {
        const mp = new MousePosition(1, 2);
        mp.x = 99;
        mp.y = -7;
        expect(mp.x).toBe(99);
        expect(mp.y).toBe(-7);
    });
});

// ---------------------------------------------------------------------------
// ManualPoint — géométrie (imageX/imageY/toVacuum) via Context + Converter
// ---------------------------------------------------------------------------

describe("ManualPoint", () => {
    it("imageX/imageY divisent par realScale", () => {
        const ctx = makeContext(new CoordinatesConverter(AFFINE_SCALE2), { realScale: () => 2 });
        const mp = new ManualPoint(200, 400, ctx);
        expect(mp.imageX()).toBe(100); // 200 / 2
        expect(mp.imageY()).toBe(200); // 400 / 2
    });

    it("imageX/imageY avec realScale = 1 renvoient l'entrée brute", () => {
        const ctx = makeContext(new CoordinatesConverter(AFFINE_SCALE2), { realScale: () => 1 });
        const mp = new ManualPoint(15, -25, ctx);
        expect(mp.imageX()).toBe(15);
        expect(mp.imageY()).toBe(-25);
    });

    it("toVacuum() convertit la position image en coordonnées vacuum", () => {
        // realScale=2 -> imageX/Y = (100,200). Converter affine map=2*vacuum -> vacuum=image/2.
        const ctx = makeContext(new CoordinatesConverter(AFFINE_SCALE2), { realScale: () => 2 });
        const mp = new ManualPoint(200, 400, ctx);
        expect(mp.toVacuum()).toEqual([50, 100]);
    });

    it("toVacuum(repeats) ajoute le nombre de répétitions en 3e composante", () => {
        const ctx = makeContext(new CoordinatesConverter(AFFINE_SCALE2), { realScale: () => 2 });
        const mp = new ManualPoint(200, 400, ctx);
        expect(mp.toVacuum(3)).toEqual([50, 100, 3]);
    });

    it("toVacuum(null) reste un point 2D (comportement par défaut)", () => {
        const ctx = makeContext(new CoordinatesConverter(AFFINE_SCALE2), { realScale: () => 2 });
        const mp = new ManualPoint(200, 400, ctx);
        expect(mp.toVacuum(null)).toEqual([50, 100]);
    });

    it("toVacuum applique l'arrondi quand roundingEnabled est vrai", () => {
        // Convertisseur translation (map = vacuum + (10,20)), realScale=1, valeurs fractionnaires.
        const ctx = makeContext(new CoordinatesConverter(AFFINE_TRANSLATE), {
            realScale: () => 1,
            roundingEnabled: () => true,
        });
        // image = (12.4, 30.6) ; vacuum = image - (10,20) = (2.4, 10.6) ; arrondi -> (2, 11).
        const mp = new ManualPoint(12.4, 30.6, ctx);
        expect(mp.toVacuum()).toEqual([2, 11]);
    });

    it("toVacuum sans arrondi conserve les décimales", () => {
        const ctx = makeContext(new CoordinatesConverter(AFFINE_TRANSLATE), {
            realScale: () => 1,
            roundingEnabled: () => false,
        });
        const mp = new ManualPoint(12.4, 30.6, ctx);
        const [x, y] = mp.toVacuum() as [number, number];
        expect(x).toBeCloseTo(2.4, 9);
        expect(y).toBeCloseTo(10.6, 9);
    });

    it("toVacuum avec convertisseur identité (calibration absente) renvoie l'image telle quelle", () => {
        const ctx = makeContext(new CoordinatesConverter(undefined), { realScale: () => 1 });
        const mp = new ManualPoint(33, 44, ctx);
        expect(mp.toVacuum()).toEqual([33, 44]);
    });

    it("render() expose les coordonnées image brutes dans le template", () => {
        const ctx = makeContext(new CoordinatesConverter(AFFINE_SCALE2));
        const mp = new ManualPoint(12, 34, ctx);
        const result = mp.render() as unknown as { values: unknown[] };
        expect(result.values).toEqual([12, 34]);
    });

    it("propage l'exception 'Missing calibration' si le converter est absent", () => {
        // coordinatesConverter() renvoie undefined -> MapObject.realMapToVacuum lève.
        const ctx = makeContext(undefined, { realScale: () => 1 });
        const mp = new ManualPoint(10, 10, ctx);
        expect(() => mp.toVacuum()).toThrow("Missing calibration");
    });
});
