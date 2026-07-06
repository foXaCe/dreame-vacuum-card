/**
 * Chargement paresseux de l'animation Lottie (plan 013).
 *
 * `src/components/robot-animation.ts` importe désormais lottie-web et les JSON
 * d'animation via `import()` dynamique au lieu d'un import statique dans le bundle
 * principal (rollup.config.js les sort en chunks séparés). Ce test de fumée vérifie,
 * dans un vrai navigateur (pas happy-dom, qui n'implémente pas le canvas 2D touché par
 * lottie-web à l'exécution — cf. le mock dans test/components.test.ts), que le
 * chargement dynamique aboutit réellement de bout en bout : le chunk se résout, se
 * charge, et le SVG rendu par lottie-web est bien injecté dans #lottie-container.
 */
import { describe, it, expect, afterEach } from "vitest";

import "../src/dreame-vacuum-card";
import { makeHass, makeCardConfig, until, type CardElement } from "./fixtures/hass";

afterEach(() => {
    document.querySelectorAll("dreame-vacuum-card").forEach((el) => el.remove());
});

describe("dreame-robot-animation — chargement paresseux (lottie-web + JSON via import())", () => {
    it("charge et affiche l'animation lottie pour l'état washing", async () => {
        const built = makeHass("cleaning", {}, { "sensor.test_state": { state: "washing" } });
        // `_resolveStateSensor` (dreame-vacuum-card.ts) cherche, parmi les entités du
        // même device_id que le vacuum, un `sensor.*_state` — l'enregistrer ici pour que
        // `robotState` soit dérivé de cet état plutôt que rester vide.
        const entities = built.hass.entities as Record<string, { device_id: string }>;
        entities["sensor.test_state"] = { device_id: "device_test" };

        const config = makeCardConfig();
        const card = document.createElement("dreame-vacuum-card") as CardElement;
        card.setConfig(config);
        card.hass = built.hass;
        document.body.appendChild(card);

        await until(() => !!card.shadowRoot?.querySelector("#map-image"));

        const anim = card.shadowRoot!.querySelector("dreame-robot-animation") as HTMLElement;
        expect(anim).toBeTruthy();

        // Le container existe dès le premier rendu ; le SVG lottie n'apparaît qu'après
        // résolution des deux import() dynamiques (moteur + JSON) et l'appel à
        // lottie.loadAnimation(). Attendre l'un ne prouve pas l'autre.
        await until(() => !!anim.shadowRoot?.getElementById("lottie-container"));
        await until(() => !!anim.shadowRoot?.getElementById("lottie-container")?.hasChildNodes(), 8000);

        const container = anim.shadowRoot!.getElementById("lottie-container")!;
        expect(container.querySelector("svg")).not.toBeNull();
    });
});
