import { describe, it, expect } from "vitest";
import {
    computeRobotOverlayGeometry,
    INITIAL_ROBOT_SAMPLE,
    RobotSample,
} from "../src/model/map/robot-overlay-geometry";
import { CoordinatesConverter } from "../src/model/map_objects/coordinates-converter";
import type { CalibrationPoint } from "../src/types/types";

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 3 points, mode AFFINE, map = vacuum (identité) : simplifie les calculs attendus. */
const IDENTITY_CALIBRATION: CalibrationPoint[] = [
    { vacuum: { x: 0, y: 0 }, map: { x: 0, y: 0 } },
    { vacuum: { x: 1000, y: 0 }, map: { x: 1000, y: 0 } },
    { vacuum: { x: 0, y: 1000 }, map: { x: 0, y: 1000 } },
];

function makeCamState(overrides: { attributes?: Record<string, unknown> } = {}): any {
    return { attributes: {}, ...overrides };
}

function baseInput(overrides: Partial<Parameters<typeof computeRobotOverlayGeometry>[0]> = {}) {
    const converter = new CoordinatesConverter(IDENTITY_CALIBRATION);
    expect(converter.calibrated).toBe(true);
    return {
        camState: makeCamState({ attributes: { vacuum_position: { x: 500, y: 300, a: 0 }, robot_icon: "icon.png" } }),
        converter,
        natW: 1000,
        natH: 1000,
        robotOverlayEnabled: true,
        prevSample: INITIAL_ROBOT_SAMPLE,
        nowMs: 10_000,
        ...overrides,
    };
}

describe("computeRobotOverlayGeometry — position/pourcentages", () => {
    it("calcule xPct/yPct à partir de vacuum_position et des dimensions naturelles", () => {
        const result = computeRobotOverlayGeometry(baseInput());
        expect(result.xPct).toBeCloseTo(50, 6);
        expect(result.yPct).toBeCloseTo(30, 6);
        expect(result.visible).toBe(true);
        expect(result.iconUrl).toBe("icon.png");
    });

    it("cap = 0° quand a=0 (identité, direction +x)", () => {
        const result = computeRobotOverlayGeometry(baseInput());
        expect(result.headingDeg).toBeCloseTo(0, 6);
    });

    it("robot_beam_icon présent -> beamUrl retourné (fill light active)", () => {
        const camState = makeCamState({
            attributes: {
                vacuum_position: { x: 500, y: 300, a: 0 },
                robot_icon: "icon.png",
                robot_beam_icon: "beam.png",
            },
        });
        const result = computeRobotOverlayGeometry(baseInput({ camState }));
        expect(result.beamUrl).toBe("beam.png");
    });

    it("robot_beam_icon absent -> beamUrl undefined (fill light éteinte / intégration antérieure)", () => {
        const result = computeRobotOverlayGeometry(baseInput());
        expect(result.beamUrl).toBeUndefined();
    });

    it("cap dérivé de l'attribut a (identité -> cap = a mod (-180,180])", () => {
        const camState = makeCamState({ attributes: { vacuum_position: { x: 100, y: 100, a: 90 } } });
        const result = computeRobotOverlayGeometry(baseInput({ camState }));
        expect(result.headingDeg).toBeCloseTo(90, 5);
    });
});

