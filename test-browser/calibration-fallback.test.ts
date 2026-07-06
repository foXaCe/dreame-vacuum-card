/**
 * Chemins de dégradation de `_getCalibration()` (src/dreame-vacuum-card.ts).
 *
 * `_getCalibration` a 6 sources (identity, calibration_points explicites,
 * entity+JSON.parse, entity+attribute, camera, plateforme). Les branches "entity"
 * dégradées (état "unknown", JSON tronqué) ne passent JAMAIS par une exception —
 * elles retournent `undefined` via un `catch` (l.749-756). Cette suite verrouille
 * ce comportement de dégradation douce, cas par cas.
 *
 * IMPORTANT (trouvaille produit, non corrigée ici — hors scope) : `CoordinatesConverter`
 * (src/model/map_objects/coordinates-converter.ts) traite `calibrationPoints === undefined`
 * comme « plateforme sans calibration nécessaire » et met `calibrated = true` par défaut
 * (transformation identité implicite). Ce chemin est AUSSI celui pris quand la calibration
 * attendue échoue à se charger (entité "unknown"/JSON invalide) : les deux cas sont
 * indistinguables une fois dans `CoordinatesConverter`. Résultat observé : une entité de
 * calibration dégradée ne fait PAS planter la carte (bien) mais ne signale PAS non plus
 * l'échec via `calibrated === false` (le champ vaut `true`) — la carte croit être calibrée
 * en identité map=vacuum, ce qui est presque certainement faux pour une vraie carte. Les
 * tests ci-dessous figent ce comportement OBSERVÉ (pas celui qu'on pourrait souhaiter).
 */
import { describe, it, expect, afterEach } from "vitest";

import "../src/dreame-vacuum-card";
import { mountCard, makeCardConfig, until, CALIBRATION_POINTS, type CardElement } from "./fixtures/hass";

/* eslint-disable @typescript-eslint/no-explicit-any */

afterEach(() => {
    document.querySelectorAll("dreame-vacuum-card").forEach((el) => el.remove());
});

function converterOf(card: CardElement): { calibrated: boolean } | undefined {
    return (card as any).coordinatesConverter;
}

/** Attend que la carte ait fait au moins un rendu complet (shadow root peuplé), sans
 *  présumer d'une valeur de calibration particulière. */
async function waitFirstRender(card: CardElement): Promise<void> {
    await until(() => !!card.shadowRoot?.querySelector("#map-image, hui-warning, hui-error-card"));
    await card.updateComplete;
}

describe("dreame-vacuum-card — dégradation de la calibration (_getCalibration)", () => {
    it("1. entity + JSON valide (3 points) -> calibré", async () => {
        const { card } = mountCard(
            makeCardConfig({ calibration_source: { entity: "sensor.cal" } }),
            "docked",
            {},
            { "sensor.cal": { state: JSON.stringify(CALIBRATION_POINTS) } }
        );
        await waitFirstRender(card);
        await until(() => converterOf(card)?.calibrated === true);
        expect(converterOf(card)?.calibrated).toBe(true);
    });

    it('2. entity + état "unknown" -> pas d\'exception, carte rendue (shadow root présent)', async () => {
        const { card } = mountCard(
            makeCardConfig({ calibration_source: { entity: "sensor.cal" } }),
            "docked",
            {},
            { "sensor.cal": { state: "unknown" } }
        );
        // Ne doit pas jeter : le simple fait d'atteindre cette ligne sans exception le prouve.
        await waitFirstRender(card);
        expect(card.shadowRoot?.querySelector("#map-image")).toBeTruthy();
        // Comportement OBSERVÉ (cf. commentaire d'en-tête) : `_getCalibration` renvoie bien
        // `undefined` (pas d'exception), mais `CoordinatesConverter(undefined)` retombe sur
        // l'identité implicite -> `calibrated === true`. On fige cette valeur observée.
        await until(() => converterOf(card) !== undefined);
        expect(converterOf(card)?.calibrated).toBe(true);
    });

    it("3. entity + JSON tronqué -> catch absorbe, pas d'exception, carte rendue", async () => {
        const { card } = mountCard(
            makeCardConfig({ calibration_source: { entity: "sensor.cal" } }),
            "docked",
            {},
            { "sensor.cal": { state: "{invalid json" } }
        );
        await waitFirstRender(card);
        expect(card.shadowRoot?.querySelector("#map-image")).toBeTruthy();
        // Même dégradation silencieuse que le cas 2 : voir commentaire d'en-tête.
        await until(() => converterOf(card) !== undefined);
        expect(converterOf(card)?.calibrated).toBe(true);
    });

    it("4. entity + attribute -> lit l'attribut, calibré", async () => {
        const { card } = mountCard(
            makeCardConfig({ calibration_source: { entity: "sensor.cal", attribute: "points" } }),
            "docked",
            {},
            { "sensor.cal": { state: "ok", attributes: { points: CALIBRATION_POINTS } } }
        );
        await waitFirstRender(card);
        await until(() => converterOf(card)?.calibrated === true);
        expect(converterOf(card)?.calibrated).toBe(true);
    });

    it("5. identity: true -> 3 points triviaux, calibré", async () => {
        const { card } = mountCard(makeCardConfig({ calibration_source: { identity: true } }));
        await waitFirstRender(card);
        await until(() => converterOf(card)?.calibrated === true);
        expect(converterOf(card)?.calibrated).toBe(true);
    });

    it("6. calibration_points explicites (3 points valides) -> calibré", async () => {
        const { card } = mountCard(
            makeCardConfig({ calibration_source: { calibration_points: CALIBRATION_POINTS } })
        );
        await waitFirstRender(card);
        await until(() => converterOf(card)?.calibrated === true);
        expect(converterOf(card)?.calibrated).toBe(true);
    });
});
