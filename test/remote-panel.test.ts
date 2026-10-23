import { describe, it, expect, afterEach, vi } from "vitest";
import type { HomeAssistantFixed } from "../src/types/fixes";
import "../src/components/remote-panel";
import type { RemotePanel } from "../src/components/remote-panel";

const VACUUM = "vacuum.aqua10";
const STATE = "sensor.aqua10_state";

interface Call {
    domain: string;
    service: string;
    data: Record<string, unknown>;
    target: Record<string, unknown>;
}

function makeHass(vacuumState = "docked", robotState = "charging_completed", fail = false) {
    const calls: Call[] = [];
    const hass = {
        states: {
            [VACUUM]: { entity_id: VACUUM, state: vacuumState, attributes: {} },
            [STATE]: { entity_id: STATE, state: robotState, attributes: {} },
        },
        locale: { language: "fr" },
        callService: vi.fn((domain: string, service: string, data: Record<string, unknown>, target) => {
            calls.push({ domain, service, data, target });
            return fail ? Promise.reject(new Error("refus")) : Promise.resolve();
        }),
    } as unknown as HomeAssistantFixed;
    return { hass, calls };
}

async function mount(hass: HomeAssistantFixed): Promise<RemotePanel> {
    const el = document.createElement("dreame-remote-panel") as RemotePanel;
    el.hass = hass;
    el.entityId = VACUUM;
    el.stateSensorId = STATE;
    document.body.appendChild(el);
    await el.updateComplete;
    return el;
}

const sr = (el: RemotePanel) => el.shadowRoot!;
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function open(el: RemotePanel): Promise<void> {
    (sr(el).querySelector(".toggle") as HTMLElement).click();
    await el.updateComplete;
}

function dirButton(el: RemotePanel, label: string): HTMLButtonElement {
    return sr(el).querySelector(`button.dir[aria-label="${label}"]`) as HTMLButtonElement;
}

const pointer = (type: string) => new PointerEvent(type, { button: 0, pointerId: 1, bubbles: true });

describe("dreame-remote-panel", () => {
    afterEach(() => {
        document.body.innerHTML = "";
    });

    it("replié par défaut, puis affiche la croix et les trois vitesses", async () => {
        const { hass } = makeHass();
        const el = await mount(hass);
        expect(sr(el).querySelector(".toggle")?.textContent).toContain("Télécommande");
        expect(sr(el).querySelector(".pad")).toBeNull();
        await open(el);
        expect(sr(el).querySelectorAll("button.dir")).toHaveLength(5);
        const speeds = Array.from(sr(el).querySelectorAll(".speed button")).map((b) => b.textContent?.trim());
        expect(speeds).toEqual(["Lente", "Normale", "Rapide"]);
    });

    it("masqué quand le robot ne peut pas être piloté", async () => {
        const { hass } = makeHass("cleaning", "sweeping");
        const el = await mount(hass);
        expect(sr(el).querySelector(".toggle")).toBeNull();
        const drying = await mount(makeHass("docked", "drying").hass);
        expect(sr(drying).querySelector(".toggle")).toBeNull();
    });

    it("répète le pas tant que la flèche est maintenue, puis envoie un arrêt", async () => {
        const { hass, calls } = makeHass();
        const el = await mount(hass);
        await open(el);
        const forward = dirButton(el, "Avancer");
        forward.dispatchEvent(pointer("pointerdown"));
        await wait(300);
        forward.dispatchEvent(pointer("pointerup"));
        await wait(200);

        expect(calls.length).toBeGreaterThanOrEqual(3);
        expect(calls[0]).toMatchObject({
            domain: "dreame_vacuum",
            service: "vacuum_remote_control_move_step",
            data: { rotation: 0, velocity: 200 },
            target: { entity_id: VACUUM },
        });
        expect(calls.at(-1)!.data).toEqual({ rotation: 0, velocity: 0 });
        // Plus aucun pas après le relâchement.
        const count = calls.length;
        await wait(250);
        expect(calls.length).toBe(count);
    });

    it("la vitesse choisie règle le pas envoyé", async () => {
        const { hass, calls } = makeHass();
        const el = await mount(hass);
        await open(el);
        (sr(el).querySelectorAll(".speed button")[2] as HTMLButtonElement).click();
        await el.updateComplete;
        const left = dirButton(el, "Tourner à gauche");
        left.dispatchEvent(pointer("pointerdown"));
        await wait(20);
        left.dispatchEvent(pointer("pointerup"));
        expect(calls[0].data).toEqual({ rotation: 60, velocity: 0 });
    });

    it("se pilote aussi au clavier avec les flèches", async () => {
        const { hass, calls } = makeHass();
        const el = await mount(hass);
        await open(el);
        const pad = sr(el).querySelector(".pad") as HTMLElement;
        pad.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true, cancelable: true }));
        await wait(20);
        pad.dispatchEvent(new KeyboardEvent("keyup", { key: "ArrowDown", bubbles: true }));
        expect(calls[0].data).toEqual({ rotation: 0, velocity: -200 });
        expect(calls.at(-1)!.data).toEqual({ rotation: 0, velocity: 0 });
    });

    it("cesse d'envoyer si l'intégration refuse le pas", async () => {
        const { hass, calls } = makeHass("docked", "charging_completed", true);
        const el = await mount(hass);
        await open(el);
        dirButton(el, "Avancer").dispatchEvent(pointer("pointerdown"));
        await wait(300);
        expect(calls).toHaveLength(1);
        expect(sr(el).querySelector("button.dir.held")).toBeNull();
    });
});
