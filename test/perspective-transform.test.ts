import { describe, it, expect } from "vitest";

import { fixPerspective, QuadPoints } from "../src/model/map_objects/perspective-transform";

// ---------------------------------------------------------------------------
// Valeurs de référence produites par l'ANCIEN paquet npm `change-perspective`
// v1.0.1 (avant vendorisation), figées ici pour garantir la non-régression
// numérique. Régénérées via `node -e` avec le paquet npm original :
//
//   const f = require("change-perspective").default;
//   f(srcPts, dstPts)(x, y)
//
// Toutes les valeurs ci-dessous ont été vérifiées BIT À BIT identiques entre
// l'ancien paquet et le module vendorisé (voir plans/README.md pour la
// décision de vendorisation).
// ---------------------------------------------------------------------------

describe("perspective-transform — parité numérique avec l'ancien paquet npm", () => {
    it("reproduit l'exemple du README de change-perspective", () => {
        // srcCorners/dstCorners/srcPt tels que documentés dans le README d'origine.
        const srcCorners: QuadPoints = [158, 64, 494, 69, 495, 404, 158, 404];
        const dstCorners: QuadPoints = [100, 500, 152, 564, 148, 604, 100, 560];
        const transform = fixPerspective(srcCorners, dstCorners);

        const [x, y] = transform(250, 120);

        // Valeur exacte produite par change-perspective@1.0.1 pour ce cas.
        expect(x).toBe(117.27521125839255);
        expect(y).toBe(530.9202410878403);
    });

    it("mappe les 4 sommets d'un quadrilatère non rectangulaire vers leurs cibles", () => {
        // Même configuration que PERSPECTIVE_QUAD dans test/coordinates.test.ts.
        const vacuum: QuadPoints = [-1000, -1000, 1000, -1000, 1000, 1000, -1000, 1000];
        const map: QuadPoints = [0, 0, 500, 10, 520, 480, 5, 495];
        const transform = fixPerspective(vacuum, map);

        // Valeurs exactes produites par change-perspective@1.0.1.
        const p1 = transform(-1000, -1000);
        expect(p1[0]).toBeCloseTo(0, 6);
        expect(p1[1]).toBeCloseTo(0, 6);

        const p2 = transform(1000, 1000);
        expect(p2[0]).toBe(520.0000067693152);
        expect(p2[1]).toBe(480.0000063095029);

        const p3 = transform(0, 0);
        expect(p3[0]).toBe(262.7072274398);
        expect(p3[1]).toBe(242.4989791752);

        const p4 = transform(123, -456);
        expect(p4[0]).toBe(290.6659576400279);
        expect(p4[1]).toBe(133.57065349808207);
    });

    it("mappe un quadrilatère rectangulaire trivial (dst = 2 * src) fidèlement", () => {
        const src: QuadPoints = [0, 0, 100, 0, 100, 100, 0, 100];
        const dst: QuadPoints = [0, 0, 200, 0, 200, 200, 0, 200];
        const transform = fixPerspective(src, dst);

        expect(transform(50, 50)).toEqual([100, 100]);
        expect(transform(0, 0)).toEqual([0, 0]);
        expect(transform(100, 100)).toEqual([200, 200]);
    });

    it("est cohérent en aller-retour (src -> dst -> src)", () => {
        const src: QuadPoints = [-1000, -1000, 1000, -1000, 1000, 1000, -1000, 1000];
        const dst: QuadPoints = [0, 0, 500, 10, 520, 480, 5, 495];
        const forward = fixPerspective(src, dst);
        const backward = fixPerspective(dst, src);

        const samples: Array<[number, number]> = [
            [0, 0],
            [123, -456],
            [-789, 321],
            [500, 500],
        ];
        for (const [x, y] of samples) {
            const [mx, my] = forward(x, y);
            const [vx, vy] = backward(mx, my);
            expect(vx).toBeCloseTo(x, 2);
            expect(vy).toBeCloseTo(y, 2);
        }
    });

    it("retombe sur une transformation identité quand la matrice est dégénérée (tout non fini)", () => {
        // Reproduit le comportement documenté de l'ancien paquet : des QuadPoints
        // incomplets (composantes `undefined`) rendent le système non résoluble ;
        // le paquet d'origine retombait sur l'identité via un accident d'implémentation
        // (accès de tableau sur un index -1 provoquant une exception JS interceptée) ;
        // ce module reproduit le même filet de sécurité de façon explicite et documentée.
        const empty = [
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
        ] as unknown as QuadPoints;
        const transform = fixPerspective(empty, empty);

        expect(transform(50, 50)).toEqual([50, 50]);
        expect(transform(7, 9)).toEqual([7, 9]);
    });
});
