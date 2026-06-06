import { describe, it, expect, beforeAll } from "vitest";
import { nothing } from "lit";
import "../src/components/robot-marker";
import { RobotMarker } from "../src/components/robot-marker";
import { CoordinatesConverter } from "../src/model/map_objects/coordinates-converter";
import type { CalibrationPoint } from "../src/types/types";

// ---------------------------------------------------------------------------
// 1) Composant <dreame-robot-marker> : logique de rendu (masquage / position /
//    rotation). On instancie l'élément, on fixe ses propriétés et on inspecte
//    soit le retour de render() (nothing vs TemplateResult), soit le DOM rendu
//    dans le shadowRoot après mise à jour.
// ---------------------------------------------------------------------------

const flush = async (el: RobotMarker): Promise<void> => {
    // Lit met à jour de façon asynchrone ; updateComplete attend le rendu.
    await el.updateComplete;
};

describe("dreame-robot-marker (composant)", () => {
    beforeAll(() => {
        // Le décorateur @customElement enregistre l'élément à l'import ; on le
        // vérifie pour s'assurer que happy-dom connaît bien le tag.
        expect(customElements.get("dreame-robot-marker")).toBeTruthy();
    });

    it("a des valeurs de propriétés par défaut sûres (masqué)", () => {
        const el = new RobotMarker();
        expect(el.visible).toBe(false);
        expect(el.xPercent).toBe(-1);
        expect(el.yPercent).toBe(-1);
        expect(el.headingDeg).toBe(0);
    });

    it("render() renvoie nothing quand visible=false", () => {
        const el = new RobotMarker();
        el.visible = false;
        el.xPercent = 50;
        el.yPercent = 50;
        // render est protected ; on y accède via un cast pour tester la logique pure.
        const out = (el as unknown as { render(): unknown }).render();
        expect(out).toBe(nothing);
    });

    it("render() renvoie nothing quand xPercent < 0 (position absente)", () => {
        const el = new RobotMarker();
        el.visible = true;
        el.xPercent = -1;
        el.yPercent = 42;
        const out = (el as unknown as { render(): unknown }).render();
        expect(out).toBe(nothing);
    });

    it("render() renvoie nothing quand yPercent < 0", () => {
        const el = new RobotMarker();
        el.visible = true;
        el.xPercent = 42;
        el.yPercent = -1;
        const out = (el as unknown as { render(): unknown }).render();
        expect(out).toBe(nothing);
    });

    it("render() renvoie nothing quand visible=true mais position non décodée (-1,-1)", () => {
        // Cas « image non décodée » côté appelant : naturalWidth=0 => robotVisible
        // resterait false, mais même si visible passait true par erreur, des
        // pourcentages négatifs masquent toujours le marqueur.
        const el = new RobotMarker();
        el.visible = true;
        el.xPercent = -1;
        el.yPercent = -1;
        const out = (el as unknown as { render(): unknown }).render();
        expect(out).toBe(nothing);
    });

    it("ne rend AUCUN noeud #marker dans le shadow DOM quand masqué", async () => {
        const el = new RobotMarker();
        el.visible = false;
        el.xPercent = 30;
        el.yPercent = 30;
        document.body.appendChild(el);
        await flush(el);
        expect(el.shadowRoot?.querySelector("#marker")).toBeNull();
        el.remove();
    });

    it("rend #marker avec left/top en % et rotate(0deg) quand visible (cap 0)", async () => {
        const el = new RobotMarker();
        el.visible = true;
        el.xPercent = 25;
        el.yPercent = 75;
        el.headingDeg = 0;
        document.body.appendChild(el);
        await flush(el);

        const marker = el.shadowRoot?.querySelector("#marker") as HTMLElement | null;
        expect(marker).toBeTruthy();
        // left/top sont injectés en pourcentage.
        expect(marker?.style.left).toBe("25%");
        expect(marker?.style.top).toBe("75%");

        const icon = el.shadowRoot?.querySelector("#icon") as HTMLElement | null;
        expect(icon).toBeTruthy();
        expect(icon?.style.transform).toBe("rotate(0deg)");

        // Le SVG du robot (bec orienté vers +x) est présent.
        expect(el.shadowRoot?.querySelector("svg polygon.beak")).toBeTruthy();
        el.remove();
    });

    it("applique la rotation pour cap 90 et 180 degrés", async () => {
        const el90 = new RobotMarker();
        el90.visible = true;
        el90.xPercent = 10;
        el90.yPercent = 10;
        el90.headingDeg = 90;
        document.body.appendChild(el90);
        await flush(el90);
        const icon90 = el90.shadowRoot?.querySelector("#icon") as HTMLElement | null;
        expect(icon90?.style.transform).toBe("rotate(90deg)");
        el90.remove();

        const el180 = new RobotMarker();
        el180.visible = true;
        el180.xPercent = 10;
        el180.yPercent = 10;
        el180.headingDeg = 180;
        document.body.appendChild(el180);
        await flush(el180);
        const icon180 = el180.shadowRoot?.querySelector("#icon") as HTMLElement | null;
        expect(icon180?.style.transform).toBe("rotate(180deg)");
        el180.remove();
    });

    it("accepte un cap négatif et fractionnaire (interpolé tel quel)", async () => {
        const el = new RobotMarker();
        el.visible = true;
        el.xPercent = 50;
        el.yPercent = 50;
        el.headingDeg = -45.5;
        document.body.appendChild(el);
        await flush(el);
        const icon = el.shadowRoot?.querySelector("#icon") as HTMLElement | null;
        expect(icon?.style.transform).toBe("rotate(-45.5deg)");
        el.remove();
    });
});

