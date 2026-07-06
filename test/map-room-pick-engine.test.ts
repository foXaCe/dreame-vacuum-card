import { describe, it, expect } from "vitest";
import { RoomPickEngine, RoomPickEngineDeps } from "../src/model/map/room-pick-engine";
import { CoordinatesConverter } from "../src/model/map_objects/coordinates-converter";
import type { CalibrationPoint } from "../src/types/types";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * happy-dom (l'environnement des tests unitaires du repo) ne fournit PAS de contexte
 * canvas 2D fonctionnel : `canvas.getContext("2d")` y renvoie `null`. La quasi-totalité de
 * `RoomPickEngine` (pick buffer, overlay, masque alpha) dessine sur des canvases off-screen
 * et n'est donc testable de bout en bout QUE dans un vrai navigateur — c'est le rôle de
 * `test-browser/{room-selection,segment-map-fallback,room-overlay-pixels}.test.ts`.
 * Cette suite se limite aux branches atteignables SANS contexte 2D : les early-return de
 * garde (aucune caméra, canvas pas encore prêt) et la dégradation silencieuse quand
 * `getContext("2d")` échoue (`if (!ctx) return;`), un cas que le navigateur réel n'exerce
 * jamais puisqu'il a toujours un contexte 2D disponible.
 */

const IDENTITY_CALIBRATION: CalibrationPoint[] = [
    { vacuum: { x: 0, y: 0 }, map: { x: 0, y: 0 } },
    { vacuum: { x: 1000, y: 0 }, map: { x: 1000, y: 0 } },
    { vacuum: { x: 0, y: 1000 }, map: { x: 0, y: 1000 } },
];

function makeMapImage(w = 200, h = 140): HTMLImageElement {
    const img = document.createElement("img");
    Object.defineProperty(img, "naturalWidth", { value: w, configurable: true });
    Object.defineProperty(img, "naturalHeight", { value: h, configurable: true });
    return img;
}

function makeEngine(overrides: Partial<RoomPickEngineDeps> = {}): RoomPickEngine {
    const converter = new CoordinatesConverter(IDENTITY_CALIBRATION);
    const mapImage = makeMapImage();
    const camState = {
        attributes: {
            rooms: {
                "1": { x0: 20, y0: 20, x1: 90, y1: 90, visibility: "Visible", segment_id: 1 },
            },
        },
    } as any;
    return new RoomPickEngine({
        getMapImage: () => mapImage,
        getCameraState: () => camState,
        getConverter: () => converter,
        ...overrides,
    });
}

describe("RoomPickEngine — gardes atteignables sans contexte 2D (happy-dom)", () => {
    it("ensurePickCanvas() sans caméra -> no-op, currentPickCanvas reste null", () => {
        const engine = new RoomPickEngine({
            getMapImage: () => null,
            getCameraState: () => undefined,
            getConverter: () => undefined,
        });
        expect(() => engine.ensurePickCanvas()).not.toThrow();
        expect(engine.currentPickCanvas).toBeNull();
    });

    it("hitTest() avant tout ensurePickCanvas() -> undefined, pas d'exception", () => {
        const engine = makeEngine();
        expect(engine.hitTest(0.5, 0.5)).toBeUndefined();
    });

    it("ensurePickCanvas() avec rooms + converter mais getContext('2d') indisponible (happy-dom) -> dégrade silencieusement, pas d'exception", () => {
        const engine = makeEngine();
        expect(() => engine.ensurePickCanvas()).not.toThrow();
        // happy-dom ne fournit pas de contexte 2D -> le pick canvas ne peut jamais se
        // construire ici (branche `if (!ctx) return;`), contrairement au navigateur réel.
        expect(engine.currentPickCanvas).toBeNull();
        expect(engine.hitTest(0.5, 0.5)).toBeUndefined();
    });

    it("drawSelectionOverlay() hors mode 'room' -> pas d'exception même sans pick canvas prêt", () => {
        const engine = makeEngine();
        const overlayCanvas = document.createElement("canvas");
        expect(() => engine.drawSelectionOverlay(overlayCanvas, makeMapImage(), [], "zone")).not.toThrow();
    });

    it("drawSelectionOverlay() en mode 'room' sans pick canvas prêt -> pas d'exception", () => {
        const engine = makeEngine();
        const overlayCanvas = document.createElement("canvas");
        expect(() => engine.drawSelectionOverlay(overlayCanvas, makeMapImage(), [], "room")).not.toThrow();
    });
});
