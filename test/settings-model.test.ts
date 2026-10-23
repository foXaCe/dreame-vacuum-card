import { describe, it, expect } from "vitest";
import type { HomeAssistantFixed } from "../src/types/fixes";
import { buildSettingsCategories, shortEntityName } from "../src/model/settings/settings-model";

const VACUUM = "vacuum.aqua10";

function makeHass(ents: Record<string, [string, string, Record<string, unknown>?]>): HomeAssistantFixed {
    const entities: Record<string, unknown> = { [VACUUM]: { entity_id: VACUUM, device_id: "dev1" } };
    const states: Record<string, unknown> = { [VACUUM]: { entity_id: VACUUM, state: "docked", attributes: {} } };
    for (const [id, [tk, state, extra]] of Object.entries(ents)) {
        entities[id] = {
            entity_id: id,
            device_id: extra?.device ?? "dev1",
            translation_key: tk,
            hidden: extra?.hidden,
        };
        states[id] = { entity_id: id, state, attributes: { friendly_name: extra?.name ?? id } };
    }
    return { states, entities } as unknown as HomeAssistantFixed;
}

const ENTS: Record<string, [string, string, Record<string, unknown>?]> = {
    "select.aqua10_cleangenius": ["cleangenius", "deep_cleaning"],
    "switch.aqua10_carpet_boost": ["carpet_boost", "on"],
    "switch.aqua10_auto_drying": ["auto_drying", "on"],
    "select.aqua10_drying_time": ["drying_time", "4h"],
    "time.aqua10_dnd_start": ["dnd_start", "22:00:00"],
    "number.aqua10_volume": ["volume", "1"],
    "switch.aqua10_child_lock": ["child_lock", "off"],
    "select.aqua10_suction_level": ["suction_level", "unavailable"],
    "select.aqua10_suction_level_room_1": ["suction_level_room", "quiet"],
    "button.aqua10_reset_filter": ["reset_filter", "unknown"],
    "button.aqua10_start_auto_empty": ["start_auto_empty", "unknown"],
    "switch.aqua10_new_feature": ["new_feature", "off"],
    "switch.aqua10_hidden_one": ["hair_compression", "on", { hidden: true }],
    "switch.other_robot_dnd": ["dnd", "on", { device: "dev2" }],
    "sensor.aqua10_filter_left": ["filter_left", "90"],
};

describe("buildSettingsCategories", () => {
    const cats = buildSettingsCategories(makeHass(ENTS), VACUUM);
    const byKey = Object.fromEntries(cats.map((c) => [c.key, c.entities]));

    it("classe chaque réglage dans sa catégorie, dans l'ordre prévu", () => {
        expect(cats.map((c) => c.key)).toEqual(["cleaning", "carpet", "dock", "dnd_sound", "system", "other"]);
        expect(byKey.dock).toEqual(["switch.aqua10_auto_drying", "select.aqua10_drying_time"]);
        expect(byKey.dnd_sound).toEqual(["time.aqua10_dnd_start", "number.aqua10_volume"]);
    });

    it("écarte l'indisponible, le par-pièce, l'entretien, le caché, les autres robots et les capteurs", () => {
        const all = cats.flatMap((c) => c.entities);
        expect(all).not.toContain("select.aqua10_suction_level");
        expect(all).not.toContain("select.aqua10_suction_level_room_1");
        expect(all).not.toContain("button.aqua10_reset_filter");
        expect(all).not.toContain("button.aqua10_start_auto_empty");
        expect(all).not.toContain("switch.aqua10_hidden_one");
        expect(all).not.toContain("switch.other_robot_dnd");
        expect(all).not.toContain("sensor.aqua10_filter_left");
    });

    it("range un réglage inconnu dans « Autres »", () => {
        expect(byKey.other).toEqual(["switch.aqua10_new_feature"]);
    });

    it("vacuum sans device : aucune catégorie", () => {
        const hass = { states: {}, entities: {} } as unknown as HomeAssistantFixed;
        expect(buildSettingsCategories(hass, VACUUM)).toEqual([]);
    });
});

describe("shortEntityName", () => {
    it("retire le nom de l'appareil", () => {
        const hass = makeHass({ "switch.x": ["dnd", "on", { name: "Aqua10 Ultra Ne pas déranger" }] });
        expect(shortEntityName(hass, "switch.x", "Aqua10 Ultra")).toBe("Ne pas déranger");
        expect(shortEntityName(hass, "switch.x", "Autre")).toBe("Aqua10 Ultra Ne pas déranger");
    });
});
