/**
 * Chemins de dégradation de `_getCalibration()` (src/dreame-vacuum-card.ts).
 *
 * `_getCalibration` a 6 sources (identity, calibration_points explicites,
 * entity+JSON.parse, entity+attribute, camera, plateforme). Les branches "entity"
 * dégradées (état "unknown", JSON tronqué) ne passent JAMAIS par une exception —
 * elles retournent `undefined` via un `catch` (`calibration-resolver.ts`).
 *
 * CORRIGÉ (constat plan 012, `plans/README.md`) : une calibration cassée était
 * indistinguable d'une calibration absente. `CoordinatesConverter(undefined)` posait
 * `calibrated = true` (identité implicite) que `_getCalibration` renvoie `undefined`
 * parce qu'AUCUNE calibration n'est nécessaire (plateforme en identité) OU parce que
 * la source configurée a ÉCHOUÉ à se résoudre (entité "unknown"/JSON invalide) — les
 * deux cas étaient confondus. Résultat : une entité de calibration dégradée ne faisait
 * pas planter la carte (bien) mais ne signalait pas non plus l'échec — la carte se
 * croyait calibrée en identité map=vacuum, presque certainement faux sur une vraie carte.
 *
 * Comportement désormais figé par cette suite : quand une `calibration_source` est
 * explicitement configurée (entité/caméra/plateforme/points) mais ne produit aucun
 * point exploitable, `CoordinatesConverter.calibrated` passe à `false` et
 * `calibrationSourceFailed` à `true` (au lieu de l'identité silencieuse) — la carte
 * affiche alors un avertissement dédié (clé `validation.calibration_source_failed`,
 * distincte de `validation.invalid_calibration` qui couvre les points géométriquement
 * dégénérés détectés par `selfCheck`). Le cas « pas de calibration_source configurée
 * du tout » (plateforme fonctionnant nativement en identité) reste inchangé : identité
 * silencieuse, aucun message (cf. dernier test de ce fichier).
 */
import { describe, it, expect, afterEach } from "vitest";

import "../src/dreame-vacuum-card";
import { mountCard, makeCardConfig, until, CALIBRATION_POINTS, type CardElement } from "./fixtures/hass";

/* eslint-disable @typescript-eslint/no-explicit-any */

afterEach(() => {
    document.querySelectorAll("dreame-vacuum-card").forEach((el) => el.remove());
});

function converterOf(card: CardElement): { calibrated: boolean; calibrationSourceFailed: boolean } | undefined {
    return (card as any).coordinatesConverter;
}

/** Attend que la carte ait fait au moins un rendu complet (shadow root peuplé), sans
 *  présumer d'une valeur de calibration particulière. */
async function waitFirstRender(card: CardElement): Promise<void> {
    await until(() => !!card.shadowRoot?.querySelector("#map-image, hui-warning, hui-error-card"));
    await card.updateComplete;
}

