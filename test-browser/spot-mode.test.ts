/**
 * Onglet « Point » : un toucher sur la carte pose un point manuel, puis « Nettoyer »
 * appelle `dreame_vacuum.vacuum_clean_spot` avec ce point et le nombre de passages.
 *
 * Flux réel exercé : `_handleTabChange("spot")` active le mode MANUAL_POINT servi par
 * `vacuum_clean_spot` (template Dreame `vacuum_clean_point`), `_mouseDown`/`_mouseUp`
 * sur `#svg-wrapper` créent le `ManualPoint`, le bouton de passages fait tourner
 * `repeats` et `_run()` construit l'appel de service.
 */
import { describe, it, expect, afterEach } from "vitest";

import "../src/dreame-vacuum-card";
import { mountCard, makeCardConfig, until, IMG_W, type CardElement } from "./fixtures/hass";

afterEach(() => {
    document.querySelectorAll("dreame-vacuum-card").forEach((el) => el.remove());
});

function tabButtons(card: CardElement): HTMLButtonElement[] {
    const tabSelector = card.shadowRoot!.querySelector("dreame-tab-selector")!;
    return Array.from(tabSelector.shadowRoot?.querySelectorAll<HTMLButtonElement>("button.tab") ?? []);
}

async function mountReady(config = makeCardConfig()): Promise<ReturnType<typeof mountCard>> {
    const mounted = mountCard(config);
    const { card } = mounted;
    await until(() => !!card.shadowRoot?.querySelector("#map-image"));
    const img = card.shadowRoot!.querySelector<HTMLImageElement>("#map-image")!;
    await until(() => img.complete && img.naturalWidth > 0);
    await until(() => !!card.shadowRoot?.querySelector("dreame-tab-selector"));
    await until(() => tabButtons(card).length > 0);
    return mounted;
}

describe("dreame-vacuum-card — onglet Point (nettoyage par point)", () => {
    it("affiche un quatrième onglet « Point », masquable par show_spot: false", async () => {
        const { card } = await mountReady();
        expect(tabButtons(card)).toHaveLength(4);
        card.remove();

        const hidden = await mountReady(makeCardConfig({ show_spot: false }));
        expect(tabButtons(hidden.card)).toHaveLength(3);
    });

    it("un toucher pose le point, puis Nettoyer appelle vacuum_clean_spot avec les passages", async () => {
        const { card, calls } = await mountReady();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cardAny = card as any;
        tabButtons(card)[3].click();
        await until(() => cardAny.activeTab === "spot");
        await card.updateComplete;
        expect(card.shadowRoot!.querySelector(".map-hint")).toBeTruthy();

        await until(() => typeof cardAny.realScale === "number" && cardAny.realScale > 0);
        const realScale: number = cardAny.realScale;
        const svgWrapper = card.shadowRoot!.querySelector<SVGSVGElement>("#svg-wrapper")!;
        const svgRect = svgWrapper.getBoundingClientRect();
        const at = { clientX: svgRect.left + 80 * realScale, clientY: svgRect.top + 60 * realScale };
        svgWrapper.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true, button: 0, ...at }));
        svgWrapper.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, cancelable: true, button: 0, ...at }));
        await until(() => !!cardAny.selectedManualPoint);
        await card.updateComplete;
        expect(card.shadowRoot!.querySelector(".map-hint")).toBeNull();
        expect(card.shadowRoot!.querySelector("circle.manual-point")).toBeTruthy();

        // Deux passages via le bouton x1 → x2.
        card.shadowRoot!.querySelector<HTMLElement>(".cycle-counter")!.click();
        expect(cardAny.repeats).toBe(2);
        await card.updateComplete;

        const actionButtons = card.shadowRoot!.querySelector("dreame-action-buttons") as HTMLElement & {
            updateComplete: Promise<boolean>;
        };
        await actionButtons.updateComplete;
        actionButtons.shadowRoot!.querySelector<HTMLButtonElement>(".action-btn.primary")!.click();

        await until(() => calls.length === 1);
        expect(calls[0].domain).toBe("dreame_vacuum");
        expect(calls[0].service).toBe("vacuum_clean_spot");
        expect(calls[0].data.entity_id).toBe("vacuum.test");
        expect(calls[0].data.repeats).toBe(2);
        const points = calls[0].data.points as number[];
        expect(points).toHaveLength(2);
        // Calibration de test : vacuum = image × 10.
        expect(Math.abs(points[0] - 800)).toBeLessThanOrEqual(10);
        expect(Math.abs(points[1] - 600)).toBeLessThanOrEqual(10);
        points.forEach((v) => expect(Math.abs(v)).toBeLessThanOrEqual(IMG_W * 10));
    });
});
