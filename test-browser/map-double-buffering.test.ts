/**
 * Anti-flicker double-buffering de l'image de carte (`_getMapSrc` / `_preloadMapImage`,
 * src/dreame-vacuum-card.ts ~L831-902).
 *
 * Principe lu dans le code : quand `entity_picture` change, la carte précharge la nouvelle
 * URL hors-écran (`new Image()` puis `.onload`/`.decode()`) et ne bascule `_displayedMapUrl`
 * (donc le `src` de `#map-image`) qu'une fois cette image "terminée". Le `<img>` visible
 * continue d'afficher l'ancienne frame pendant ce temps — objectif : zéro flash blanc.
 *
 * Un vrai `data:` URI se décode quasi instantanément : pour observer de façon fiable (non
 * flaky) la fenêtre "ancienne image encore affichée", on remplace temporairement le
 * constructeur global `Image` par une version entièrement contrôlée par le test (le
 * `<img id="map-image">` réel du template Lit n'est PAS affecté : il est créé via le
 * template, pas via `new Image()` — seul `_preloadMapImage`/`_loadSegmentMap` utilisent
 * `new Image()`).
 */
import { describe, it, expect, afterEach, vi } from "vitest";

import "../src/dreame-vacuum-card";
import { makeHass, makeCardConfig, makeAlternateMapDataUrl, until, type CardElement } from "./fixtures/hass";

afterEach(() => {
    document.querySelectorAll("dreame-vacuum-card").forEach((el) => el.remove());
    vi.unstubAllGlobals();
});

/** Image factice : ne déclenche jamais `onload`/`decode` toute seule — le test décide. */
class ControlledImage {
    public onload: (() => void) | null = null;
    public onerror: (() => void) | null = null;
    public crossOrigin = "";
    public src = "";
    private _decodeResolvers: Array<() => void> = [];

    public decode(): Promise<void> {
        return new Promise<void>((resolve) => {
            this._decodeResolvers.push(resolve);
        });
    }

    public release(): void {
        this._decodeResolvers.splice(0).forEach((r) => r());
    }
}

describe("dreame-vacuum-card — double-buffering anti-flicker de la carte", () => {
    it("garde l'ancienne image affichée jusqu'au décodage de la nouvelle, puis bascule", async () => {
        const built = makeHass("docked");
        const config = makeCardConfig();
        const card = document.createElement("dreame-vacuum-card") as CardElement;
        card.setConfig(config);
        card.hass = built.hass;
        document.body.appendChild(card);

        await until(() => !!card.shadowRoot?.querySelector("#map-image"));
        const img = card.shadowRoot!.querySelector<HTMLImageElement>("#map-image")!;
        await until(() => img.complete && img.naturalWidth > 0);

        const originalUrl = img.src;
        expect(originalUrl).toContain("data:image/png;base64,");

        const newUrl = makeAlternateMapDataUrl();
        expect(newUrl).not.toBe(originalUrl);

        // À partir d'ici, `new Image()` (utilisé par `_preloadMapImage`) renvoie une
        // instance que SEUL le test peut faire "charger" — élimine toute course avec le
        // vrai décodage async du navigateur.
        let controlled: ControlledImage | undefined;
        vi.stubGlobal(
            "Image",
            class extends ControlledImage {
                constructor() {
                    super();
                    controlled = this;
                }
            }
        );

        // Nouvelle référence d'état pour l'entité caméra (obligatoire : le changement est
        // détecté par inégalité de référence dans `checkIfEntitiesChanged`/`hasConfigOrAnyEntityChanged`).
        const prevStates = built.hass.states as Record<string, { attributes: Record<string, unknown> }>;
        const newStates = {
            ...prevStates,
            "camera.test_map": {
                ...prevStates["camera.test_map"],
                attributes: { ...prevStates["camera.test_map"].attributes, entity_picture: newUrl },
            },
        };
        card.hass = { ...built.hass, states: newStates };
        await card.updateComplete;

        await until(() => !!controlled);
        expect(controlled!.src).toBe(newUrl);

        // Le préchargement est en vol (ni onload ni decode() résolus) -> l'<img> visible
        // doit encore pointer sur l'ANCIENNE URL : aucun flash vers une image à moitié prête.
        expect(img.src).toBe(originalUrl);

        // Débloque le décodage -> la carte doit basculer sur la nouvelle URL.
        controlled!.release();
        await until(() => img.src === newUrl, 4000);
        expect(img.src).toBe(newUrl);
    });
});
