/**
 * Overlay de position du robot (`dreame-robot-marker`, option 2 anti-flash).
 *
 * Flux réel exercé (lu dans src/dreame-vacuum-card.ts, render() ~L420-461) :
 * - Le robot overlay lit l'attribut `vacuum_position` ({x, y, a}) sur la CAMÉRA
 *   (`preset.map_source.camera`), PAS sur l'entité vacuum elle-même — détail non
 *   intuitif confirmé en lisant le code (`camState.attributes?.vacuum_position`).
 * - `robot_overlay: true` en config force `robotOverlayEnabled = true` sans dépendre
 *   de l'attribut caméra `robot_in_map`.
 * - Position écran = `coordinatesConverter.vacuumToMap(x, y)` puis `/ natW,natH * 100`
 *   (pourcentages, PAS de `Context.roundMap` sur ce chemin — valeur exacte attendue).
 * - Cap écran = atan2 sur un vecteur direction transformé par la même calibration
 *   (invariant par une simple mise à l'échelle ×10, donc heading écran == heading vacuum
 *   pour la calibration de test qui est un pur scale sans rotation).
 */
import { describe, it, expect, afterEach } from "vitest";

import "../src/dreame-vacuum-card";
import { makeHass, makeCardConfig, until, IMG_W, IMG_H, ROOM_1_CENTER_PX, type CardElement } from "./fixtures/hass";

afterEach(() => {
    document.querySelectorAll("dreame-vacuum-card").forEach((el) => el.remove());
});

/** Monte la carte avec `vacuum_position` déjà présent sur la caméra AVANT le premier rendu
 *  (mutation directe de l'objet hass renvoyé par makeHass, avant assignation à la carte). */
function mountCardWithRobotPosition(
    vacuumState: string,
    position: { x: number; y: number; a: number }
): { card: CardElement; hass: Record<string, unknown> } {
    const built = makeHass(vacuumState);
    const states = built.hass.states as Record<string, { attributes: Record<string, unknown> }>;
    states["camera.test_map"].attributes["vacuum_position"] = position;

    const config = makeCardConfig({ robot_overlay: true });
    const card = document.createElement("dreame-vacuum-card") as CardElement;
    card.setConfig(config);
    card.hass = built.hass;
    document.body.appendChild(card);
    return { card, hass: built.hass };
}

describe("dreame-vacuum-card — overlay de position du robot", () => {
    it("positionne dreame-robot-marker selon vacuum_position (calibration ×10) avec cap 0°", async () => {
        const { card } = mountCardWithRobotPosition("docked", {
            x: ROOM_1_CENTER_PX.x * 10,
            y: ROOM_1_CENTER_PX.y * 10,
            a: 0,
        });
        await until(() => !!card.shadowRoot?.querySelector("#map-image"));
        const img = card.shadowRoot!.querySelector<HTMLImageElement>("#map-image")!;
        await until(() => img.complete && img.naturalWidth > 0);

        const marker = card.shadowRoot!.querySelector("dreame-robot-marker") as HTMLElement & {
            visible: boolean;
            xPercent: number;
            yPercent: number;
            headingDeg: number;
        };
        await until(() => !!marker && marker.visible === true);

        const expectedXPct = (ROOM_1_CENTER_PX.x / IMG_W) * 100;
        const expectedYPct = (ROOM_1_CENTER_PX.y / IMG_H) * 100;
        expect(marker.xPercent).toBeCloseTo(expectedXPct, 5);
        expect(marker.yPercent).toBeCloseTo(expectedYPct, 5);
        expect(marker.headingDeg).toBeCloseTo(0, 5);
    });

    it("oriente le marqueur selon le cap (a=90°) — calibration sans rotation, cap conservé", async () => {
        const { card } = mountCardWithRobotPosition("docked", {
            x: ROOM_1_CENTER_PX.x * 10,
            y: ROOM_1_CENTER_PX.y * 10,
            a: 90,
        });
        await until(() => !!card.shadowRoot?.querySelector("#map-image"));
        const img = card.shadowRoot!.querySelector<HTMLImageElement>("#map-image")!;
        await until(() => img.complete && img.naturalWidth > 0);

        const marker = card.shadowRoot!.querySelector("dreame-robot-marker") as HTMLElement & {
            visible: boolean;
            headingDeg: number;
        };
        await until(() => !!marker && marker.visible === true);
        expect(marker.headingDeg).toBeCloseTo(90, 5);
    });

    it("affiche le marqueur actif (halo) quand le robot nettoie activement", async () => {
        const { card } = mountCardWithRobotPosition("cleaning", {
            x: ROOM_1_CENTER_PX.x * 10,
            y: ROOM_1_CENTER_PX.y * 10,
            a: 0,
        });
        await until(() => !!card.shadowRoot?.querySelector("#map-image"));
        const img = card.shadowRoot!.querySelector<HTMLImageElement>("#map-image")!;
        await until(() => img.complete && img.naturalWidth > 0);

        const marker = card.shadowRoot!.querySelector("dreame-robot-marker") as HTMLElement & {
            visible: boolean;
            active: boolean;
        };
        await until(() => !!marker && marker.visible === true);
        expect(marker.active).toBe(true);
    });

    it("ne rend pas le marqueur (visible=false) sans robot_overlay ni vacuum_position", async () => {
        const built = makeHass("docked");
        const config = makeCardConfig();
        const card = document.createElement("dreame-vacuum-card") as CardElement;
        card.setConfig(config);
        card.hass = built.hass;
        document.body.appendChild(card);

        await until(() => !!card.shadowRoot?.querySelector("#map-image"));
        const img = card.shadowRoot!.querySelector<HTMLImageElement>("#map-image")!;
        await until(() => img.complete && img.naturalWidth > 0);
        await card.updateComplete;

        const marker = card.shadowRoot!.querySelector("dreame-robot-marker") as HTMLElement & {
            visible: boolean;
        };
        expect(marker).toBeTruthy();
        expect(marker.visible).toBe(false);
    });
});

