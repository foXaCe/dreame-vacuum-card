/**
 * Station & entretien : lecture pure (sans DOM) de l'état de la station et des
 * consommables à partir de `hass`. Tout passe par les entités du MÊME device que
 * le vacuum, retrouvées par leur `translation_key` (stable, indépendante du nom
 * donné par l'utilisateur) — voir l'intégration foXaCe/dreame-vacuum.
 */
import { HomeAssistantFixed } from "../../types/fixes";

export type CareLevel = "ok" | "warn" | "crit";

/** Consommables connus, dans l'ordre d'affichage. `reset` = translation_key du bouton
 *  de réinitialisation (absent quand l'intégration n'en crée pas). */
export const CONSUMABLES: ReadonlyArray<{ key: string; reset?: string; icon: string }> = [
    { key: "main_brush", reset: "reset_main_brush", icon: "mdi:brush" },
    { key: "side_brush", reset: "reset_side_brush", icon: "mdi:pinwheel-outline" },
    { key: "filter", reset: "reset_filter", icon: "mdi:air-filter" },
    { key: "mop_pad", reset: "reset_mop_pad", icon: "mdi:water-outline" },
    { key: "sensor_dirty", reset: "reset_sensor", icon: "mdi:radar" },
    { key: "wheel_dirty", reset: "reset_wheel", icon: "mdi:tire" },
    { key: "squeegee", reset: "reset_squeegee", icon: "mdi:wiper" },
    { key: "silver_ion", reset: "reset_silver_ion", icon: "mdi:shimmer" },
    { key: "detergent", reset: "reset_detergent", icon: "mdi:bottle-tonic-outline" },
    { key: "scale_inhibitor", reset: "reset_scale_inhibitor", icon: "mdi:water-check-outline" },
    { key: "deodorizer", reset: "reset_deodorizer", icon: "mdi:scent" },
    { key: "dirty_water_tank", reset: "reset_dirty_water_tank", icon: "mdi:cup-water" },
    { key: "onboard_dirty_water_tank", reset: "reset_onboard_dirty_water_tank", icon: "mdi:cup-water" },
    { key: "tank_filter", icon: "mdi:filter-outline" },
];

/** Réservoirs / bacs de la station : état « normal » = rien à signaler. */
export const TANKS: ReadonlyArray<{ key: string; icon: string }> = [
    { key: "clean_water_tank_status", icon: "mdi:water-outline" },
    { key: "dirty_water_tank_status", icon: "mdi:cup-water" },
    { key: "dust_bag_status", icon: "mdi:delete-outline" },
    { key: "detergent_status", icon: "mdi:bottle-tonic-outline" },
];
const TANK_OK = /^(installed|normal|ok|idle|available)$/i;

export interface CareConsumable {
    key: string;
    icon: string;
    pct: number;
    level: CareLevel;
    /** Temps restant (valeur + unité du sensor `*_time_left`), si exposé. */
    timeLeft?: number;
    timeUnit?: string;
    sensorEntity: string;
    resetEntity?: string;
}

export interface CareTank {
    key: string;
    icon: string;
    entity: string;
    ok: boolean;
}

export type CareActionKind = "empty" | "wash" | "dry";
export interface CareAction {
    kind: CareActionKind;
    /** Bouton à presser (pour « dry » pendant un séchage : rien, voir `busy`). */
    entity: string;
    busy: boolean;
}

export interface CareAlert {
    /** Identifiant stable, clé du report (« plus tard »). */
    id: string;
    level: Exclude<CareLevel, "ok">;
    kind: "consumable" | "error" | "water" | "tank";
    icon: string;
    /** Consommable concerné (kind = consumable), sinon translation_key du sensor. */
    key: string;
    entity?: string;
    /** Bouton qui traite l'alerte (réinitialisation / effacement). */
    actionEntity?: string;
}

export interface CareDock {
    washing: boolean;
    washingPaused: boolean;
    drying: boolean;
    dryingProgress?: number;
    emptying: boolean;
}