describe("computeRobotOverlayGeometry — déroulement du cap (unwrap ±180°)", () => {
    it("un franchissement de ±180° prend le delta court (pas un saut de ~340°)", () => {
        // a=190° -> cap brut ramené par atan2 dans (-180,180] = -170°.
        const camState = makeCamState({ attributes: { vacuum_position: { x: 100, y: 100, a: 190 } } });
        const prevSample: RobotSample = { ...INITIAL_ROBOT_SAMPLE, headingDeg: 170 };
        const result = computeRobotOverlayGeometry(baseInput({ camState, prevSample }));
        // Continuité : 170 -> 190 (delta +20), pas 170 -> -170 (delta -340).
        expect(result.headingDeg).toBeCloseTo(190, 5);
        expect(result.nextSample.headingDeg).toBeCloseTo(190, 5);
    });

    it("sans cap précédent (reset), le cap brut est utilisé tel quel (pas d'unwrap)", () => {
        const camState = makeCamState({ attributes: { vacuum_position: { x: 100, y: 100, a: 190 } } });
        const prevSample: RobotSample = { posKey: "5,5", posTs: 1000, glideMs: 2500, headingDeg: undefined };
        const result = computeRobotOverlayGeometry(baseInput({ camState, prevSample }));
        expect(result.headingDeg).toBeCloseTo(-170, 5);
    });
});

describe("computeRobotOverlayGeometry — cadence de glisse (glideMs)", () => {
    it("premier échantillon connu -> glideMs reste au défaut (400), posKey/posTs s'initialisent", () => {
        const result = computeRobotOverlayGeometry(baseInput({ prevSample: INITIAL_ROBOT_SAMPLE, nowMs: 5000 }));
        expect(result.glideMs).toBe(400);
        expect(result.nextSample.posKey).toBe("500,300");
        expect(result.nextSample.posTs).toBe(5000);
    });

    it("intervalle mesuré de 3000ms -> glideMs = round(3000*0.9) = 2700", () => {
        const prevSample: RobotSample = { posKey: "1,1", posTs: 1000, glideMs: 400, headingDeg: 0 };
        const result = computeRobotOverlayGeometry(baseInput({ prevSample, nowMs: 4000 }));
        expect(result.glideMs).toBe(2700);
        expect(result.nextSample.posTs).toBe(4000);
    });

    it("intervalle très court -> glideMs clampé au plancher 400ms", () => {
        const prevSample: RobotSample = { posKey: "1,1", posTs: 1000, glideMs: 900, headingDeg: 0 };
        const result = computeRobotOverlayGeometry(baseInput({ prevSample, nowMs: 1100 }));
        // round(100*0.9)=90 < 400 -> clampé à 400.
        expect(result.glideMs).toBe(400);
    });

    it("intervalle très long -> glideMs clampé au plafond 4000ms", () => {
        const prevSample: RobotSample = { posKey: "1,1", posTs: 1000, glideMs: 400, headingDeg: 0 };
        const result = computeRobotOverlayGeometry(baseInput({ prevSample, nowMs: 20_000 }));
        // round(19000*0.9)=17100 > 4000 -> clampé à 4000.
        expect(result.glideMs).toBe(4000);
    });

    it("posKey inchangé -> glideMs/posTs ne bougent pas (pas de nouvel échantillon)", () => {
        const prevSample: RobotSample = { posKey: "500,300", posTs: 1000, glideMs: 777, headingDeg: 0 };
        const result = computeRobotOverlayGeometry(baseInput({ prevSample, nowMs: 99_999 }));
        expect(result.glideMs).toBe(777);
        expect(result.nextSample.posTs).toBe(1000);
    });
});