// ---------------------------------------------------------------------------
// 2) Logique de positionnement & de cap (heading) en isolation.
//    Le calcul réel vit dans dreame-vacuum-card.render() mais dépend uniquement
//    de CoordinatesConverter.vacuumToMap + arithmétique pure. On réplique
//    l'algorithme EXACT (mêmes formules, lignes ~419-436 du composant) avec un
//    vrai CoordinatesConverter pour vérifier le comportement attendu.
// ---------------------------------------------------------------------------

interface RobotPos {
    x: number;
    y: number;
    a?: number | null;
}

/** Réplique fidèle de l'algorithme du composant (anti-flash, option 2). */
const computeMarker = (
    cc: CoordinatesConverter,
    robotPos: RobotPos | null | undefined,
    natW: number | undefined,
    natH: number | undefined
): { xPct: number; yPct: number; headingDeg: number; visible: boolean } => {
    let robotXPct = -1;
    let robotYPct = -1;
    let robotHeadingDeg = 0;
    let robotVisible = false;
    if (cc?.calibrated && robotPos && robotPos.x != null && robotPos.y != null) {
        const p0 = cc.vacuumToMap(robotPos.x, robotPos.y);
        if (natW && natH) {
            robotXPct = (p0[0] / natW) * 100;
            robotYPct = (p0[1] / natH) * 100;
            const aRad = ((robotPos.a ?? 0) * Math.PI) / 180;
            const p1 = cc.vacuumToMap(robotPos.x + Math.cos(aRad), robotPos.y + Math.sin(aRad));
            robotHeadingDeg = (Math.atan2(p1[1] - p0[1], p1[0] - p0[0]) * 180) / Math.PI;
            robotVisible = true;
        }
    }
    return { xPct: robotXPct, yPct: robotYPct, headingDeg: robotHeadingDeg, visible: robotVisible };
};

// Calibration AFFINE (3 points) : map = vacuum (identité par triangle). On la
// fabrique pour exercer le vrai chemin AFFINE de vacuumToMap, pas l'identité.
const identityAffineCalibration: CalibrationPoint[] = [
    { vacuum: { x: 0, y: 0 }, map: { x: 0, y: 0 } },
    { vacuum: { x: 100, y: 0 }, map: { x: 100, y: 0 } },
    { vacuum: { x: 0, y: 100 }, map: { x: 0, y: 100 } },
];

// Calibration AFFINE avec rotation 90° (vacuum -> map) : map.x = -vacuum.y,
// map.y = vacuum.x. Utile pour vérifier que le cap suit la transformation.
const rotated90Calibration: CalibrationPoint[] = [
    { vacuum: { x: 0, y: 0 }, map: { x: 0, y: 0 } },
    { vacuum: { x: 100, y: 0 }, map: { x: 0, y: 100 } },
    { vacuum: { x: 0, y: 100 }, map: { x: -100, y: 0 } },
];

