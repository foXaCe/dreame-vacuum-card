/**
 * Fixtures pour la suite navigateur réel.
 *
 * Les images sont générées à la volée via canvas (impossible en happy-dom) :
 * - une carte « visible » (entity_picture) : deux pièces colorées sur fond transparent ;
 * - un `segment_map` : PNG dont le canal bleu encode l'ID de segment de chaque pièce
 *   (1 et 2), exactement comme l'expose l'intégration dreame_vacuum.
 *
 * Géométrie (pixels image, 200×140) — calibration vacuum = map × 10 :
 * - pièce 1 : rect (20,20)-(90,90)   → vacuum (200,200)-(900,900)
 * - pièce 2 : rect (110,20)-(180,90) → vacuum (1100,200)-(1800,900)
 */

export const IMG_W = 200;
export const IMG_H = 140;

export const ROOM_1_PX = { x0: 20, y0: 20, x1: 90, y1: 90 };
export const ROOM_2_PX = { x0: 110, y0: 20, x1: 180, y1: 90 };

/** Centre de la pièce (en pixels de l'image naturelle). */
export const ROOM_1_CENTER_PX = { x: (ROOM_1_PX.x0 + ROOM_1_PX.x1) / 2, y: (ROOM_1_PX.y0 + ROOM_1_PX.y1) / 2 };
export const ROOM_2_CENTER_PX = { x: (ROOM_2_PX.x0 + ROOM_2_PX.x1) / 2, y: (ROOM_2_PX.y0 + ROOM_2_PX.y1) / 2 };

const VACUUM_SCALE = 10;

export interface TestImages {
    mapDataUrl: string;
    segmentMapB64: string;
}

export function makeTestImages(): TestImages {
    const visible = document.createElement("canvas");
    visible.width = IMG_W;
    visible.height = IMG_H;
    const vctx = visible.getContext("2d")!;
    vctx.fillStyle = "#8dd28d";
    vctx.fillRect(ROOM_1_PX.x0, ROOM_1_PX.y0, ROOM_1_PX.x1 - ROOM_1_PX.x0, ROOM_1_PX.y1 - ROOM_1_PX.y0);
    vctx.fillStyle = "#ffd326";
    vctx.fillRect(ROOM_2_PX.x0, ROOM_2_PX.y0, ROOM_2_PX.x1 - ROOM_2_PX.x0, ROOM_2_PX.y1 - ROOM_2_PX.y0);

    const seg = document.createElement("canvas");
    seg.width = IMG_W;
    seg.height = IMG_H;
    const sctx = seg.getContext("2d")!;
    sctx.fillStyle = "rgb(0, 0, 0)";
    sctx.fillRect(0, 0, IMG_W, IMG_H);
    sctx.fillStyle = "rgb(0, 0, 1)"; // canal bleu = segment 1
    sctx.fillRect(ROOM_1_PX.x0, ROOM_1_PX.y0, ROOM_1_PX.x1 - ROOM_1_PX.x0, ROOM_1_PX.y1 - ROOM_1_PX.y0);
    sctx.fillStyle = "rgb(0, 0, 2)"; // canal bleu = segment 2
    sctx.fillRect(ROOM_2_PX.x0, ROOM_2_PX.y0, ROOM_2_PX.x1 - ROOM_2_PX.x0, ROOM_2_PX.y1 - ROOM_2_PX.y0);

    return {
        mapDataUrl: visible.toDataURL("image/png"),
        segmentMapB64: seg.toDataURL("image/png").split(",")[1],
    };
}

/** 3 points → mode AFFINE, vacuum = map × 10. */
export const CALIBRATION_POINTS = [
    { map: { x: 0, y: 0 }, vacuum: { x: 0, y: 0 } },
    { map: { x: 100, y: 0 }, vacuum: { x: 100 * VACUUM_SCALE, y: 0 } },
    { map: { x: 0, y: 100 }, vacuum: { x: 0, y: 100 * VACUUM_SCALE } },
];

/** Attribut `rooms` façon map extractor (coordonnées VACUUM). */
export const ROOMS_ATTRIBUTE = {
    "1": {
        x0: ROOM_1_PX.x0 * VACUUM_SCALE,
        y0: ROOM_1_PX.y0 * VACUUM_SCALE,
        x1: ROOM_1_PX.x1 * VACUUM_SCALE,
        y1: ROOM_1_PX.y1 * VACUUM_SCALE,
        color_index: 3,
    },
    "2": {
        x0: ROOM_2_PX.x0 * VACUUM_SCALE,
        y0: ROOM_2_PX.y0 * VACUUM_SCALE,
        x1: ROOM_2_PX.x1 * VACUUM_SCALE,
        y1: ROOM_2_PX.y1 * VACUUM_SCALE,
        color_index: 1,
    },
};