/** Pousse une nouvelle vacuum_position via une MAJ hass immuable (même pattern que
 *  map-double-buffering : nouvelle référence states → hasConfigOrAnyEntityChanged). */
function pushRobotPosition(
    card: CardElement,
    hass: Record<string, unknown>,
    position: { x: number; y: number; a: number }
): void {
    const prevStates = hass.states as Record<string, { attributes: Record<string, unknown> }>;
    const newStates = {
        ...prevStates,
        "camera.test_map": {
            ...prevStates["camera.test_map"],
            attributes: { ...prevStates["camera.test_map"].attributes, vacuum_position: position },
        },
    };
    card.hass = { ...hass, states: newStates };
}

describe("dreame-robot-marker — interpolation adaptative (contrat §5.D)", () => {
    it("adapte la durée de glisse à la cadence mesurée des échantillons de position", async () => {
        const base = { x: ROOM_1_CENTER_PX.x * 10, y: ROOM_1_CENTER_PX.y * 10, a: 0 };
        const { card, hass } = mountCardWithRobotPosition("cleaning", base);
        await until(() => !!card.shadowRoot?.querySelector("#map-image"));
        const img = card.shadowRoot!.querySelector<HTMLImageElement>("#map-image")!;
        await until(() => img.complete && img.naturalWidth > 0);

        const marker = card.shadowRoot!.querySelector("dreame-robot-marker") as HTMLElement & {
            visible: boolean;
            transitionMs: number;
        };
        await until(() => !!marker && marker.visible === true);
        // Avant toute cadence mesurée : durée de glisse par défaut.
        expect(marker.transitionMs).toBe(400);

        // Échantillon suivant ~650 ms plus tard → glisse ≈ 90 % de l'intervalle mesuré.
        await new Promise((r) => setTimeout(r, 650));
        pushRobotPosition(card, hass, { ...base, x: base.x + 300 });
        await until(() => marker.transitionMs > 400);
        expect(marker.transitionMs).toBeGreaterThan(400);
        expect(marker.transitionMs).toBeLessThan(1500);

        // La transition CSS est bien pilotée par la variable posée en style inline.
        const markerDiv = marker.shadowRoot!.querySelector<HTMLElement>("#marker")!;
        expect(markerDiv.style.getPropertyValue("--rm-glide")).toBe(`${marker.transitionMs}ms`);

        // Échantillon quasi immédiat → borne basse (clamp à 400 ms, jamais en dessous).
        pushRobotPosition(card, hass, { ...base, x: base.x + 600 });
        await until(() => marker.transitionMs === 400);
    });
});

describe("dreame-robot-marker — déroulé du cap (évite le tour complet à ±180°)", () => {
    it("garde le cap continu quand la valeur brute franchit +178° -> -175°", async () => {
        // Calibration de test = pur scale ×10 sans rotation -> le cap écran suit
        // directement `robotPos.a`, donc on peut choisir `a` pour franchir la limite
        // de atan2 (178° -> -175° est une rotation physique de ~7°, pas ~353°).
        const base = { x: ROOM_1_CENTER_PX.x * 10, y: ROOM_1_CENTER_PX.y * 10, a: 178 };
        const { card, hass } = mountCardWithRobotPosition("cleaning", base);
        await until(() => !!card.shadowRoot?.querySelector("#map-image"));
        const img = card.shadowRoot!.querySelector<HTMLImageElement>("#map-image")!;
        await until(() => img.complete && img.naturalWidth > 0);

        const marker = card.shadowRoot!.querySelector("dreame-robot-marker") as HTMLElement & {
            visible: boolean;
            headingDeg: number;
        };
        await until(() => !!marker && marker.visible === true);
        expect(marker.headingDeg).toBeCloseTo(178, 5);
        const before = marker.headingDeg;

        pushRobotPosition(card, hass, { ...base, a: -175 });
        await until(() => marker.headingDeg !== before);
        const after = marker.headingDeg;

        // Continuité : le delta appliqué doit être le petit virage (~7°), pas le grand
        // tour (~353°) qu'un simple atan2 non déroulé produirait.
        expect(Math.abs(after - before)).toBeLessThan(180);
        expect(after).toBeCloseTo(185, 5);
    });
});
