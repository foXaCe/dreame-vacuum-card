import { describe, it, expect, afterEach } from "vitest";
import type { HomeAssistantFixed } from "../src/types/fixes";
import "../src/components/history-panel";
import type { HistoryPanel } from "../src/components/history-panel";

const VACUUM = "vacuum.aqua10";
const CAMERA = "camera.aqua10_map";
const SENSOR = "sensor.aqua10_cleaning_history";

function makeHass(cameraAttributes: Record<string, unknown>): HomeAssistantFixed {
    return {
        states: {
            [VACUUM]: { entity_id: VACUUM, state: "docked", attributes: {} },
            [CAMERA]: { entity_id: CAMERA, state: "idle", attributes: cameraAttributes },
            [SENSOR]: {
                entity_id: SENSOR,
                state: "2026-10-22T15:40:33+00:00",
                attributes: {
                    "10-22 17:40": { timestamp: 1792683633.0, cleaning_time: "9 min", cleaned_area: "12 m²" },
                },
            },
        },
        entities: {
            [VACUUM]: { entity_id: VACUUM, device_id: "dev1" },
            [CAMERA]: { entity_id: CAMERA, device_id: "dev1" },
            [SENSOR]: { entity_id: SENSOR, device_id: "dev1", translation_key: "cleaning_history" },
        },
        locale: { language: "fr" },
        hassUrl: (p: string) => `http://ha.local${p}`,
    } as unknown as HomeAssistantFixed;
}

const HISTORY = {
    cleaning_history_picture: {
        "1: 10/22 17:40 - Zone Cleaning (Interrupted)":
            "/api/camera_history_map_proxy/camera.aqua10_map?index=1&v=1792683633",
        "2: 10/21 16:39 - Room Cleaning (Completed)":
            "/api/camera_history_map_proxy/camera.aqua10_map?index=2&v=1792593561",
    },
    obstacle_picture: {
        "1: Shoe %85 (Salon)": "/api/camera_map_obstacle_proxy/camera.aqua10_map?index=4",
    },
};

async function mount(hass: HomeAssistantFixed): Promise<HistoryPanel> {
    const el = document.createElement("dreame-history-panel") as HistoryPanel;
    el.hass = hass;
    el.entityId = VACUUM;
    el.cameraId = CAMERA;
    document.body.appendChild(el);
    await el.updateComplete;
    return el;
}

const sr = (el: HistoryPanel) => el.shadowRoot!;
const text = (node: Element | null | undefined) => node?.textContent?.replace(/\s+/g, " ").trim();

describe("dreame-history-panel", () => {
    afterEach(() => {
        document.body.innerHTML = "";
    });

    it("absent quand l'intégration n'expose ni historique ni obstacle", async () => {
        const el = await mount(makeHass({}));
        expect(sr(el).querySelector(".toggle")).toBeNull();
    });

    it("replié par défaut avec le nombre de nettoyages", async () => {
        const el = await mount(makeHass(HISTORY));
        expect(text(sr(el).querySelector(".toggle"))).toBe("Historique 2");
        expect(sr(el).querySelector(".content")).toBeNull();
        expect(sr(el).querySelector("img")).toBeNull();
    });

    it("liste les nettoyages, enrichis par le capteur, et affiche la carte du plus récent", async () => {
        const el = await mount(makeHass(HISTORY));
        (sr(el).querySelector(".toggle") as HTMLElement).click();
        await el.updateComplete;
        const runs = Array.from(sr(el).querySelectorAll(".run"));
        expect(runs).toHaveLength(2);
        expect(text(runs[0].querySelector(".run-title"))).toBe("Nettoyage de zone");
        expect(text(runs[0])).toContain("9 min · 12 m²");
        expect(text(runs[0].querySelector(".badge"))).toBe("Interrompu");
        expect(text(runs[1].querySelector(".badge"))).toBe("Terminé");
        expect(sr(el).querySelector(".map img")?.getAttribute("src")).toBe(
            "http://ha.local/api/camera_history_map_proxy/camera.aqua10_map?index=1&v=1792683633"
        );

        (runs[1] as HTMLElement).click();
        await el.updateComplete;
        expect(sr(el).querySelector(".map img")?.getAttribute("src")).toContain("index=2");
        expect(runs[1].getAttribute("aria-selected")).toBe("true");
    });

    it("affiche les photos d'obstacles et agrandit celle qu'on touche", async () => {
        const el = await mount(makeHass(HISTORY));
        (sr(el).querySelector(".toggle") as HTMLElement).click();
        await el.updateComplete;
        const photo = sr(el).querySelector(".photo") as HTMLElement;
        expect(photo.getAttribute("aria-label")).toBe("Shoe · 85 % · Salon");
        photo.click();
        await el.updateComplete;
        expect(text(sr(el).querySelector(".zoom figcaption"))).toBe("Shoe · 85 % · Salon");
        (sr(el).querySelector(".zoom-btn") as HTMLElement).click();
        await el.updateComplete;
        expect(sr(el).querySelector(".zoom")).toBeNull();
    });

    it("remplace une carte introuvable par un message", async () => {
        const el = await mount(makeHass(HISTORY));
        (sr(el).querySelector(".toggle") as HTMLElement).click();
        await el.updateComplete;
        sr(el).querySelector(".map img")!.dispatchEvent(new Event("error"));
        await el.updateComplete;
        expect(text(sr(el).querySelector(".map"))).toBe("Carte indisponible");
    });
});