export interface CareState {
    dock: CareDock;
    actions: CareAction[];
    tanks: CareTank[];
    consumables: CareConsumable[];
    alerts: CareAlert[];
}

export interface CareThresholds {
    warning: number;
    critical: number;
}
export const DEFAULT_CARE_THRESHOLDS: CareThresholds = { warning: 20, critical: 10 };

/** translation_key → entity_id, pour les entités (non désactivées) du device du vacuum.
 *  À défaut de translation_key, le suffixe de l'entity_id après le préfixe du vacuum. */
export function resolveDeviceEntities(hass: HomeAssistantFixed, vacuumId: string): Record<string, string> {
    const out: Record<string, string> = {};
    const reg = hass?.entities ?? {};
    const deviceId = reg[vacuumId]?.device_id;
    if (!deviceId) return out;
    const prefix = (vacuumId.split(".")[1] ?? "") + "_";
    for (const [eid, entry] of Object.entries(reg)) {
        if (entry.device_id !== deviceId || eid === vacuumId) continue;
        const [domain, object] = eid.split(".");
        const key = entry.translation_key || (object.startsWith(prefix) ? object.slice(prefix.length) : object);
        const k = `${domain}.${key}`;
        if (!(k in out)) out[k] = eid;
    }
    return out;
}

const num = (v: unknown): number | undefined => {
    if (v === null || v === undefined || v === "") return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
};

const usable = (hass: HomeAssistantFixed, eid: string | undefined): boolean => {
    const s = eid ? hass.states[eid]?.state : undefined;
    return s !== undefined && s !== "unavailable";
};

