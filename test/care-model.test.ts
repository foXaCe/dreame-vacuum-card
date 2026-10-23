import { describe, it, expect } from "vitest";
import type { HomeAssistantFixed } from "../src/types/fixes";
import {
    buildCareState,
    careWatchedEntities,
    resolveDeviceEntities,
    visibleAlerts,
} from "../src/model/care/care-model";

const VACUUM = "vacuum.aqua10";

/** Entités d'un Aqua10 Ultra réel (relevées sur une install le 2026-10-23), même device. */
type Ent = { tk: string; state: string; attrs?: Record<string, unknown>; device?: string };
function makeHass(ents: Record<string, Ent>, vacuumAttrs: Record<string, unknown> = {}): HomeAssistantFixed {
    const registry: Record<string, unknown> = { [VACUUM]: { entity_id: VACUUM, device_id: "dev1" } };
    const states: Record<string, unknown> = {
        [VACUUM]: { entity_id: VACUUM, state: "docked", attributes: vacuumAttrs },
    };
    for (const [id, e] of Object.entries(ents)) {
        registry[id] = { entity_id: id, device_id: e.device ?? "dev1", translation_key: e.tk };
        states[id] = { entity_id: id, state: e.state, attributes: e.attrs ?? {} };
    }
    return { states, entities: registry } as unknown as HomeAssistantFixed;
}

const BASE: Record<string, Ent> = {
    "sensor.aqua10_main_brush_left": { tk: "main_brush_left", state: "95" },
    "sensor.aqua10_main_brush_time_left": {
        tk: "main_brush_time_left",
        state: "287",
        attrs: { unit_of_measurement: "h" },
    },
    "sensor.aqua10_sensor_dirty_left": { tk: "sensor_dirty_left", state: "8" },
    "sensor.aqua10_filter_left": { tk: "filter_left", state: "15" },
    "button.aqua10_reset_main_brush": { tk: "reset_main_brush", state: "2026-09-28T15:49:14+00:00" },
    "button.aqua10_reset_sensor": { tk: "reset_sensor", state: "unknown" },
    "button.aqua10_reset_filter": { tk: "reset_filter", state: "unavailable" },
    "sensor.aqua10_dust_bag_status": { tk: "dust_bag_status", state: "installed" },
    "sensor.aqua10_clean_water_tank_status": { tk: "clean_water_tank_status", state: "not_installed" },
    "sensor.aqua10_error": { tk: "error", state: "no_error" },
    "sensor.aqua10_low_water_warning": { tk: "low_water_warning", state: "no_warning" },
    "sensor.aqua10_auto_empty_status": { tk: "auto_empty_status", state: "idle" },
    "button.aqua10_start_auto_empty": { tk: "start_auto_empty", state: "unknown" },
    "button.aqua10_self_clean": { tk: "self_clean", state: "unknown" },
    "button.aqua10_manual_drying": { tk: "manual_drying", state: "unknown" },
    "button.aqua10_clear_warning": { tk: "clear_warning", state: "unavailable" },
    "sensor.other_robot_main_brush_left": { tk: "main_brush_left", state: "1", device: "dev2" },
};

function state(ents = BASE, attrs: Record<string, unknown> = {}) {
    const hass = makeHass(ents, attrs);
    return buildCareState(hass, VACUUM, resolveDeviceEntities(hass, VACUUM));
}

describe("resolveDeviceEntities", () => {
    it("indexe par translation_key, sur le seul device du vacuum", () => {
        const hass = makeHass(BASE);
        const map = resolveDeviceEntities(hass, VACUUM);
        expect(map["sensor.main_brush_left"]).toBe("sensor.aqua10_main_brush_left");
        expect(map["button.reset_sensor"]).toBe("button.aqua10_reset_sensor");
        expect(Object.values(map)).not.toContain("sensor.other_robot_main_brush_left");
    });

    it("sans device connu : rien", () => {
        const hass = { states: {}, entities: {} } as unknown as HomeAssistantFixed;
        expect(resolveDeviceEntities(hass, VACUUM)).toEqual({});
    });
});

