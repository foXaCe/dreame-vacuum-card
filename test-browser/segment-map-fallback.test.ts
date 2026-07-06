import { describe, it, expect, afterEach } from "vitest";

import "../src/dreame-vacuum-card";
import { makeHass, makeCardConfig, until, IMG_W, IMG_H, ROOM_1_CENTER_PX, type CardElement } from "./fixtures/hass";

/**
 * Backlog E du contrat (docs/INTEGRATION-CONTRACT.md) : depuis 2026-07-06, l'intégration
 * ne publie PLUS l'attribut `segment_map` quand son buffer est dégénéré (tout-à-zéro).
 * Le fallback de la carte se déclenche donc sur l'ABSENCE de l'attribut : le pick-canvas
 * est reconstruit depuis les bboxes/polygones de l'attribut `rooms` (canal bleu =
 * segment_id ?? parseInt(room_id)). Cette suite verrouille ce chemin de bout en bout.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

function mountCardWithoutSegmentMap(): { card: CardElement } {
    const { hass } = makeHass();
    delete (hass as any).states["camera.test_map"].attributes.segment_map;
    const card = document.createElement("dreame-vacuum-card") as CardElement;
    card.setConfig(makeCardConfig());
    card.hass = hass;
    document.body.appendChild(card);
    return { card };
}

/** Même mécanique que room-selection.test.ts : clic natif sur #svg-wrapper aux
 *  coordonnées écran correspondant à un pixel de l'image naturelle. */
function clickMapAtImagePixel(card: CardElement, ix: number, iy: number): void {
    const img = card.shadowRoot!.querySelector<HTMLImageElement>("#map-image")!;
    const svgWrapper = card.shadowRoot!.querySelector<SVGSVGElement>("#svg-wrapper")!;
    const rect = img.getBoundingClientRect();
    const clientX = rect.left + (ix / IMG_W) * rect.width;
    const clientY = rect.top + (iy / IMG_H) * rect.height;
    svgWrapper.dispatchEvent(
        new MouseEvent("click", { bubbles: true, cancelable: true, clientX, clientY, button: 0 })
    );
}

async function activateRoomTabAndWaitPickCanvas(card: CardElement): Promise<void> {
    await until(() => !!card.shadowRoot?.querySelector("dreame-tab-selector"));
    const tabSelector = card.shadowRoot!.querySelector("dreame-tab-selector")!;
    await until(() => !!tabSelector.shadowRoot?.querySelectorAll("button.tab").length);
    const roomButton = tabSelector.shadowRoot!.querySelectorAll<HTMLButtonElement>("button.tab")[0];
    roomButton.click();
    await card.updateComplete;
    await until(() => !!(card as unknown as { _pickCanvas?: unknown })._pickCanvas, 4000);
}

function selectedRoomIds(card: CardElement): string[] {
    return ((card as any).selectedRooms as Array<{ toVacuum(): string | number }>).map((r) => String(r.toVacuum()));
}

afterEach(() => {
    document.querySelectorAll("dreame-vacuum-card").forEach((el) => el.remove());
});

describe("fallback polygones — segment_map absent (contrat backlog E)", () => {
    it("construit le pick-canvas depuis les rooms et sélectionne la pièce 1 au clic", async () => {
        const { card } = mountCardWithoutSegmentMap();
        const img = () => card.shadowRoot?.querySelector<HTMLImageElement>("#map-image");
        await until(() => !!img() && img()!.complete && img()!.naturalWidth > 0);

        await activateRoomTabAndWaitPickCanvas(card);
        expect(selectedRoomIds(card)).toEqual([]);

        clickMapAtImagePixel(card, ROOM_1_CENTER_PX.x, ROOM_1_CENTER_PX.y);
        await until(() => selectedRoomIds(card).length === 1);
        expect(selectedRoomIds(card)).toEqual(["1"]);

        // Re-clic → désélection (comportement identique au chemin segment_map).
        clickMapAtImagePixel(card, ROOM_1_CENTER_PX.x, ROOM_1_CENTER_PX.y);
        await until(() => selectedRoomIds(card).length === 0);
    });

    it("un clic hors pièces ne sélectionne rien en mode fallback", async () => {
        const { card } = mountCardWithoutSegmentMap();
        const img = () => card.shadowRoot?.querySelector<HTMLImageElement>("#map-image");
        await until(() => !!img() && img()!.complete && img()!.naturalWidth > 0);

        await activateRoomTabAndWaitPickCanvas(card);

        // (5,5) : hors de toute pièce dans les fixtures (fond du pick-canvas → id 0).
        clickMapAtImagePixel(card, 5, 5);
        await new Promise((r) => setTimeout(r, 300));
        expect(selectedRoomIds(card)).toEqual([]);
        // IMG_H utilisé pour silence noUnusedLocals si jamais : coin bas hors pièce aussi.
        clickMapAtImagePixel(card, 5, IMG_H - 5);
        await new Promise((r) => setTimeout(r, 300));
        expect(selectedRoomIds(card)).toEqual([]);
    });
});
