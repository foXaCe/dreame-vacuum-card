/**
 * Sélection de pièces par hit-test (mode "Pièce") + appel de service.
 *
 * Flux réel exercé (lu dans src/dreame-vacuum-card.ts) :
 * - `_handleTabChange("room")` active le mode ROOM (`vacuum_clean_segment` côté template
 *   Dreame) et déclenche la construction du pick canvas via `_overlayDirty`.
 * - `_buildPickCanvas` / `_loadSegmentMap` décodent le `segment_map` (canal bleu = ID de
 *   segment) de façon ASYNCHRONE (Image.onload) : il faut attendre `_pickCanvas` avant de
 *   cliquer, sans quoi `_hitTestRoom` renvoie toujours `null`.
 * - `_hitTestRoom` calcule la position cliquée en fraction de `#map-image.getBoundingClientRect()`
 *   (indépendant du zoom/realScale), donc un clic à l'écran correspondant à la fraction
 *   (px/IMG_W, px/IMG_H) touche exactement le pixel (px, py) du pick buffer.
 * - `Room.toggleFromHitTest()` bascule la sélection ; `_run()` construit l'appel de service
 *   `dreame_vacuum.vacuum_clean_segment` à partir du template Dreame (segments = IDs bruts,
 *   repeats séparé, entity_id dans serviceData — cf. Tasshack_dreame-vacuum.json).
 */
import { describe, it, expect, afterEach } from "vitest";

import "../src/dreame-vacuum-card";
import {
    mountCard,
    until,
    IMG_W,
    IMG_H,
    ROOM_1_CENTER_PX,
    ROOM_2_CENTER_PX,
    type CardElement,
} from "./fixtures/hass";

afterEach(() => {
    document.querySelectorAll("dreame-vacuum-card").forEach((el) => el.remove());
});

/** Simule un clic natif sur la carte à un pixel de l'image NATURELLE (mêmes unités que
 *  ROOM_1_PX/ROOM_2_PX). Reproduit le calcul de `_hitTestRoom` : fraction de la boîte de
 *  `#map-image` à l'écran, indépendante du zoom (`realScale`). */
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

/** Active l'onglet "Pièce" via un vrai clic sur le sélecteur d'onglets (pas un appel direct
 *  de méthode interne), puis attend que le pick canvas soit prêt pour le hit-test. */
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return ((card as any).selectedRooms as Array<{ toVacuum(): string | number }>).map((r) => String(r.toVacuum()));
}

describe("dreame-vacuum-card — sélection de pièce par hit-test", () => {
    it("sélectionne la pièce 1 au clic central, la désélectionne au re-clic", async () => {
        const { card } = mountCard();
        await until(() => !!card.shadowRoot?.querySelector("#map-image"));
        const img = card.shadowRoot!.querySelector<HTMLImageElement>("#map-image")!;
        await until(() => img.complete && img.naturalWidth > 0);
        await activateRoomTabAndWaitPickCanvas(card);

        expect(selectedRoomIds(card)).toEqual([]);

        clickMapAtImagePixel(card, ROOM_1_CENTER_PX.x, ROOM_1_CENTER_PX.y);
        await until(() => selectedRoomIds(card).length === 1);
        expect(selectedRoomIds(card)).toEqual(["1"]);

        // Re-clic sur la même pièce -> désélection.
        clickMapAtImagePixel(card, ROOM_1_CENTER_PX.x, ROOM_1_CENTER_PX.y);
        await until(() => selectedRoomIds(card).length === 0);
        expect(selectedRoomIds(card)).toEqual([]);
    });

    it("un clic hors de toute pièce ne sélectionne rien", async () => {
        const { card } = mountCard();
        await until(() => !!card.shadowRoot?.querySelector("#map-image"));
        const img = card.shadowRoot!.querySelector<HTMLImageElement>("#map-image")!;
        await until(() => img.complete && img.naturalWidth > 0);
        await activateRoomTabAndWaitPickCanvas(card);

        // (5,5) : coin haut-gauche de l'image, en dehors des deux rectangles de pièces
        // (qui commencent à x=20/y=20) -> canal bleu = 0 dans le segment_map de test.
        clickMapAtImagePixel(card, 5, 5);
        // Laisse un cycle de rendu s'écouler pour être sûr qu'un hit tardif n'apparaisse pas.
        await card.updateComplete;
        expect(selectedRoomIds(card)).toEqual([]);
    });

    it("sélectionne les deux pièces quand on clique successivement sur chacune", async () => {
        const { card } = mountCard();
        await until(() => !!card.shadowRoot?.querySelector("#map-image"));
        const img = card.shadowRoot!.querySelector<HTMLImageElement>("#map-image")!;
        await until(() => img.complete && img.naturalWidth > 0);
        await activateRoomTabAndWaitPickCanvas(card);

        clickMapAtImagePixel(card, ROOM_1_CENTER_PX.x, ROOM_1_CENTER_PX.y);
        await until(() => selectedRoomIds(card).length === 1);

        clickMapAtImagePixel(card, ROOM_2_CENTER_PX.x, ROOM_2_CENTER_PX.y);
        await until(() => selectedRoomIds(card).length === 2);

        expect(selectedRoomIds(card).sort()).toEqual(["1", "2"]);
    });

    it("appelle dreame_vacuum.vacuum_clean_segment avec les IDs sélectionnés au clic sur Nettoyer", async () => {
        const { card, calls } = mountCard();
        await until(() => !!card.shadowRoot?.querySelector("#map-image"));
        const img = card.shadowRoot!.querySelector<HTMLImageElement>("#map-image")!;
        await until(() => img.complete && img.naturalWidth > 0);
        await activateRoomTabAndWaitPickCanvas(card);

        clickMapAtImagePixel(card, ROOM_1_CENTER_PX.x, ROOM_1_CENTER_PX.y);
        await until(() => selectedRoomIds(card).length === 1);
        clickMapAtImagePixel(card, ROOM_2_CENTER_PX.x, ROOM_2_CENTER_PX.y);
        await until(() => selectedRoomIds(card).length === 2);

        await card.updateComplete;
        const actionButtons = card.shadowRoot!.querySelector("dreame-action-buttons") as HTMLElement & {
            updateComplete: Promise<boolean>;
        };
        await actionButtons.updateComplete;
        const primaryBtn = actionButtons.shadowRoot!.querySelector<HTMLButtonElement>(".action-btn.primary")!;
        primaryBtn.click();

        await until(() => calls.length === 1);
        expect(calls[0].domain).toBe("dreame_vacuum");
        expect(calls[0].service).toBe("vacuum_clean_segment");
        expect(calls[0].data.entity_id).toBe("vacuum.test");
        expect(calls[0].data.repeats).toBe(1);
        expect((calls[0].data.segments as string[]).map(String).sort()).toEqual(["1", "2"]);
    });
});
