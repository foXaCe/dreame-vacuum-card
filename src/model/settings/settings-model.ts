/**
 * Menu « Réglages » : classe les entités de réglage du robot (switch, select, number,
 * time, button) en catégories, à partir de leur `translation_key`. Logique pure,
 * sans DOM ; l'affichage passe par les lignes d'entités natives de HA.
 */
import { HomeAssistantFixed } from "../../types/fixes";

export interface SettingsCategory {
    key: string;
    icon: string;
    entities: string[];
}

/** Catégories dans l'ordre d'affichage. Une translation_key n'apparaît qu'une fois. */
export const SETTINGS_CATEGORIES: ReadonlyArray<{ key: string; icon: string; keys: readonly string[] }> = [
    {
        key: "cleaning",
        icon: "mdi:robot-vacuum",
        keys: [
            "cleangenius",
            "cleangenius_mode",
            "cleaning_mode",
            "suction_level",
            "max_suction_power",
            "large_particles_boost",
            "cleaning_route",
            "cleaning_sequence",
            "customized_cleaning",
            "auto_recleaning",
            "floor_direction_cleaning",
            "resume_cleaning",
            "side_reach",
            "hair_compression",
        ],
    },
    {
        key: "mopping",
        icon: "mdi:water-outline",
        keys: [
            "mop_pad_humidity",
            "wetness_level",
            "mop_extend",
            "mop_extend_frequency",
            "mop_pressure",
            "mop_temperature",
            "tight_mopping",
            "mopping_type",
            "auto_mount_mop",
            "mop_pad_swing",
        ],
    },
    {
        key: "carpet",
        icon: "mdi:rug",
        keys: [
            "carpet_boost",
            "carpet_cleaning",
            "clean_carpets_first",
            "intensive_carpet_cleaning",
            "side_brush_carpet_rotate",
            "carpet_recognition",
            "carpet_avoidance",
        ],
    },
    {
        key: "dock",
        icon: "mdi:home-lightning-bolt-outline",
        keys: [
            "self_clean",
            "self_clean_area",
            "self_clean_time",
            "self_clean_frequency",
            "auto_rewashing",
            "smart_mop_washing",
            "washing_mode",
            "water_temperature",
            "mop_washing_with_detergent",
            "auto_add_detergent",
            "auto_drying",
            "drying_time",
            "silent_drying",
            "smart_drying",
            "uv_sterilization",
            "auto_empty_mode",
            "auto_water_refilling",
            "base_station_cleaning",
            "base_station_self_repair",
            "water_tank_draining",
        ],
    },
    {
        key: "obstacle",
        icon: "mdi:eye-outline",
        keys: [
            "obstacle_avoidance",
            "ai_obstacle_detection",
            "ai_furniture_detection",
            "ai_fluid_detection",
            "ai_pet_detection",
            "ai_obstacle_picture",
            "ai_obstacle_image_upload",
            "fuzzy_obstacle_detection",
            "collision_avoidance",
            "stain_avoidance",
            "pet_focused_detection",
            "pet_picture",
            "intelligent_recognition",
            "auto_lds_lifting",
            "human_follow",
            "fill_light",
            "camera_light_brightness",
            "camera_light_brightness_auto",
        ],
    },
    {
        key: "dnd_sound",
        icon: "mdi:volume-high",
        keys: [
            "dnd",
            "dnd_start",
            "dnd_end",
            "dnd_disable_auto_empty",
            "dnd_disable_resume_cleaning",
            "dnd_reduce_volume",
            "volume",
            "streaming_voice_prompt",
            "voice_assistant",
            "voice_assistant_language",
        ],
    },
    {
        key: "system",
        icon: "mdi:cog-outline",
        keys: [
            "child_lock",
            "off_peak_charging",
            "off_peak_charging_start",
            "off_peak_charging_end",
            "multi_floor_map",
            "selected_map",
            "map_rotation",
            "backup_map",
            "start_fast_mapping",
        ],
    },
];

const SETTING_DOMAINS = new Set(["switch", "select", "number", "time", "button"]);

/** Ce que la carte gère déjà ailleurs (page Station et entretien, pièces) ou qui
 *  n'est pas un réglage : jamais listé dans « Autres ». */
const EXCLUDED = [
    /_room$/,
    /^reset_/,
    /^room_name$/,
    /^start_auto_empty$/,
    /^manual_drying$/,
    /^clear_warning$/,
    /^start_recleaning$/,
    /^reload_shortcuts$/,
];

/** Catégories non vides pour ce robot. Les entités indisponibles sont écartées : sur
 *  Dreame, une fonction absente du modèle reste `unavailable`. Les entités cachées
 *  dans HA aussi. */
export function buildSettingsCategories(hass: HomeAssistantFixed, vacuumId: string): SettingsCategory[] {
    const reg = hass?.entities ?? {};
    const deviceId = reg[vacuumId]?.device_id;
    if (!deviceId) return [];

    const byKey = new Map<string, string>();
    for (const [eid, entry] of Object.entries(reg)) {
        if (entry.device_id !== deviceId || eid === vacuumId) continue;
        if (!SETTING_DOMAINS.has(eid.split(".")[0])) continue;
        if ((entry as { hidden?: boolean }).hidden) continue;
        const state = hass.states[eid]?.state;
        if (state === undefined || state === "unavailable") continue;
        const key = entry.translation_key;
        if (!key || EXCLUDED.some((re) => re.test(key)) || byKey.has(key)) continue;
        byKey.set(key, eid);
    }

    const out: SettingsCategory[] = [];
    const placed = new Set<string>();
    for (const cat of SETTINGS_CATEGORIES) {
        const entities = cat.keys.filter((k) => byKey.has(k)).map((k) => byKey.get(k)!);
        cat.keys.forEach((k) => placed.add(k));
        if (entities.length) out.push({ key: cat.key, icon: cat.icon, entities });
    }
    const others = [...byKey.entries()].filter(([k]) => !placed.has(k)).map(([, eid]) => eid);
    if (others.length) out.push({ key: "other", icon: "mdi:dots-horizontal", entities: others.sort() });
    return out;
}

/** Nom court d'une entité : son nom sans le préfixe du nom de l'appareil. */
export function shortEntityName(hass: HomeAssistantFixed, entityId: string, deviceName?: string): string {
    const name = String(hass.states[entityId]?.attributes?.friendly_name ?? entityId);
    if (deviceName && name.toLowerCase().startsWith(deviceName.toLowerCase() + " ")) {
        const rest = name.slice(deviceName.length + 1);
        return rest.charAt(0).toUpperCase() + rest.slice(1);
    }
    return name;
}
