import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import type { HomeAssistantFixed } from "../src/types/fixes";
import "../src/components/care-panel";
import type { CarePanel } from "../src/components/care-panel";

const VACUUM = "vacuum.aqua10";

function makeHass(): HomeAssistantFixed {
    const ents: Record<string, [string, string, Record<string, unknown>?]> = {
        "sensor.aqua10_filter_left": ["filter_left", "8"],
        "sensor.aqua10_main_brush_left": ["main_brush_left", "90"],
        "button.aqua10_reset_filter": ["reset_filter", "unknown"],
        "button.aqua10_start_auto_empty": ["start_auto_empty", "unknown"],
        "sensor.aqua10_dust_bag_status": ["dust_bag_status", "installed"],
    };
    const entities: Record<string, unknown> = { [VACUUM]: { entity_id: VACUUM, device_id: "dev1" } };
    const states: Record<string, unknown> = { [VACUUM]: { entity_id: VACUUM, state: "docked", attributes: {} } };
    for (const [id, [tk, state, attributes]] of Object.entries(ents)) {
        entities[id] = { entity_id: id, device_id: "dev1", translation_key: tk };
        states[id] = { entity_id: id, state, attributes: attributes ?? {} };
    }
    return {
        states,
        entities,
        locale: { language: "fr" },
        localize: (k: string) => k,
        callService: vi.fn().mockResolvedValue(undefined),
    } as unknown as HomeAssistantFixed;
}

async function mount(): Promise<CarePanel> {
    const el = document.createElement("dreame-care-panel") as CarePanel;
    el.hass = makeHass();
    el.entityId = VACUUM;
    document.body.appendChild(el);
    await el.updateComplete;
    return el;
}

const q = (el: CarePanel, sel: string) => el.shadowRoot!.querySelector(sel) as HTMLElement | null;
const qa = (el: CarePanel, sel: string) => Array.from(el.shadowRoot!.querySelectorAll(sel)) as HTMLElement[];

describe("dreame-care-panel", () => {
    beforeEach(() => localStorage.clear());
    afterEach(() => {
        document.body.innerHTML = "";
        vi.useRealTimers();
    });

    it("replié : en-tête avec la pastille d'alertes, contenu masqué", async () => {
        const el = await mount();
        expect(q(el, ".toggle")?.getAttribute("aria-expanded")).toBe("false");
        expect(q(el, ".badge")?.textContent?.trim()).toBe("1");
        expect(q(el, ".badge")?.classList.contains("crit")).toBe(true);
        expect(q(el, ".content")).toBeNull();
    });

    it("déplié : consommables, actions de station et alerte", async () => {
        const el = await mount();
        q(el, ".toggle")!.click();
        await el.updateComplete;
        expect(qa(el, ".parts li")).toHaveLength(2);
        expect(qa(el, ".tile")).toHaveLength(1);
        expect(qa(el, ".alert")).toHaveLength(1);
    });

    it("réinitialiser demande une confirmation avant d'appuyer sur le bouton", async () => {
        const el = await mount();
        q(el, ".toggle")!.click();
        await el.updateComplete;
        const reset = () => q(el, ".parts li.crit .icon-btn, .parts li.crit .chip")!;
        reset().click();
        await el.updateComplete;
        expect(el.hass.callService).not.toHaveBeenCalled();
        expect(reset().classList.contains("armed")).toBe(true);
        reset().click();
        await el.updateComplete;
        expect(el.hass.callService).toHaveBeenCalledWith("button", "press", {
            entity_id: "button.aqua10_reset_filter",
        });
    });

    it("vider le bac appuie sur le bouton de l'intégration", async () => {
        const el = await mount();
        q(el, ".toggle")!.click();
        await el.updateComplete;
        q(el, ".tile")!.click();
        expect(el.hass.callService).toHaveBeenCalledWith("button", "press", {
            entity_id: "button.aqua10_start_auto_empty",
        });
    });

    it("« plus tard » masque l'alerte et la mémorise", async () => {
        const el = await mount();
        q(el, ".toggle")!.click();
        await el.updateComplete;
        q(el, ".alert .chip.ghost")!.click();
        await el.updateComplete;
        expect(qa(el, ".alert")).toHaveLength(0);
        expect(q(el, ".badge")).toBeNull();
        expect(JSON.parse(localStorage.getItem("dreame-vacuum-card-care-snooze") || "{}")).toHaveProperty(
            "consumable_filter"
        );
    });

    it("en rangée (attribut tab) : libellé court, annonce l'ouverture, se ferme sur demande", async () => {
        const el = document.createElement("dreame-care-panel") as CarePanel;
        el.setAttribute("tab", "");
        el.hass = makeHass();
        el.entityId = VACUUM;
        document.body.appendChild(el);
        await el.updateComplete;
        const opened = vi.fn();
        document.body.addEventListener("dreame-panel-open", opened);
        expect(q(el, ".toggle .grow")?.textContent?.trim()).toBe("Entretien");
        q(el, ".toggle")!.click();
        await el.updateComplete;
        expect(opened).toHaveBeenCalledTimes(1);
        expect(q(el, ".content")).not.toBeNull();
        el.close();
        await el.updateComplete;
        expect(q(el, ".content")).toBeNull();
        document.body.removeEventListener("dreame-panel-open", opened);
    });

    it("robot sans aucune donnée d'entretien : rien d'affiché", async () => {
        const el = document.createElement("dreame-care-panel") as CarePanel;
        el.hass = {
            states: { [VACUUM]: { entity_id: VACUUM, state: "docked", attributes: {} } },
            entities: { [VACUUM]: { entity_id: VACUUM, device_id: "dev1" } },
        } as unknown as HomeAssistantFixed;
        el.entityId = VACUUM;
        document.body.appendChild(el);
        await el.updateComplete;
        expect(q(el, ".toggle")).toBeNull();
    });
});
