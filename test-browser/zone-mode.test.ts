/**
 * Mode "Zone" : glisser-déposer d'un rectangle manuel + appel de service de nettoyage
 * de zone.
 *
 * Flux réel exercé (lu dans src/dreame-vacuum-card.ts et model/map_objects/manual-rectangle.ts) :
 * - `_handleTabChange("zone")` active le mode MANUAL_RECTANGLE (`vacuum_clean_zone` côté
 *   template Dreame) puis ajoute automatiquement un premier rectangle via `_addRectangle()`
 *   (comportement réel de la carte, pas un raccourci de test).
 * - Le drag d'un rectangle se fait en deux temps : `ManualRectangle._startDrag` (lié
 *   directement sur le `<polygon class="draggable movable">`) capture le point de départ,
 *   puis soit `_drag` (si la souris reste sur le polygone), soit `_mouseMove` du composant
 *   principal → `externalDrag` (si la souris sort du polygone mais reste sur `#svg-wrapper`)
 *   met à jour `_vacRect`. On reproduit ici le cas "external drag", le plus robuste.
 * - `getMousePosition` (src/utils/dom.ts) utilise `event.offsetX/offsetY` pour les
 *   MouseEvent — Chrome calcule cet offset relativement à la boîte de l'élément SVG racine
 *   (`#svg-wrapper`, qui n'a pas de viewBox donc 1 unité = 1px CSS) quel que soit
 *   l'élément SVG enfant réellement ciblé (les enfants SVG n'ont pas de boîte CSS propre).
 * - `_run()` construit l'appel `dreame_vacuum.vacuum_clean_zone` avec `zone` = liste des
 *   rectangles sélectionnés convertis en coordonnées vacuum (`ManualRectangle.toVacuum()`,
 *   arrondies via `Context.roundMap`).
 */
import { describe, it, expect, afterEach } from "vitest";

import "../src/dreame-vacuum-card";
import { mountCard, until, IMG_W, type CardElement } from "./fixtures/hass";

afterEach(() => {
    document.querySelectorAll("dreame-vacuum-card").forEach((el) => el.remove());
});

interface InternalRect {
    toVacuum(repeats?: number | null): number[];
}

async function activateZoneTab(card: CardElement): Promise<void> {
    await until(() => !!card.shadowRoot?.querySelector("dreame-tab-selector"));
    const tabSelector = card.shadowRoot!.querySelector("dreame-tab-selector")!;
    await until(() => !!tabSelector.shadowRoot?.querySelectorAll("button.tab").length);
    const zoneButton = tabSelector.shadowRoot!.querySelectorAll<HTMLButtonElement>("button.tab")[2];
    zoneButton.click();
    await card.updateComplete;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await until(() => ((card as any).selectedManualRectangles?.length ?? 0) === 1);
}