export function buildCareState(
    hass: HomeAssistantFixed,
    vacuumId: string,
    entities: Record<string, string>,
    thresholds: CareThresholds = DEFAULT_CARE_THRESHOLDS
): CareState {
    const a = hass.states[vacuumId]?.attributes ?? {};
    const sensorState = (key: string): string | undefined => {
        const eid = entities[`sensor.${key}`];
        return eid ? hass.states[eid]?.state : undefined;
    };

    // Station. Pendant un lavage, certains modèles laissent `washing` à false : l'état
    // fiable est alors `vacuum_state` (washing / washing_paused).
    const vs = String(a.vacuum_state ?? "");
    const washingPaused = !!a.washing_paused || vs === "washing_paused";
    const washing = !washingPaused && (!!a.washing || vs === "washing");
    const drying = !!a.drying || vs === "drying";
    const emptyStatus = sensorState("auto_empty_status") ?? (a.auto_empty_status as string | undefined);
    const emptying = !!emptyStatus && !/^(idle|unavailable|unknown)$/i.test(emptyStatus);
    const dryingProgress = drying ? num(sensorState("drying_progress") ?? a.drying_progress) : undefined;
    const dock: CareDock = { washing, washingPaused, drying, dryingProgress, emptying };

    const actions: CareAction[] = [];
    const emptyBtn = entities["button.start_auto_empty"];
    if (usable(hass, emptyBtn)) actions.push({ kind: "empty", entity: emptyBtn, busy: emptying });
    const washBtn = entities["button.self_clean"] ?? entities["button.start_washing"];
    if (usable(hass, washBtn)) actions.push({ kind: "wash", entity: washBtn, busy: washing || washingPaused });
    const dryBtn = entities["button.manual_drying"] ?? entities["button.start_drying"];
    if (usable(hass, dryBtn)) actions.push({ kind: "dry", entity: dryBtn, busy: drying });

    const tanks: CareTank[] = [];
    for (const t of TANKS) {
        const eid = entities[`sensor.${t.key}`];
        const s = eid ? hass.states[eid]?.state : undefined;
        if (!eid || s === undefined || s === "unavailable" || s === "unknown") continue;
        tanks.push({ key: t.key, icon: t.icon, entity: eid, ok: TANK_OK.test(s) });
    }

    // Consommables : seulement ceux dont l'intégration a créé le sensor (elle n'en crée
    // que pour les pièces que le robot possède) et dont la valeur est lisible.
    const consumables: CareConsumable[] = [];
    for (const c of CONSUMABLES) {
        const eid = entities[`sensor.${c.key}_left`];
        const pct = eid ? num(hass.states[eid]?.state) : undefined;
        if (!eid || pct === undefined) continue;
        const clamped = Math.max(0, Math.min(100, pct));
        const tlEid = entities[`sensor.${c.key}_time_left`];
        const tlState = tlEid ? hass.states[tlEid] : undefined;
        const resetEid = c.reset ? entities[`button.${c.reset}`] : undefined;
        consumables.push({
            key: c.key,
            icon: c.icon,
            pct: clamped,
            level: clamped <= thresholds.critical ? "crit" : clamped <= thresholds.warning ? "warn" : "ok",
            timeLeft: num(tlState?.state),
            timeUnit: tlState?.attributes?.unit_of_measurement,
            sensorEntity: eid,
            resetEntity: usable(hass, resetEid) ? resetEid : undefined,
        });
    }

    const alerts: CareAlert[] = [];
    const errorEid = entities["sensor.error"];
    const error = errorEid ? hass.states[errorEid]?.state : undefined;
    if (error && !/^(no_error|unavailable|unknown|none|0)$/i.test(error)) {
        const clear = entities["button.clear_warning"];
        alerts.push({
            id: `error_${error}`,
            level: "crit",
            kind: "error",
            icon: "mdi:alert-circle-outline",
            key: "error",
            entity: errorEid,
            actionEntity: usable(hass, clear) ? clear : undefined,
        });
    }
    const waterEid = entities["sensor.low_water_warning"];
    const water = waterEid ? hass.states[waterEid]?.state : undefined;
    if (water && !/^(no_warning|unavailable|unknown|none|0)$/i.test(water)) {
        alerts.push({
            id: `water_${water}`,
            level: "warn",
            kind: "water",
            icon: "mdi:water-alert-outline",
            key: "low_water_warning",
            entity: waterEid,
        });
    }
    for (const t of tanks) {
        if (t.ok) continue;
        const s = hass.states[t.entity]?.state;
        alerts.push({
            id: `tank_${t.key}_${s}`,
            level: "warn",
            kind: "tank",
            icon: t.icon,
            key: t.key,
            entity: t.entity,
        });
    }
    for (const c of consumables) {
        if (c.level === "ok") continue;
        alerts.push({
            id: `consumable_${c.key}`,
            level: c.level,
            kind: "consumable",
            icon: c.icon,
            key: c.key,
            entity: c.sensorEntity,
            actionEntity: c.resetEntity,
        });
    }
    // Les alertes critiques d'abord, l'ordre de construction ensuite.
    alerts.sort((x, y) => (x.level === y.level ? 0 : x.level === "crit" ? -1 : 1));

    return { dock, actions, tanks, consumables, alerts };
}

/** Alertes non reportées. `snoozed` : id → instant (ms) jusqu'auquel l'alerte est masquée. */
export function visibleAlerts(alerts: CareAlert[], snoozed: Record<string, number>, now: number): CareAlert[] {
    return alerts.filter((al) => !(snoozed[al.id] > now));
}

/** Entités dont un changement doit redessiner la page (pour `shouldUpdate`). */
export function careWatchedEntities(vacuumId: string, entities: Record<string, string>): string[] {
    const keys = [
        ...CONSUMABLES.flatMap((c) => [`sensor.${c.key}_left`, `sensor.${c.key}_time_left`]),
        ...TANKS.map((t) => `sensor.${t.key}`),
        "sensor.auto_empty_status",
        "sensor.drying_progress",
        "sensor.error",
        "sensor.low_water_warning",
    ];
    return [vacuumId, ...keys.map((k) => entities[k]).filter((e): e is string => !!e)];
}
