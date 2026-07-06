/**
 * Cycle de vie du composant principal (`connectedCallback`/`disconnectedCallback`) :
 * - `render()` ne doit jamais lever quand `hass` n'est pas encore assigné (fenêtre
 *   possible entre `setConfig()` et l'assignation `.hass` par Lovelace, notamment en
 *   preview d'éditeur).
 * - `_initializeRooms()` doit arrêter sa chaîne de retries (setTimeout auto-reprogrammé,
 *   jusqu'à 20 fois / ~10s) dès que la carte est retirée du DOM, pour ne pas retenir son
 *   graphe d'objets en mémoire ni appeler `_getRoomsConfig()` sur une instance obsolète.
 */
import { describe, it, expect, afterEach } from "vitest";

import "../src/dreame-vacuum-card";
import { makeCardConfig, until, type CardElement } from "./fixtures/hass";

afterEach(() => {
    document.querySelectorAll("dreame-vacuum-card").forEach((el) => el.remove());
});

describe("dreame-vacuum-card — cycle de vie", () => {
    it("ne lève pas dans render() quand hass n'est jamais assigné", async () => {
        const card = document.createElement("dreame-vacuum-card") as CardElement;
        card.setConfig(makeCardConfig());
        document.body.appendChild(card);
        // Volontairement : on n'assigne jamais `card.hass`.

        await card.updateComplete;

        expect(card.shadowRoot).not.toBeNull();
    });

    it("arrête les retries de _initializeRooms à la déconnexion", async () => {
        const card = document.createElement("dreame-vacuum-card") as CardElement;
        card.setConfig(makeCardConfig());
        document.body.appendChild(card);
        await card.updateComplete;

        // Force le chemin de retry : `modes` vide déclenche la reprogrammation à 500ms.
        (card as any).modes = [];
        (card as any)._initializeRooms();

        await until(() => (card as any)._initializeRoomsRetries > 0);

        card.remove();

        const retriesAtDisconnect = (card as any)._initializeRoomsRetries;
        await new Promise((resolve) => setTimeout(resolve, 600));
        const retriesAfterWait = (card as any)._initializeRoomsRetries;

        expect(retriesAfterWait).toBe(retriesAtDisconnect);
    });
});