export interface ServiceCall {
    domain: string;
    service: string;
    data: Record<string, unknown>;
}

export interface TestHass {
    // Typé lâche exprès : la carte consomme HomeAssistantFixed (interface vendored
    // minimale) — les tests castent via `as unknown as`.
    hass: Record<string, unknown>;
    calls: ServiceCall[];
    images: TestImages;
}

export function makeHass(vacuumState = "docked", extraVacuumAttributes: Record<string, unknown> = {}): TestHass {
    const images = makeTestImages();
    const calls: ServiceCall[] = [];
    const now = new Date().toISOString();
    const hass = {
        language: "en",
        locale: { language: "en" },
        localize: () => "",
        // HA résout les URLs relatives (ex. /api/camera_proxy/...) vers l'instance ;
        // nos fixtures utilisent des data: URIs, déjà absolues.
        hassUrl: (path: string) => path,
        themes: {},
        states: {
            "vacuum.test": {
                entity_id: "vacuum.test",
                state: vacuumState,
                attributes: {
                    friendly_name: "Test Vacuum",
                    battery_level: 100,
                    ...extraVacuumAttributes,
                },
                last_updated: now,
                last_changed: now,
            },
            "camera.test_map": {
                entity_id: "camera.test_map",
                state: "idle",
                attributes: {
                    friendly_name: "Test Map",
                    entity_picture: images.mapDataUrl,
                    calibration_points: CALIBRATION_POINTS,
                    segment_map: images.segmentMapB64,
                    rooms: ROOMS_ATTRIBUTE,
                },
                last_updated: now,
                last_changed: now,
            },
        },
        entities: {
            "vacuum.test": { device_id: "device_test" },
            "camera.test_map": { device_id: "device_test" },
        },
        callService: (domain: string, service: string, data: Record<string, unknown>) => {
            calls.push({ domain, service, data });
            return Promise.resolve();
        },
    };
    return { hass, calls, images };
}

export function makeCardConfig(overrides: Record<string, unknown> = {}): Record<string, unknown> {
    return {
        type: "custom:dreame-vacuum-card",
        entity: "vacuum.test",
        map_source: { camera: "camera.test_map" },
        calibration_source: { camera: true },
        vacuum_platform: "Dreame",
        show_title: false,
        // `minimal` coupe les animations ambiantes : rendus plus déterministes.
        appearance: "minimal",
        ...overrides,
    };
}

/** Attente active d'une condition (remplace les waitFor de testing-library). */
export async function until(condition: () => boolean, timeoutMs = 8000, stepMs = 50): Promise<void> {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
        if (condition()) return;
        await new Promise((resolve) => setTimeout(resolve, stepMs));
    }
    throw new Error("until(): condition jamais remplie avant le timeout");
}

/**
 * Interface minimale du custom element pour les tests — types lâches exprès (cf. TestHass).
 * `as any` reste nécessaire pour toucher l'état privé (selectedRooms, realScale, etc.).
 */
export interface CardElement extends HTMLElement {
    setConfig(config: unknown): void;
    hass: unknown;
    getCardSize(): number;
    getGridOptions(): Record<string, unknown>;
    readonly updateComplete: Promise<boolean>;
}

/** Monte une carte `dreame-vacuum-card` avec un hass de test, prête à être insérée dans le DOM. */
export function mountCard(
    config: Record<string, unknown> = makeCardConfig(),
    vacuumState = "docked",
    extraVacuumAttributes: Record<string, unknown> = {}
): { card: CardElement; hass: Record<string, unknown>; calls: ServiceCall[]; images: TestImages } {
    const { hass, calls, images } = makeHass(vacuumState, extraVacuumAttributes);
    const card = document.createElement("dreame-vacuum-card") as CardElement;
    card.setConfig(config);
    card.hass = hass;
    document.body.appendChild(card);
    return { card, hass, calls, images };
}

/** Deuxième image de carte, visuellement distincte de `makeTestImages().mapDataUrl` — sert à
 *  vérifier le double-buffering anti-flicker (l'ancienne URL doit rester affichée tant que la
 *  nouvelle n'est pas décodée). */
export function makeAlternateMapDataUrl(): string {
    const canvas = document.createElement("canvas");
    canvas.width = IMG_W;
    canvas.height = IMG_H;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ff3355";
    ctx.fillRect(0, 0, IMG_W, IMG_H);
    return canvas.toDataURL("image/png");
}