describe("buildCareState — consommables", () => {
    it("liste les pièces présentes, avec niveau, temps restant et bouton de réinitialisation", () => {
        const s = state();
        expect(s.consumables.map((c) => c.key)).toEqual(["main_brush", "filter", "sensor_dirty"]);
        const brush = s.consumables[0];
        expect(brush).toMatchObject({ pct: 95, level: "ok", timeLeft: 287, timeUnit: "h" });
        expect(brush.resetEntity).toBe("button.aqua10_reset_main_brush");
        expect(s.consumables.find((c) => c.key === "filter")?.level).toBe("warn");
        // sensor_dirty se réinitialise avec reset_sensor (nom différent dans l'intégration)
        expect(s.consumables.find((c) => c.key === "sensor_dirty")).toMatchObject({
            level: "crit",
            resetEntity: "button.aqua10_reset_sensor",
        });
    });

    it("bouton indisponible : pas de réinitialisation proposée", () => {
        expect(state().consumables.find((c) => c.key === "filter")?.resetEntity).toBeUndefined();
    });

    it("valeur illisible : consommable ignoré", () => {
        const s = state({ ...BASE, "sensor.aqua10_main_brush_left": { tk: "main_brush_left", state: "unavailable" } });
        expect(s.consumables.map((c) => c.key)).not.toContain("main_brush");
    });
});

describe("buildCareState — station", () => {
    it("propose vider, laver et sécher quand les boutons existent", () => {
        expect(state().actions.map((a) => [a.kind, a.busy])).toEqual([
            ["empty", false],
            ["wash", false],
            ["dry", false],
        ]);
    });

    it("lavage signalé par vacuum_state même quand `washing` reste à false", () => {
        const s = state(BASE, { washing: false, vacuum_state: "washing" });
        expect(s.dock.washing).toBe(true);
        expect(s.actions.find((a) => a.kind === "wash")?.busy).toBe(true);
    });

    it("séchage : progression lue, action marquée en cours", () => {
        const s = state(
            { ...BASE, "sensor.aqua10_drying_progress": { tk: "drying_progress", state: "40" } },
            { drying: true }
        );
        expect(s.dock).toMatchObject({ drying: true, dryingProgress: 40 });
        expect(s.actions.find((a) => a.kind === "dry")?.busy).toBe(true);
    });

    it("vidage en cours d'après auto_empty_status", () => {
        const s = state({ ...BASE, "sensor.aqua10_auto_empty_status": { tk: "auto_empty_status", state: "active" } });
        expect(s.dock.emptying).toBe(true);
    });

    it("réservoirs : seul l'état non nominal est en défaut", () => {
        expect(state().tanks.map((t) => [t.key, t.ok])).toEqual([
            ["clean_water_tank_status", false],
            ["dust_bag_status", true],
        ]);
    });
});

describe("buildCareState — alertes", () => {
    it("consommables bas et réservoir absent, les critiques d'abord", () => {
        const ids = state().alerts.map((a) => a.id);
        expect(ids).toEqual([
            "consumable_sensor_dirty",
            "tank_clean_water_tank_status_not_installed",
            "consumable_filter",
        ]);
    });

    it("erreur du robot et manque d'eau", () => {
        const s = state({
            ...BASE,
            "sensor.aqua10_error": { tk: "error", state: "mop_removed" },
            "sensor.aqua10_low_water_warning": { tk: "low_water_warning", state: "no_water_for_clean" },
            "button.aqua10_clear_warning": { tk: "clear_warning", state: "unknown" },
        });
        const err = s.alerts.find((a) => a.kind === "error");
        expect(err).toMatchObject({ level: "crit", actionEntity: "button.aqua10_clear_warning" });
        expect(s.alerts.some((a) => a.kind === "water")).toBe(true);
    });

    it("une alerte reportée est masquée jusqu'à son échéance", () => {
        const alerts = state().alerts;
        const now = 1_000_000;
        const shown = visibleAlerts(alerts, { consumable_filter: now + 60_000, consumable_sensor_dirty: now - 1 }, now);
        expect(shown.map((a) => a.id)).not.toContain("consumable_filter");
        expect(shown.map((a) => a.id)).toContain("consumable_sensor_dirty");
    });
});

describe("careWatchedEntities", () => {
    it("surveille le vacuum et les sensors utiles du device", () => {
        const hass = makeHass(BASE);
        const watched = careWatchedEntities(VACUUM, resolveDeviceEntities(hass, VACUUM));
        expect(watched).toContain(VACUUM);
        expect(watched).toContain("sensor.aqua10_main_brush_left");
        expect(watched).toContain("sensor.aqua10_auto_empty_status");
        expect(watched).not.toContain("button.aqua10_reset_main_brush");
    });
});
