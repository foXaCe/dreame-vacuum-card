/**
 * Navigation clavier du sélecteur d'onglets (components/tab-selector.ts).
 *
 * Flux réel exercé :
 * - Pattern WAI-ARIA "tabs" : `_handleTablistKeydown` écoute `keydown` sur le conteneur
 *   `role="tablist"`, gère ArrowRight/ArrowLeft (avec wrap) et déplace le focus ("roving
 *   tabindex" : seul l'onglet actif a `tabindex="0"`, les autres `tabindex="-1"`).
 * - `_selectTab` émet un CustomEvent `tab-changed` (bubbles + composed) que
 *   `dreame-vacuum-card` écoute pour répercuter le changement dans son propre état
 *   (`activeTab`) — on vérifie que les deux niveaux (sous-composant ET carte) se
 *   synchronisent réellement, pas seulement l'un des deux.
 */
import { describe, it, expect, afterEach } from "vitest";

import "../src/dreame-vacuum-card";
import { mountCard, until, type CardElement } from "./fixtures/hass";

afterEach(() => {
    document.querySelectorAll("dreame-vacuum-card").forEach((el) => el.remove());
});

async function getTabSelector(card: CardElement): Promise<HTMLElement> {
    await until(() => !!card.shadowRoot?.querySelector("dreame-tab-selector"));
    const tabSelector = card.shadowRoot!.querySelector("dreame-tab-selector")!;
    await until(() => !!tabSelector.shadowRoot?.querySelectorAll("button.tab").length);
    return tabSelector as HTMLElement;
}

function getTabButtons(tabSelector: HTMLElement): HTMLButtonElement[] {
    return Array.from(tabSelector.shadowRoot!.querySelectorAll<HTMLButtonElement>("button.tab"));
}

describe("dreame-vacuum-card — navigation clavier des onglets", () => {
    it("ArrowRight déplace le focus et l'onglet actif vers la droite (avec wrap)", async () => {
        const { card } = mountCard();
        const tabSelector = await getTabSelector(card);
        const buttons = getTabButtons(tabSelector);
        expect(buttons.map((b) => b.getAttribute("role"))).toEqual(["tab", "tab", "tab"]);

        // Onglet par défaut : "all" (index 1) — cf. `activeTab: "room"|"all"|"zone" = "all"`.
        expect(buttons[1].classList.contains("active")).toBe(true);
        expect(buttons[1].getAttribute("tabindex")).toBe("0");
        expect(buttons[0].getAttribute("tabindex")).toBe("-1");

        buttons[1].focus();
        buttons[1].dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true }));
        await (card as unknown as { updateComplete: Promise<boolean> }).updateComplete;
        await until(() => (tabSelector as unknown as { activeTab: string }).activeTab === "zone");

        // Le focus doit suivre l'onglet nouvellement actif (roving tabindex).
        await until(() => tabSelector.shadowRoot!.activeElement === getTabButtons(tabSelector)[2]);
        const buttonsAfterRight = getTabButtons(tabSelector);
        expect(buttonsAfterRight[2].classList.contains("active")).toBe(true);
        expect(buttonsAfterRight[2].getAttribute("aria-selected")).toBe("true");
        expect(buttonsAfterRight[2].getAttribute("tabindex")).toBe("0");
        expect(buttonsAfterRight[0].getAttribute("tabindex")).toBe("-1");
        expect(buttonsAfterRight[1].getAttribute("tabindex")).toBe("-1");

        // La carte elle-même a bien reçu le `tab-changed` (pas seulement le sous-composant).
        expect((card as unknown as { activeTab: string }).activeTab).toBe("zone");

        // Depuis "zone" (dernier onglet), ArrowRight doit boucler vers "room" (index 0).
        buttonsAfterRight[2].dispatchEvent(
            new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true })
        );
        await until(() => (tabSelector as unknown as { activeTab: string }).activeTab === "room");
        expect((card as unknown as { activeTab: string }).activeTab).toBe("room");
    });

    it("ArrowLeft déplace le focus et l'onglet actif vers la gauche (avec wrap)", async () => {
        const { card } = mountCard();
        const tabSelector = await getTabSelector(card);
        const buttons = getTabButtons(tabSelector);

        // Départ sur "all" (index 1) ; ArrowLeft -> "room" (index 0).
        buttons[1].focus();
        buttons[1].dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true, cancelable: true }));
        await until(() => (tabSelector as unknown as { activeTab: string }).activeTab === "room");
        expect((card as unknown as { activeTab: string }).activeTab).toBe("room");

        // Depuis "room" (premier onglet), ArrowLeft doit boucler vers "zone" (dernier, index 2).
        const roomButton = getTabButtons(tabSelector)[0];
        roomButton.dispatchEvent(
            new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true, cancelable: true })
        );
        await until(() => (tabSelector as unknown as { activeTab: string }).activeTab === "zone");
        await until(() => tabSelector.shadowRoot!.activeElement === getTabButtons(tabSelector)[2]);
        expect((card as unknown as { activeTab: string }).activeTab).toBe("zone");
    });
});