// Calibration AFFINE avec échelle (map = 2 * vacuum) : vérifie le scaling du %.
const scale2Calibration: CalibrationPoint[] = [
    { vacuum: { x: 0, y: 0 }, map: { x: 0, y: 0 } },
    { vacuum: { x: 50, y: 0 }, map: { x: 100, y: 0 } },
    { vacuum: { x: 0, y: 50 }, map: { x: 0, y: 100 } },
];

describe("positionnement marqueur (% sur l'image)", () => {
    it("convertit la position vacuum -> % avec calibration identité affine", () => {
        const cc = new CoordinatesConverter(identityAffineCalibration);
        // robot en (50,50), image 200x400 => 25% horiz, 12.5% vert.
        const r = computeMarker(cc, { x: 50, y: 50, a: 0 }, 200, 400);
        expect(r.visible).toBe(true);
        expect(r.xPct).toBeCloseTo(25, 6);
        expect(r.yPct).toBeCloseTo(12.5, 6);
    });

    it("applique l'échelle de calibration au pourcentage (map = 2*vacuum)", () => {
        const cc = new CoordinatesConverter(scale2Calibration);
        // vacuum (25,25) -> map (50,50) ; image 100x100 => 50% / 50%.
        const r = computeMarker(cc, { x: 25, y: 25, a: 0 }, 100, 100);
        expect(r.xPct).toBeCloseTo(50, 6);
        expect(r.yPct).toBeCloseTo(50, 6);
    });

    it("renvoie visible=false et -1/-1 quand vacuum_position est absent", () => {
        const cc = new CoordinatesConverter(identityAffineCalibration);
        const r = computeMarker(cc, undefined, 200, 200);
        expect(r.visible).toBe(false);
        expect(r.xPct).toBe(-1);
        expect(r.yPct).toBe(-1);
    });

    it("renvoie visible=false quand vacuum_position est null", () => {
        const cc = new CoordinatesConverter(identityAffineCalibration);
        const r = computeMarker(cc, null, 200, 200);
        expect(r.visible).toBe(false);
    });

    it("renvoie visible=false quand x ou y manquent (null)", () => {
        const cc = new CoordinatesConverter(identityAffineCalibration);
        const rNoX = computeMarker(cc, { x: null as unknown as number, y: 10, a: 0 }, 200, 200);
        const rNoY = computeMarker(cc, { x: 10, y: null as unknown as number, a: 0 }, 200, 200);
        expect(rNoX.visible).toBe(false);
        expect(rNoY.visible).toBe(false);
    });

    it("renvoie visible=false quand l'image n'est pas décodée (naturalWidth=0)", () => {
        const cc = new CoordinatesConverter(identityAffineCalibration);
        // natW=0 => falsy => marqueur non visible (image pas encore chargée).
        const r = computeMarker(cc, { x: 50, y: 50, a: 0 }, 0, 400);
        expect(r.visible).toBe(false);
        expect(r.xPct).toBe(-1);
        expect(r.yPct).toBe(-1);
    });

    it("renvoie visible=false quand naturalHeight=0", () => {
        const cc = new CoordinatesConverter(identityAffineCalibration);
        const r = computeMarker(cc, { x: 50, y: 50, a: 0 }, 200, 0);
        expect(r.visible).toBe(false);
    });

    it("renvoie visible=false quand les dimensions sont undefined", () => {
        const cc = new CoordinatesConverter(identityAffineCalibration);
        const r = computeMarker(cc, { x: 50, y: 50, a: 0 }, undefined, undefined);
        expect(r.visible).toBe(false);
    });

    it("supporte une position à l'origine (0,0) -> 0% / 0% et reste visible", () => {
        const cc = new CoordinatesConverter(identityAffineCalibration);
        const r = computeMarker(cc, { x: 0, y: 0, a: 0 }, 200, 200);
        // x=0 et y=0 ne sont PAS null donc le marqueur est calculé.
        expect(r.visible).toBe(true);
        expect(r.xPct).toBeCloseTo(0, 6);
        expect(r.yPct).toBeCloseTo(0, 6);
    });
});