describe("computeRobotOverlayGeometry — robot invisible / conditions de désactivation", () => {
    it("pas de vacuum_position -> invisible, pourcentages à -1, sample inchangé", () => {
        const camState = makeCamState({ attributes: { robot_icon: "icon.png" } });
        const prevSample = INITIAL_ROBOT_SAMPLE;
        const result = computeRobotOverlayGeometry(baseInput({ camState, prevSample }));
        expect(result.visible).toBe(false);
        expect(result.xPct).toBe(-1);
        expect(result.yPct).toBe(-1);
        expect(result.headingDeg).toBe(0);
        // L'icône est tout de même résolue (assignée avant le test de vacuum_position).
        expect(result.iconUrl).toBe("icon.png");
        expect(result.nextSample).toBe(prevSample);
    });

    it("robotOverlayEnabled=false -> aucun calcul, iconUrl undefined", () => {
        const result = computeRobotOverlayGeometry(baseInput({ robotOverlayEnabled: false }));
        expect(result.visible).toBe(false);
        expect(result.iconUrl).toBeUndefined();
        expect(result.xPct).toBe(-1);
    });

    it("converter non calibré -> aucun calcul", () => {
        const converter = new CoordinatesConverter(undefined);
        // Sans points, CoordinatesConverter retombe sur l'identité implicite (calibrated=true) —
        // on force donc un converter non calibré via un cast pour exercer la branche.
        Object.defineProperty(converter, "calibrated", { value: false });
        const result = computeRobotOverlayGeometry(baseInput({ converter }));
        expect(result.visible).toBe(false);
        expect(result.iconUrl).toBeUndefined();
    });

    it("pas de camState (pas de caméra / entité absente) -> aucun calcul", () => {
        const result = computeRobotOverlayGeometry(baseInput({ camState: undefined }));
        expect(result.visible).toBe(false);
        expect(result.iconUrl).toBeUndefined();
        expect(result.nextSample).toBe(INITIAL_ROBOT_SAMPLE);
    });

    it("natW/natH absents -> pas de visibilité malgré une position valide, icône tout de même résolue", () => {
        const result = computeRobotOverlayGeometry(baseInput({ natW: undefined, natH: undefined }));
        expect(result.visible).toBe(false);
        expect(result.xPct).toBe(-1);
        expect(result.yPct).toBe(-1);
        expect(result.iconUrl).toBe("icon.png");
        expect(result.nextSample).toBe(INITIAL_ROBOT_SAMPLE);
    });
});

describe("computeRobotOverlayGeometry — téléportation (reboot / changement de carte / saut)", () => {
    it("saut > 20 % de l'image en un échantillon -> glide 0 (téléportation), cadence remise à 400", () => {
        const prevSample: RobotSample = {
            posKey: "10,10",
            posTs: 7_000,
            glideMs: 2700,
            headingDeg: 0,
            xPct: 1,
            yPct: 1,
            mapKey: "1000x1000",
        };
        // (500,300) en identité sur 1000x1000 -> (50 %, 30 %) : distance >> 20 %.
        const result = computeRobotOverlayGeometry(baseInput({ prevSample }));
        expect(result.visible).toBe(true);
        expect(result.glideMs).toBe(0);
        expect(result.nextSample.glideMs).toBe(400);
        expect(result.nextSample.xPct).toBeCloseTo(50, 6);
        expect(result.nextSample.yPct).toBeCloseTo(30, 6);
    });

    it("changement de dimensions naturelles (autre carte) -> glide 0 même pour un petit delta", () => {
        const prevSample: RobotSample = {
            posKey: "499,299",
            posTs: 7_000,
            glideMs: 2700,
            headingDeg: 0,
            xPct: 49.9,
            yPct: 29.9,
            mapKey: "800x800",
        };
        const result = computeRobotOverlayGeometry(baseInput({ prevSample }));
        expect(result.glideMs).toBe(0);
        expect(result.nextSample.mapKey).toBe("1000x1000");
    });

    it("déplacement normal (petit delta, même carte) -> la glisse cadencée est conservée", () => {
        const prevSample: RobotSample = {
            posKey: "490,300",
            posTs: 7_000,
            glideMs: 2700,
            headingDeg: 0,
            xPct: 49,
            yPct: 30,
            mapKey: "1000x1000",
        };
        const result = computeRobotOverlayGeometry(baseInput({ prevSample }));
        expect(result.glideMs).toBe(2700);
        expect(result.nextSample.glideMs).toBe(2700);
    });

    it("premier échantillon (aucune position précédente) -> pas de téléportation forcée, défauts inchangés", () => {
        const result = computeRobotOverlayGeometry(baseInput());
        expect(result.glideMs).toBe(400);
        expect(result.nextSample.xPct).toBeCloseTo(50, 6);
        expect(result.nextSample.mapKey).toBe("1000x1000");
    });
});
