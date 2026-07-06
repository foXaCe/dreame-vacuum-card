import { describe, it, expect, afterEach } from "vitest";

import "../src/dreame-vacuum-card";
import { makeHass, makeCardConfig, until, IMG_W } from "./fixtures/hass";

interface CardElement extends HTMLElement {
    setConfig(config: unknown): void;
    hass: unknown;
    getCardSize(): number;
    getGridOptions(): Record<string, unknown>;
}

function mountCard(config = makeCardConfig(), vacuumState = "docked") {
    const { hass, calls } = makeHass(vacuumState);
    const card = document.createElement("dreame-vacuum-card") as CardElement;
    card.setConfig(config);
    card.hass = hass;
    document.body.appendChild(card);
    return { card, hass, calls };
}

afterEach(() => {
    document.querySelectorAll("dreame-vacuum-card").forEach((el) => el.remove());
});

describe("dreame-vacuum-card — montage en navigateur réel", () => {
    it("monte, décode l'image de carte et retire le skeleton", async () => {
        const { card } = mountCard();

        await until(() => !!card.shadowRoot?.querySelector<HTMLImageElement>("#map-image"));
        const img = card.shadowRoot!.querySelector<HTMLImageElement>("#map-image")!;
        await until(() => img.complete && img.naturalWidth > 0);
        expect(img.naturalWidth).toBe(IMG_W);

        // Le skeleton disparaît une fois la première image décodée.
        await until(() => card.shadowRoot!.querySelector("#map-skeleton") === null);
    });

    it("rend le ha-card racine, le sélecteur d'onglets et les boutons d'action", async () => {
        const { card } = mountCard();
        await until(() => !!card.shadowRoot?.querySelector("ha-card"));
        await until(() => !!card.shadowRoot?.querySelector("dreame-tab-selector"));
        await until(() => !!card.shadowRoot?.querySelector("dreame-action-buttons"));
    });

    it("n'affiche PAS l'avertissement calibration avec une calibration caméra saine", async () => {
        const { card } = mountCard();
        await until(() => !!card.shadowRoot?.querySelector("#map-image"));
        expect(card.shadowRoot!.textContent).not.toContain("Invalid calibration");
    });
});