describe("dreame-vacuum-card — mode Zone (rectangle manuel)", () => {
    it("active le mode zone avec un rectangle initial, puis permet de le déplacer par drag", async () => {
        const { card } = mountCard();
        await until(() => !!card.shadowRoot?.querySelector("#map-image"));
        const img = card.shadowRoot!.querySelector<HTMLImageElement>("#map-image")!;
        await until(() => img.complete && img.naturalWidth > 0);

        await activateZoneTab(card);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cardAny = card as any;
        await until(() => typeof cardAny.realScale === "number" && cardAny.realScale > 0);
        const realScale: number = cardAny.realScale;

        const rectObj = cardAny.selectedManualRectangles[0] as InternalRect;
        const beforeVac = rectObj.toVacuum();
        expect(beforeVac).toHaveLength(4);

        const svgWrapper = card.shadowRoot!.querySelector<SVGSVGElement>("#svg-wrapper")!;
        const polygon = card.shadowRoot!.querySelector<SVGPolygonElement>(
            "polygon.manual-rectangle.draggable.movable"
        )!;
        expect(polygon).toBeTruthy();

        const svgRect = svgWrapper.getBoundingClientRect();
        // Point de départ/arrivée en pixels de l'image NATURELLE (mêmes unités que IMG_W/IMG_H) —
        // (100,70) tombe dans le rectangle par défaut (environ [66.7,133.3] x [46.7,93.3]),
        // (130,90) simule un déplacement de +30/+20 px image vers le bas-droite.
        const startImg = { x: 100, y: 70 };
        const endImg = { x: 130, y: 90 };
        const clientOf = (p: { x: number; y: number }) => ({
            clientX: svgRect.left + p.x * realScale,
            clientY: svgRect.top + p.y * realScale,
        });
        const start = clientOf(startImg);
        const end = clientOf(endImg);

        // mousedown SUR le polygone (nécessaire : _startDrag vérifie la classe "draggable").
        polygon.dispatchEvent(
            new MouseEvent("mousedown", { bubbles: true, cancelable: true, button: 0, ...start })
        );
        // mousemove hors du polygone mais sur le conteneur SVG -> chemin "external drag".
        svgWrapper.dispatchEvent(
            new MouseEvent("mousemove", { bubbles: true, cancelable: true, button: 0, ...end })
        );
        // mouseup sur le polygone -> termine le drag proprement (_endDrag).
        polygon.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, cancelable: true, button: 0, ...end }));
        await card.updateComplete;

        const afterVac = rectObj.toVacuum();

        // Le rectangle a bougé : la calibration de test est vacuum = image × 10 (affine pure,
        // sans rotation ni offset), donc le delta vacuum attendu = delta image px × 10.
        // Tolérance généreuse : deux arrondis indépendants (point de départ et d'arrivée)
        // introduisent au plus ±1 unité vacuum chacun.
        const idealDeltaX = (endImg.x - startImg.x) * 10;
        const idealDeltaY = (endImg.y - startImg.y) * 10;
        const actualDeltaX0 = afterVac[0] - beforeVac[0];
        const actualDeltaX1 = afterVac[2] - beforeVac[2];
        const actualDeltaY0 = afterVac[1] - beforeVac[1];
        const actualDeltaY1 = afterVac[3] - beforeVac[3];

        expect(Math.abs(actualDeltaX0 - idealDeltaX)).toBeLessThanOrEqual(3);
        expect(Math.abs(actualDeltaX1 - idealDeltaX)).toBeLessThanOrEqual(3);
        expect(Math.abs(actualDeltaY0 - idealDeltaY)).toBeLessThanOrEqual(3);
        expect(Math.abs(actualDeltaY1 - idealDeltaY)).toBeLessThanOrEqual(3);
    });

    it("appelle dreame_vacuum.vacuum_clean_zone avec les coordonnées du rectangle affiché", async () => {
        const { card, calls } = mountCard();
        await until(() => !!card.shadowRoot?.querySelector("#map-image"));
        const img = card.shadowRoot!.querySelector<HTMLImageElement>("#map-image")!;
        await until(() => img.complete && img.naturalWidth > 0);

        await activateZoneTab(card);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cardAny = card as any;
        const rectObj = cardAny.selectedManualRectangles[0] as InternalRect;
        const expectedZone = rectObj.toVacuum();

        // Cohérence de grandeur : les coordonnées vacuum doivent rester dans l'ordre de
        // grandeur "image × 10" (0..IMG_W*10), pas dans un tout autre référentiel.
        expectedZone.forEach((v) => expect(Math.abs(v)).toBeLessThanOrEqual(IMG_W * 10));

        await card.updateComplete;
        const actionButtons = card.shadowRoot!.querySelector("dreame-action-buttons") as HTMLElement & {
            updateComplete: Promise<boolean>;
        };
        await actionButtons.updateComplete;
        const primaryBtn = actionButtons.shadowRoot!.querySelector<HTMLButtonElement>(".action-btn.primary")!;
        primaryBtn.click();

        await until(() => calls.length === 1);
        expect(calls[0].domain).toBe("dreame_vacuum");
        expect(calls[0].service).toBe("vacuum_clean_zone");
        expect(calls[0].data.entity_id).toBe("vacuum.test");
        expect(calls[0].data.repeats).toBe(1);
        expect(calls[0].data.zone).toEqual([expectedZone]);
    });
});
