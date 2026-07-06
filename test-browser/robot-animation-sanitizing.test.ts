/**
 * Reproduction du signalement 2026-07-06 : serpillière en séchage/sanitisation
 * dans le dock (état capteur `sanitizing` sur l'Aqua10 réel), l'app Dreame montre
 * une animation, la carte n'affichait rien sur HA dev. Vérifie dans un vrai
 * navigateur que les états `sanitizing` et `sanitizing_with_dry` déclenchent
 * bien le chargement paresseux et le rendu SVG lottie, comme `washing`.
 */
import { describe, it, expect, afterEach } from "vitest";

import "../src/dreame-vacuum-card";
import { makeHass, makeCardConfig, until, type CardElement } from "./fixtures/hass";

afterEach(() => {
    document.querySelectorAll("dreame-vacuum-card").forEach((el) => el.remove());
});

async function mountWithState(state: string): Promise<HTMLElement> {
    const built = makeHass("docked", {}, { "sensor.test_state": { state } });
    const entities = built.hass.entities as Record<string, { device_id: string }>;
    entities["sensor.test_state"] = { device_id: "device_test" };

    const config = makeCardConfig();
    const card = document.createElement("dreame-vacuum-card") as CardElement;
    card.setConfig(config);
    card.hass = built.hass;
    document.body.appendChild(card);

    await until(() => !!card.shadowRoot?.querySelector("#map-image"));
    return card.shadowRoot!.querySelector("dreame-robot-animation") as HTMLElement;
}

describe("dreame-robot-animation — états sanitizing (dock, eau chaude)", () => {
    it("charge et affiche l'animation lottie pour l'état sanitizing", async () => {
        const anim = await mountWithState("sanitizing");
        expect(anim).toBeTruthy();

        await until(() => !!anim.shadowRoot?.getElementById("lottie-container"));
        await until(() => !!anim.shadowRoot?.getElementById("lottie-container")?.hasChildNodes(), 8000);

        const container = anim.shadowRoot!.getElementById("lottie-container")!;
        expect(container.querySelector("svg")).not.toBeNull();
        expect(getComputedStyle(anim).opacity).toBe("1");
    });

    it("charge et affiche l'animation lottie pour l'état sanitizing_with_dry", async () => {
        const anim = await mountWithState("sanitizing_with_dry");
        expect(anim).toBeTruthy();

        await until(() => !!anim.shadowRoot?.getElementById("lottie-container"));
        await until(() => !!anim.shadowRoot?.getElementById("lottie-container")?.hasChildNodes(), 8000);

        const container = anim.shadowRoot!.getElementById("lottie-container")!;
        expect(container.querySelector("svg")).not.toBeNull();
        expect(getComputedStyle(anim).opacity).toBe("1");
    });
});
