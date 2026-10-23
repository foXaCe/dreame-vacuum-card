import { describe, it, expect, afterEach, vi } from "vitest";
import type { HomeAssistantFixed } from "../src/types/fixes";
import "../src/components/settings-panel";
import type { SettingsPanel } from "../src/components/settings-panel";

const VACUUM = "vacuum.aqua10";

function makeHass(): HomeAssistantFixed {
    const ents: Record<string, [string, string]> = {
        "switch.aqua10_carpet_boost": ["carpet_boost", "on"],
        "switch.aqua10_auto_drying": ["auto_drying", "on"],
        "select.aqua10_drying_time": ["drying_time", "4h"],
    };
    const entities: Record<string, unknown> = { [VACUUM]: { entity_id: VACUUM, device_id: "dev1" } };
    const states: Record<string, unknown> = {
        [VACUUM]: { entity_id: VACUUM, state: "docked", attributes: { friendly_name: "Aqua10" } },
    };
    for (const [id, [tk, state]] of Object.entries(ents)) {
        entities[id] = { entity_id: id, device_id: "dev1", translation_key: tk };
        states[id] = { entity_id: id, state, attributes: { friendly_name: `Aqua10 ${tk}` } };
    }
    return { states, entities, locale: { language: "fr" } } as unknown as HomeAssistantFixed;
}

async function mount(): Promise<SettingsPanel> {
    const el = document.createElement("dreame-settings-panel") as SettingsPanel;
    el.hass = makeHass();
    el.entityId = VACUUM;
    document.body.appendChild(el);
    await el.updateComplete;
    return el;
}

const sr = (el: SettingsPanel) => el.shadowRoot!;

describe("dreame-settings-panel", () => {
    afterEach(() => {
        document.body.innerHTML = "";
        delete window.loadCardHelpers;
    });

    it("replié par défaut, puis liste les catégories du robot", async () => {
        const el = await mount();
        expect(sr(el).querySelector(".content")).toBeNull();
        (sr(el).querySelector(".toggle") as HTMLElement).click();
        await el.updateComplete;
        const cats = Array.from(sr(el).querySelectorAll(".cat-head")).map((b) =>
            b.textContent?.replace(/\s+/g, " ").trim()
        );
        expect(cats).toEqual(["Tapis 1", "Station 2"]);
    });

    it("une catégorie ouverte affiche les lignes d'entités natives de HA, avec le nom court", async () => {
        const created: Array<{ entity: string; name?: string }> = [];
        window.loadCardHelpers = vi.fn().mockResolvedValue({
            createRowElement: (config: { entity: string; name?: string }) => {
                created.push(config);
                return document.createElement("div");
            },
        });
        const el = await mount();
        (sr(el).querySelector(".toggle") as HTMLElement).click();
        await el.updateComplete;
        await new Promise((r) => setTimeout(r, 0));
        await el.updateComplete;
        (sr(el).querySelectorAll(".cat-head")[1] as HTMLElement).click();
        await el.updateComplete;
        expect(created.map((c) => c.entity)).toEqual(["switch.aqua10_auto_drying", "select.aqua10_drying_time"]);
        expect(created[0].name).toBe("Auto_drying");
        expect(sr(el).querySelectorAll(".rows .row")).toHaveLength(2);
    });

    it("sans les helpers de HA : lignes en lecture seule", async () => {
        const el = await mount();
        (sr(el).querySelector(".toggle") as HTMLElement).click();
        await el.updateComplete;
        await new Promise((r) => setTimeout(r, 0));
        (sr(el).querySelector(".cat-head") as HTMLElement).click();
        await el.updateComplete;
        expect(sr(el).querySelector(".row.fallback")?.textContent).toContain("on");
    });
});
