/**
 * Overlay de sélection de pièces (assombrir tout sauf les pièces sélectionnées) —
 * assertions PIXEL sur le canvas `#room-selection-overlay` (src/dreame-vacuum-card.ts,
 * `_updateRoomSelectionOverlay`, l.1896+).
 *
 * Montage/hit-test repris de `room-selection.test.ts` (mêmes constantes de pièces,
 * même mécanique de clic natif sur `#svg-wrapper`). L'overlay est dessiné à la
 * résolution NATURELLE de l'image de carte (`mapImg.naturalWidth/Height`), qui vaut
 * IMG_W×IMG_H (200×140) dans le fixture — donc pas de mise à l'échelle à gérer pour
 * lire les pixels : les coordonnées ROOM_n_CENTER_PX s'appliquent directement au
 * canvas overlay.
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

/** Simule un clic natif sur la carte à un pixel de l'image NATURELLE — identique à
 *  room-selection.test.ts. */
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
    // Ordre des onglets (src/components/tab-selector.ts, _TAB_ORDER) : room, all, zone.
    const roomButton = tabSelector.shadowRoot!.querySelectorAll<HTMLButtonElement>("button.tab")[0];
    roomButton.click();
    await card.updateComplete;
    await until(() => !!(card as unknown as { _pickCanvas?: unknown })._pickCanvas, 4000);
}

function clickAllTab(card: CardElement): void {
    const tabSelector = card.shadowRoot!.querySelector("dreame-tab-selector")!;
    const allButton = tabSelector.shadowRoot!.querySelectorAll<HTMLButtonElement>("button.tab")[1];
    allButton.click();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function selectedRoomIds(card: CardElement): string[] {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return ((card as any).selectedRooms as Array<{ toVacuum(): string | number }>).map((r) => String(r.toVacuum()));
}

function overlayCanvas(card: CardElement): HTMLCanvasElement {
    return card.shadowRoot!.getElementById("room-selection-overlay") as HTMLCanvasElement;
}

/** Alpha (0-255) au pixel (ix, iy) de l'overlay — coordonnées image naturelle, valables
 *  1:1 puisque le canvas overlay est dimensionné à mapImg.naturalWidth/Height = IMG_W×IMG_H. */
function alphaAt(card: CardElement, ix: number, iy: number): number {
    const canvas = overlayCanvas(card);
    const ctx = canvas.getContext("2d")!;
    return ctx.getImageData(Math.round(ix), Math.round(iy), 1, 1).data[3];
}

async function mountInRoomModeWithRoom1Selected(): Promise<{ card: CardElement }> {
    const { card } = mountCard();
    await until(() => !!card.shadowRoot?.querySelector("#map-image"));
    const img = card.shadowRoot!.querySelector<HTMLImageElement>("#map-image")!;
    await until(() => img.complete && img.naturalWidth > 0);
    await activateRoomTabAndWaitPickCanvas(card);

    clickMapAtImagePixel(card, ROOM_1_CENTER_PX.x, ROOM_1_CENTER_PX.y);
    await until(() => selectedRoomIds(card).length === 1);
    await card.updateComplete;
    // L'overlay se redessine dans `updated()` après le cycle où `_overlayDirty` a été
    // posé par `_selectionChanged()` — un second `updateComplete` garantit qu'il a eu
    // lieu avant de lire les pixels.
    await card.updateComplete;
    await until(() => {
        const c = overlayCanvas(card);
        return !!c && c.width > 0 && c.height > 0;
    });
    return { card };
}

describe("dreame-vacuum-card — overlay de sélection de pièces (pixels)", () => {
    it("dimensionne l'overlay à la résolution naturelle de l'image de carte", async () => {
        const { card } = await mountInRoomModeWithRoom1Selected();
        const canvas = overlayCanvas(card);
        expect(canvas.width).toBe(IMG_W);
        expect(canvas.height).toBe(IMG_H);
    });

    it("éclaircit la pièce sélectionnée et assombrit la pièce non sélectionnée", async () => {
        const { card } = await mountInRoomModeWithRoom1Selected();

        const alphaSelected = alphaAt(card, ROOM_1_CENTER_PX.x, ROOM_1_CENTER_PX.y);
        const alphaUnselected = alphaAt(card, ROOM_2_CENTER_PX.x, ROOM_2_CENTER_PX.y);

        // Invariant relatif (pas de valeur absolue figée par design, cf. plan) :
        // sélectionné = transparent (voile absent), non sélectionné = assombri.
        expect(alphaSelected).toBeLessThan(alphaUnselected);
        expect(alphaUnselected).toBeGreaterThan(40);
        // La pièce sélectionnée est laissée totalement transparente par
        // `_updateRoomSelectionOverlay` (aucun `sd[pi+3] = ...` écrit -> reste 0).
        expect(alphaSelected).toBe(0);
    });

    it("désélectionner la pièce ré-assombrit uniformément (les deux pièces redeviennent équivalentes)", async () => {
        const { card } = await mountInRoomModeWithRoom1Selected();
        expect(selectedRoomIds(card)).toEqual(["1"]);

        // Re-clic sur la pièce 1 -> désélection (comportement vérifié par room-selection.test.ts).
        clickMapAtImagePixel(card, ROOM_1_CENTER_PX.x, ROOM_1_CENTER_PX.y);
        await until(() => selectedRoomIds(card).length === 0);
        await card.updateComplete;
        await card.updateComplete;

        const alpha1 = alphaAt(card, ROOM_1_CENTER_PX.x, ROOM_1_CENTER_PX.y);
        const alpha2 = alphaAt(card, ROOM_2_CENTER_PX.x, ROOM_2_CENTER_PX.y);

        // Comportement OBSERVÉ : plus aucune sélection -> `hasSelection` devient false et
        // TOUTES les pièces du plan repassent par la branche "assombrir" (aucune n'est plus
        // exemptée) -> les deux alphas redeviennent égaux (et > 40, assombris comme avant).
        expect(Math.abs(alpha1 - alpha2)).toBeLessThan(10);
        expect(alpha1).toBeGreaterThan(40);
        expect(alpha2).toBeGreaterThan(40);
    });

    it("quitter le mode pièce (onglet Tout) vide l'overlay", async () => {
        const { card } = await mountInRoomModeWithRoom1Selected();

        clickAllTab(card);
        await card.updateComplete;
        await card.updateComplete;

        // `_updateRoomSelectionOverlay` fait un `clearRect` complet hors mode "room"
        // (activeTab !== "room") -> alpha 0 partout, sondé sur les 2 centres de pièce
        // + un point hors-plan (proche de l'origine).
        expect(alphaAt(card, ROOM_1_CENTER_PX.x, ROOM_1_CENTER_PX.y)).toBe(0);
        expect(alphaAt(card, ROOM_2_CENTER_PX.x, ROOM_2_CENTER_PX.y)).toBe(0);
        expect(alphaAt(card, 2, 2)).toBe(0);
    });
});