describe("calcul du cap (heading) via atan2 sur vecteur transformé", () => {
    it("cap=0 (vers +x vacuum) -> 0° écran avec calibration identité", () => {
        const cc = new CoordinatesConverter(identityAffineCalibration);
        const r = computeMarker(cc, { x: 10, y: 10, a: 0 }, 100, 100);
        expect(r.headingDeg).toBeCloseTo(0, 6);
    });

    it("cap=90 (vers +y vacuum) -> 90° écran avec calibration identité", () => {
        const cc = new CoordinatesConverter(identityAffineCalibration);
        const r = computeMarker(cc, { x: 10, y: 10, a: 90 }, 100, 100);
        // identité : +y vacuum = +y map ; atan2(1,0) = 90°.
        expect(r.headingDeg).toBeCloseTo(90, 6);
    });

    it("cap=180 (vers -x vacuum) -> 180° écran avec calibration identité", () => {
        const cc = new CoordinatesConverter(identityAffineCalibration);
        const r = computeMarker(cc, { x: 10, y: 10, a: 180 }, 100, 100);
        expect(Math.abs(r.headingDeg)).toBeCloseTo(180, 6);
    });

    it("cap=0 mais calibration tournée de 90° -> le cap écran tourne aussi", () => {
        // map.x = -vacuum.y, map.y = vacuum.x. Un cap vacuum vers +x donne un
        // déplacement map (dx,dy) = (-(0)= -0, +1) => atan2(1,0) = 90° écran.
        const cc = new CoordinatesConverter(rotated90Calibration);
        const r = computeMarker(cc, { x: 10, y: 10, a: 0 }, 200, 200);
        expect(r.headingDeg).toBeCloseTo(90, 4);
    });

    it("cap absent (a=undefined) traité comme 0°", () => {
        const cc = new CoordinatesConverter(identityAffineCalibration);
        const r = computeMarker(cc, { x: 10, y: 10 }, 100, 100);
        expect(r.headingDeg).toBeCloseTo(0, 6);
    });

    it("cap null traité comme 0° (?? fallback)", () => {
        const cc = new CoordinatesConverter(identityAffineCalibration);
        const r = computeMarker(cc, { x: 10, y: 10, a: null }, 100, 100);
        expect(r.headingDeg).toBeCloseTo(0, 6);
    });

    it("l'échelle uniforme ne change pas le cap (map = 2*vacuum, cap 90)", () => {
        const cc = new CoordinatesConverter(scale2Calibration);
        const r = computeMarker(cc, { x: 10, y: 10, a: 90 }, 200, 200);
        // une homothétie positive préserve l'orientation du vecteur.
        expect(r.headingDeg).toBeCloseTo(90, 6);
    });

    it("le cap reste borné dans (-180, 180] (sortie atan2)", () => {
        const cc = new CoordinatesConverter(identityAffineCalibration);
        for (const a of [0, 45, 90, 135, 180, 225, 270, 315, 359]) {
            const r = computeMarker(cc, { x: 10, y: 10, a }, 100, 100);
            expect(r.headingDeg).toBeGreaterThan(-180.0001);
            expect(r.headingDeg).toBeLessThanOrEqual(180.0001);
        }
    });
});

// ---------------------------------------------------------------------------
// 3) Cohérence bout-à-bout : la sortie de computeMarker alimente le composant
//    et produit (ou non) un noeud #marker conforme.
// ---------------------------------------------------------------------------

describe("intégration compute -> composant", () => {
    it("une position valide produit un marqueur rendu avec les % calculés", async () => {
        const cc = new CoordinatesConverter(identityAffineCalibration);
        const r = computeMarker(cc, { x: 50, y: 50, a: 0 }, 200, 400);

        const el = new RobotMarker();
        el.visible = r.visible;
        el.xPercent = r.xPct;
        el.yPercent = r.yPct;
        el.headingDeg = r.headingDeg;
        document.body.appendChild(el);
        await el.updateComplete;

        const marker = el.shadowRoot?.querySelector("#marker") as HTMLElement | null;
        expect(marker).toBeTruthy();
        expect(marker?.style.left).toBe("25%");
        expect(marker?.style.top).toBe("12.5%");
        el.remove();
    });

    it("image non décodée -> aucun marqueur dans le DOM", async () => {
        const cc = new CoordinatesConverter(identityAffineCalibration);
        const r = computeMarker(cc, { x: 50, y: 50, a: 0 }, 0, 0);

        const el = new RobotMarker();
        el.visible = r.visible;
        el.xPercent = r.xPct;
        el.yPercent = r.yPct;
        document.body.appendChild(el);
        await el.updateComplete;

        expect(el.shadowRoot?.querySelector("#marker")).toBeNull();
        el.remove();
    });
});
