/**
 * Historique : lecture pure (sans DOM) des derniers nettoyages et des photos d'obstacles
 * que l'intégration foXaCe/dreame-vacuum expose déjà.
 *
 * - Caméra de carte principale, attribut `cleaning_history_picture` :
 *   `{ "1: 10/22 17:40 - Zone Cleaning (Interrupted)": "/api/camera_history_map_proxy/…&index=1&v=<horodatage>" }`.
 * - Même caméra, attribut `obstacle_picture` : `{ "3: Shoe %85 (Salon)": "/api/camera_map_obstacle_proxy/…" }`.
 * - Capteur `cleaning_history` (même device) : un attribut par nettoyage, avec durée,
 *   surface et horodatage — c'est cet horodatage (paramètre `v` de l'URL) qui fait le lien.
 */

export interface HistoryRun {
    /** Rang dans l'historique (1 = le plus récent). */
    readonly index: number;
    /** Type de nettoyage tel que l'intégration le nomme (« Zone Cleaning »…). */
    readonly kind: string;
    /** Clé de traduction dérivée du type (`zone_cleaning`…). */
    readonly kindKey: string;
    /** Deuxième passage d'un nettoyage (préfixe « Second »). */
    readonly second: boolean;
    /** Terminé, interrompu, ou inconnu. */
    readonly completed: boolean | undefined;
    /** Date affichable telle que fournie (« 10/22 17:40 »), en repli. */
    readonly when: string;
    /** Horodatage Unix (s) du nettoyage, s'il est connu. */
    readonly timestamp: number | undefined;
    /** URL (relative) de la carte de ce nettoyage. */
    readonly url: string;
    /** Durée et surface lues sur le capteur d'historique (« 9 min », « 12 m² »). */
    readonly duration?: string;
    readonly area?: string;
}

export interface ObstaclePhoto {
    readonly index: number;
    /** Type d'obstacle (« Shoe », « Pet Waste »…). */
    readonly type: string;
    /** Probabilité de détection en %, si fournie. */
    readonly probability: number | undefined;
    /** Compléments entre parenthèses : pièce, statut d'ignorance. */
    readonly details: string[];
    readonly url: string;
}

type Attributes = Record<string, unknown> | undefined;

const RUN_KEY = /^\s*(\d+)\s*:\s*(.+?)\s+-\s+(.+?)\s*(?:\((Completed|Interrupted)\))?\s*$/i;

function urlTimestamp(url: string): number | undefined {
    const match = /[?&]v=(\d+)/.exec(url);
    return match ? Number(match[1]) : undefined;
}

function asString(value: unknown): string | undefined {
    return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

/** Durée et surface par horodatage, depuis les attributs du capteur d'historique. */
function sensorDetails(sensorAttributes: Attributes): Map<number, { duration?: string; area?: string }> {
    const details = new Map<number, { duration?: string; area?: string }>();
    for (const value of Object.values(sensorAttributes ?? {})) {
        if (!value || typeof value !== "object") continue;
        const entry = value as Record<string, unknown>;
        const ts = Number(entry.timestamp);
        if (!Number.isFinite(ts)) continue;
        details.set(Math.round(ts), { duration: asString(entry.cleaning_time), area: asString(entry.cleaned_area) });
    }
    return details;
}

/** Derniers nettoyages, du plus récent au plus ancien, enrichis par le capteur d'historique. */
export function parseCleaningHistory(cameraAttributes: Attributes, sensorAttributes?: Attributes): HistoryRun[] {
    const pictures = cameraAttributes?.cleaning_history_picture;
    if (!pictures || typeof pictures !== "object") return [];
    const details = sensorDetails(sensorAttributes);
    const runs: HistoryRun[] = [];
    for (const [key, value] of Object.entries(pictures as Record<string, unknown>)) {
        const url = asString(value);
        if (!url) continue;
        const match = RUN_KEY.exec(key);
        const rawKind = match ? match[3] : key;
        const second = /^second\s+/i.test(rawKind);
        const kind = rawKind.replace(/^second\s+/i, "").trim();
        const timestamp = urlTimestamp(url);
        const extra = timestamp !== undefined ? details.get(timestamp) : undefined;
        runs.push({
            index: match ? Number(match[1]) : runs.length + 1,
            kind,
            kindKey: kind.toLowerCase().replace(/[^a-z0-9]+/g, "_"),
            second,
            completed: match?.[4] ? match[4].toLowerCase() === "completed" : undefined,
            when: match ? match[2].trim() : "",
            timestamp,
            url,
            ...extra,
        });
    }
    return runs.sort((a, b) => a.index - b.index);
}

const OBSTACLE_KEY = /^\s*(\d+)\s*:\s*(.*)$/;

/** Photos d'obstacles de la carte courante, dans l'ordre de l'intégration. */
export function parseObstaclePhotos(cameraAttributes: Attributes): ObstaclePhoto[] {
    const pictures = cameraAttributes?.obstacle_picture;
    if (!pictures || typeof pictures !== "object") return [];
    const photos: ObstaclePhoto[] = [];
    for (const [key, value] of Object.entries(pictures as Record<string, unknown>)) {
        const url = asString(value);
        if (!url) continue;
        const match = OBSTACLE_KEY.exec(key);
        let rest = match ? match[2] : key;
        const details = [...rest.matchAll(/\(([^)]*)\)/g)].map((m) => m[1].trim()).filter(Boolean);
        rest = rest.replace(/\([^)]*\)/g, "");
        const probability = /%\s*(\d+)/.exec(rest);
        const type = rest.replace(/%\s*\d+/, "").trim();
        photos.push({
            index: match ? Number(match[1]) : photos.length + 1,
            type: type || key,
            probability: probability ? Number(probability[1]) : undefined,
            details,
            url,
        });
    }
    return photos;
}

/** Signature courte d'une liste : ne re-rendre le panneau fermé que si elle change. */
export function historySignature(runs: readonly HistoryRun[], photos: readonly ObstaclePhoto[]): string {
    return `${runs.map((r) => r.timestamp ?? r.index).join(",")}|${photos.length}`;
}
