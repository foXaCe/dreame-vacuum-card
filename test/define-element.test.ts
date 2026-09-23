import { describe, expect, it } from "vitest";
import { defineElementOnce, safeCustomElement } from "../src/utils/define-element";

describe("defineElementOnce", () => {
    it("déclare l'élément quand le nom est libre", () => {
        class A extends HTMLElement {}
        defineElementOnce("dvc-test-libre", A);
        expect(customElements.get("dvc-test-libre")).toBe(A);
    });

    it("ne lève pas quand le nom est déjà pris et garde la première déclaration", () => {
        // Cas réel : une autre carte a déjà déclaré le même nom, ou la carte est
        // chargée deux fois sous deux URL. Un `define` qui lève au top-level
        // avorterait tout le bundle, et `dreame-vacuum-card` n'existerait jamais.
        class Premier extends HTMLElement {}
        class Second extends HTMLElement {}
        customElements.define("dvc-test-pris", Premier);
        expect(() => defineElementOnce("dvc-test-pris", Second)).not.toThrow();
        expect(customElements.get("dvc-test-pris")).toBe(Premier);
    });

    it("safeCustomElement se comporte en décorateur idempotent", () => {
        class Premier extends HTMLElement {}
        class Second extends HTMLElement {}
        safeCustomElement("dvc-test-deco")(Premier);
        expect(() => safeCustomElement("dvc-test-deco")(Second)).not.toThrow();
        expect(customElements.get("dvc-test-deco")).toBe(Premier);
    });
});