describe("dreame-vacuum-card — dégradation de la calibration (_getCalibration)", () => {
    it("1. entity + JSON valide (3 points) -> calibré, pas d'avertissement", async () => {
        const { card } = mountCard(
            makeCardConfig({ calibration_source: { entity: "sensor.cal" } }),
            "docked",
            {},
            { "sensor.cal": { state: JSON.stringify(CALIBRATION_POINTS) } }
        );
        await waitFirstRender(card);
        await until(() => converterOf(card)?.calibrated === true);
        expect(converterOf(card)?.calibrated).toBe(true);
        expect(converterOf(card)?.calibrationSourceFailed).toBe(false);
        expect(card.shadowRoot?.querySelector("hui-warning")).toBeFalsy();
    });

    it('2. entity + état "unknown" -> source en échec, NON calibré, avertissement visible', async () => {
        const { card } = mountCard(
            makeCardConfig({ calibration_source: { entity: "sensor.cal" } }),
            "docked",
            {},
            { "sensor.cal": { state: "unknown" } }
        );
        // Ne doit pas jeter : le simple fait d'atteindre cette ligne sans exception le prouve.
        await waitFirstRender(card);
        expect(card.shadowRoot?.querySelector("#map-image")).toBeTruthy();
        // Comportement CORRIGÉ (cf. commentaire d'en-tête) : `_getCalibration` renvoie bien
        // `undefined` (pas d'exception), mais la carte sait maintenant qu'une source était
        // attendue -> `calibrated === false`, `calibrationSourceFailed === true`, et un
        // avertissement dédié est visible dans le shadow DOM (au lieu de l'identité muette).
        await until(() => converterOf(card) !== undefined);
        expect(converterOf(card)?.calibrated).toBe(false);
        expect(converterOf(card)?.calibrationSourceFailed).toBe(true);
        const warning = card.shadowRoot?.querySelector("hui-warning");
        expect(warning).toBeTruthy();
        expect(warning?.textContent).toContain("Calibration source unavailable");
    });

    it("3. entity + JSON tronqué -> source en échec, NON calibré, avertissement visible", async () => {
        const { card } = mountCard(
            makeCardConfig({ calibration_source: { entity: "sensor.cal" } }),
            "docked",
            {},
            { "sensor.cal": { state: "{invalid json" } }
        );
        await waitFirstRender(card);
        expect(card.shadowRoot?.querySelector("#map-image")).toBeTruthy();
        // Même correction que le cas 2 : voir commentaire d'en-tête.
        await until(() => converterOf(card) !== undefined);
        expect(converterOf(card)?.calibrated).toBe(false);
        expect(converterOf(card)?.calibrationSourceFailed).toBe(true);
        const warning = card.shadowRoot?.querySelector("hui-warning");
        expect(warning).toBeTruthy();
        expect(warning?.textContent).toContain("Calibration source unavailable");
    });

    it("4. entity + attribute -> lit l'attribut, calibré, pas d'avertissement", async () => {
        const { card } = mountCard(
            makeCardConfig({ calibration_source: { entity: "sensor.cal", attribute: "points" } }),
            "docked",
            {},
            { "sensor.cal": { state: "ok", attributes: { points: CALIBRATION_POINTS } } }
        );
        await waitFirstRender(card);
        await until(() => converterOf(card)?.calibrated === true);
        expect(converterOf(card)?.calibrated).toBe(true);
        expect(converterOf(card)?.calibrationSourceFailed).toBe(false);
        expect(card.shadowRoot?.querySelector("hui-warning")).toBeFalsy();
    });

    it("4bis. entity + attribute absent -> source en échec, NON calibré, avertissement visible", async () => {
        const { card } = mountCard(
            makeCardConfig({ calibration_source: { entity: "sensor.cal", attribute: "missing" } }),
            "docked",
            {},
            { "sensor.cal": { state: "ok", attributes: {} } }
        );
        await waitFirstRender(card);
        await until(() => converterOf(card) !== undefined);
        expect(converterOf(card)?.calibrated).toBe(false);
        expect(converterOf(card)?.calibrationSourceFailed).toBe(true);
        expect(card.shadowRoot?.querySelector("hui-warning")?.textContent).toContain(
            "Calibration source unavailable"
        );
    });

    it("5. identity: true -> 3 points triviaux, calibré, pas d'avertissement", async () => {
        const { card } = mountCard(makeCardConfig({ calibration_source: { identity: true } }));
        await waitFirstRender(card);
        await until(() => converterOf(card)?.calibrated === true);
        expect(converterOf(card)?.calibrated).toBe(true);
        expect(converterOf(card)?.calibrationSourceFailed).toBe(false);
        expect(card.shadowRoot?.querySelector("hui-warning")).toBeFalsy();
    });

    it("6. calibration_points explicites (3 points valides) -> calibré, pas d'avertissement", async () => {
        const { card } = mountCard(
            makeCardConfig({ calibration_source: { calibration_points: CALIBRATION_POINTS } })
        );
        await waitFirstRender(card);
        await until(() => converterOf(card)?.calibrated === true);
        expect(converterOf(card)?.calibrated).toBe(true);
        expect(converterOf(card)?.calibrationSourceFailed).toBe(false);
        expect(card.shadowRoot?.querySelector("hui-warning")).toBeFalsy();
    });

    it("7. aucune calibration_source configurée -> identité silencieuse (pas de calibration nécessaire)", async () => {
        // Cas distinct des précédents : la plateforme (Dreame, seule supportée) ne
        // publie pas nativement de calibration_points -> `resolveCalibration` renvoie
        // `undefined` SANS qu'aucune source n'ait été demandée. Ce n'est PAS un échec :
        // comportement inchangé, identité muette, aucun avertissement.
        const { card } = mountCard(makeCardConfig({ calibration_source: undefined }));
        await waitFirstRender(card);
        await until(() => converterOf(card) !== undefined);
        expect(converterOf(card)?.calibrated).toBe(true);
        expect(converterOf(card)?.calibrationSourceFailed).toBe(false);
        expect(card.shadowRoot?.querySelector("hui-warning")).toBeFalsy();
    });
});
