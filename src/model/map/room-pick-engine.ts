import { HassEntity } from "home-assistant-js-websocket";
import { CoordinatesConverter } from "../map_objects/coordinates-converter";
import { Room } from "../map_objects/room";
import { MapMode } from "../map_mode/map-mode";
import { MapExtractorRoom, PointType } from "../../types/types";

export interface RoomPickEngineDeps {
    /** Élément `<img id="map-image">` courant. Résolu par l'appelant (le composant, seul
     *  dépositaire du shadow DOM) — l'engine ne fait jamais de lookup DOM lui-même. Appelé à
     *  la demande, y compris depuis des callbacks async, pour toujours lire la valeur COURANTE
     *  (jamais une référence figée au moment de l'appel initial). */
    getMapImage: () => HTMLImageElement | null;
    /** État de l'entité caméra du preset courant (`hass.states[camera]`). Comme `getMapImage`,
     *  toujours résolu à la demande (y compris depuis les callbacks async de décodage
     *  d'image) : reproduit le comportement d'origine où `this.hass`/`this.coordinatesConverter`
     *  étaient relus en direct, jamais mis en cache entre l'appel initial et la résolution
     *  asynchrone. */
    getCameraState: () => HassEntity | undefined;
    getConverter: () => CoordinatesConverter | undefined;
}

/**
 * Pick-canvas / hit-test / overlay de sélection des pièces.
 *
 * Encapsule :
 *  - la construction du pick buffer (canvas off-screen dont le canal bleu encode l'ID de
 *    segment de chaque pièce), depuis `segment_map` (API, pixel-perfect) avec fallback
 *    polygones ;
 *  - le hit-test pixel-perfect (coordonnées normalisées de clic -> room ID logique) ;
 *  - le dessin de l'overlay de sélection (voile assombri hors pièces sélectionnées).
 *
 * Toutes les ressources (canvases off-screen, caches par clé de structure) sont possédées
 * par l'instance — aucune dépendance au shadow DOM du composant hôte : les seuls éléments
 * DOM externes (`<img id="map-image">`, `<canvas id="room-selection-overlay">`) sont fournis
 * par l'appelant à chaque appel.
 */
export class RoomPickEngine {
    private pickCanvas: HTMLCanvasElement | null = null;
    private pickCtx: CanvasRenderingContext2D | null = null;
    private lastPickCacheKey?: string;
    private pickLoadingKey?: string;
    private pickData?: Uint8ClampedArray;
    private pickDataCacheKey?: string;

    /** Mapping raw pixel value (canal bleu du segment_map) → room_id, reconstruit quand la
     *  structure des rooms change. L'intégration dreame_vacuum expose `segment_id` sur chaque
     *  room pour gérer les devices où raw ≠ room_id (ex. Kitchen room_id=2 mais segment
     *  raw=11). Absent ⇒ on suppose raw == room_id. */
    private rawToRoomId = new Map<number, string | number>();
    private rawToRoomIdCacheKey?: string;

    private overlaySmallCanvas?: HTMLCanvasElement;
    /** Masque alpha du PNG de map à la résolution du pick buffer : le voile du mode pièce ne
     *  doit assombrir QUE le plan (le PNG est transparent hors pièces — sans masque, le voile
     *  fabrique une dalle sombre sur le fond de la carte). */
    private mapAlphaMask?: Uint8ClampedArray;
    private mapAlphaMaskKey?: string;

    private apiRoomPolygonsCache: Map<string, PointType[]> | null = null;
    private apiRoomPolygonsCacheKey?: string;

    constructor(private readonly deps: RoomPickEngineDeps) {}

    /** Lecture directe du pick canvas courant (ou `null` tant qu'il n'est pas prêt). Exposé
     *  pour compat avec les tests navigateur historiques qui attendent sa présence via un
     *  cast sur l'instance de carte (`card._pickCanvas`) avant d'interagir avec la carte. */
    get currentPickCanvas(): HTMLCanvasElement | null {
        return this.pickCanvas;
    }

    /**
     * Pick buffer : canvas dont le canal bleu encode l'ID de segment de chaque pièce.
     * Source principale : segment_map de l'API (pixel-perfect depuis pixel_type).
     * Fallback : polygones de l'API dessinés avec bleu = segment ID.
     */
    ensurePickCanvas(): void {
        const camState = this.deps.getCameraState();
        if (!camState) return;

        const segmentMap = camState.attributes["segment_map"] as string | undefined;
        // Cache basé sur la structure (segment_map ou polygones de pièces), pas sur last_updated.
        // Pendant le cleanage la position du robot change à chaque seconde — la map elle ne bouge pas.
        const cacheKey = segmentMap
            ? `seg:${RoomPickEngine.hashString(segmentMap)}`
            : `poly:${RoomPickEngine.hashRoomsStructure(camState.attributes["rooms"])}`;

        // Déjà prêt pour cette version
        if (cacheKey === this.lastPickCacheKey && this.pickCanvas) return;
        // Déjà en cours de chargement async
        if (cacheKey === this.pickLoadingKey) return;

        if (segmentMap) {
            this.loadSegmentMap(segmentMap, cacheKey);
        } else {
            this.buildPickCanvasFromPolygons(cacheKey);
        }
    }

    /** Hash rapide (djb2) pour invalider le cache sur changement réel de structure. */
    private static hashString(s: string): string {
        let h = 5381;
        // On échantillonne tous les 64 caractères pour un coût O(n/64) — suffisant pour détecter un changement.
        for (let i = 0; i < s.length; i += 64) {
            h = ((h << 5) + h + s.charCodeAt(i)) | 0;
        }
        return `${s.length}:${h}`;
    }

    private static hashRoomsStructure(rooms: unknown): string {
        if (!rooms || typeof rooms !== "object") return "empty";
        const keys = Object.keys(rooms).sort();
        const parts: string[] = [];
        for (const k of keys) {
            const r = (rooms as Record<string, MapExtractorRoom>)[k];
            // Géométrie + visibility + segment_id (change avec une recalibration du segment_map).
            parts.push(
                `${k}:${r?.visibility ?? ""}:${r?.x0 ?? ""},${r?.y0 ?? ""},${r?.x1 ?? ""},${r?.y1 ?? ""}:${r?.outline?.length ?? 0}:${r?.segment_id ?? ""}`
            );
        }
        return parts.join("|");
    }

    /**
     * Charge le segment_map base64 depuis l'API (PNG, canal bleu = segment ID).
     */
    private loadSegmentMap(b64: string, cacheKey: string): void {
        this.pickLoadingKey = cacheKey;
        const img = new Image();
        img.onload = () => {
            this.pickLoadingKey = undefined;
            const mapImage = this.deps.getMapImage();
            if (!mapImage || mapImage.naturalWidth === 0) return;

            // Garder la taille ORIGINALE du segment_map pour le hit-test
            // Le segment_map encode les IDs dans les pixels, on ne doit pas étirer
            const w = img.naturalWidth;
            const h = img.naturalHeight;
            const canvas = document.createElement("canvas");
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext("2d", { willReadFrequently: true });
            if (!ctx) return;

            ctx.drawImage(img, 0, 0);

            // Certains devices exposent un `segment_map` dégénéré (PNG uniforme, typiquement
            // tout à zéro) quand le robot n'a pas de segmentation pixel-level à jour.
            // On détecte ce cas en échantillonnant quelques pixels (O(n), early-exit dès
            // qu'on trouve un pixel non-nul), et si le buffer est vide on bascule sur le
            // fallback polygon-based qui utilise la géométrie des rooms via les attrs.
            const data = ctx.getImageData(0, 0, w, h).data;
            let hasContent = false;
            for (let i = 0; i < data.length; i += 4) {
                if (data[i] !== 0 || data[i + 1] !== 0 || data[i + 2] !== 0) {
                    hasContent = true;
                    break;
                }
            }
            if (!hasContent) {
                this.buildPickCanvasFromPolygons(cacheKey);
                return;
            }

            this.pickCanvas = canvas;
            this.pickCtx = ctx;
            this.lastPickCacheKey = cacheKey;
            this.pickData = undefined;
            this.pickDataCacheKey = undefined;
        };
        img.onerror = () => {
            this.pickLoadingKey = undefined;
            if (MapMode.debug) console.warn("[PickCanvas] segment_map failed, fallback polygons");
            this.buildPickCanvasFromPolygons(cacheKey);
        };
        img.src = `data:image/png;base64,${b64}`;
    }

    /**
     * Fallback : construit le pick canvas depuis les polygones de l'API.
     * Canal bleu = segment_id si exposé par l'intégration, sinon parseInt(roomId).
     * Masqué par l'image réelle ensuite.
     */
    private buildPickCanvasFromPolygons(cacheKey: string): void {
        const mapImage = this.deps.getMapImage();
        if (!mapImage || mapImage.naturalWidth === 0) return;
        const converter = this.deps.getConverter();
        if (!converter) return;

        const roomPolygons = this.getApiRoomPolygons(converter);
        if (roomPolygons.size === 0) return;

        const camState = this.deps.getCameraState();
        const roomsAttr = camState?.attributes?.["rooms"] as Record<string, MapExtractorRoom> | undefined;

        const w = mapImage.naturalWidth;
        const h = mapImage.naturalHeight;
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;

        ctx.clearRect(0, 0, w, h);

        // Trier par aire décroissante (painter's algorithm)
        const entries = [...roomPolygons.entries()];
        entries.sort((a, b) => RoomPickEngine.polygonArea(b[1]) - RoomPickEngine.polygonArea(a[1]));

        for (const [roomId, poly] of entries) {
            const rawFromAttr = roomsAttr?.[roomId]?.segment_id;
            const id = typeof rawFromAttr === "number" && rawFromAttr > 0 ? rawFromAttr : parseInt(roomId) || 0;
            if (id === 0 || id > 255) continue;

            ctx.fillStyle = `rgb(0,0,${id})`;
            ctx.beginPath();
            ctx.moveTo(poly[0][0], poly[0][1]);
            for (let i = 1; i < poly.length; i++) {
                ctx.lineTo(poly[i][0], poly[i][1]);
            }
            ctx.closePath();
            ctx.fill();
        }

        // Masquer avec l'image réelle : supprimer les pixels hors-pièce
        try {
            const tmpCanvas = document.createElement("canvas");
            tmpCanvas.width = w;
            tmpCanvas.height = h;
            const tmpCtx = tmpCanvas.getContext("2d");
            if (tmpCtx) {
                tmpCtx.drawImage(mapImage, 0, 0);
                const mapPixels = tmpCtx.getImageData(0, 0, w, h).data;
                const pickImgData = ctx.getImageData(0, 0, w, h);
                const pd = pickImgData.data;
                for (let i = 0; i < w * h; i++) {
                    const off = i * 4;
                    const mr = mapPixels[off],
                        mg = mapPixels[off + 1],
                        mb = mapPixels[off + 2];
                    if (mr + mg + mb < 80 || Math.max(mr, mg, mb) - Math.min(mr, mg, mb) < 25) {
                        pd[off] = 0;
                        pd[off + 1] = 0;
                        pd[off + 2] = 0;
                        pd[off + 3] = 0;
                    }
                }
                ctx.putImageData(pickImgData, 0, 0);
            }
        } catch (e) {
            if (MapMode.debug) console.warn("[PickCanvas] Cannot mask (CORS?):", e);
        }

        this.pickCanvas = canvas;
        this.pickCtx = ctx;
        this.lastPickCacheKey = cacheKey;
        this.pickData = undefined;
        this.pickDataCacheKey = undefined;
    }

    private static polygonArea(outline: number[][]): number {
        let area = 0;
        const n = outline.length;
        for (let i = 0; i < n; i++) {
            const j = (i + 1) % n;
            area += outline[i][0] * outline[j][1];
            area -= outline[j][0] * outline[i][1];
        }
        return Math.abs(area) / 2;
    }

    /**
     * Récupère les polygones des pièces depuis l'API (pour l'overlay visuel).
     */
    private getApiRoomPolygons(converter: CoordinatesConverter): Map<string, PointType[]> {
        const camState = this.deps.getCameraState();
        if (!camState) return new Map();

        const rooms = camState.attributes["rooms"] as Record<string, MapExtractorRoom> | undefined;
        // Cache sur la structure rooms, pas sur last_updated (qui change à chaque tick du robot).
        const cacheKey = RoomPickEngine.hashRoomsStructure(rooms);

        if (this.apiRoomPolygonsCache && this.apiRoomPolygonsCacheKey === cacheKey) {
            return this.apiRoomPolygonsCache;
        }

        if (!rooms) return new Map();

        const result = new Map<string, PointType[]>();

        for (const roomId in rooms) {
            if (!Object.prototype.hasOwnProperty.call(rooms, roomId)) continue;
            const room = rooms[roomId];
            if (room.visibility === "Hidden") continue;

            const outline: PointType[] | null = room.outline
                ? (room.outline as PointType[])
                : room.x0 != null && room.y0 != null && room.x1 != null && room.y1 != null
                  ? [
                        [room.x0, room.y0],
                        [room.x1, room.y0],
                        [room.x1, room.y1],
                        [room.x0, room.y1],
                    ]
                  : null;

            if (!outline || outline.length < 3) continue;

            const imagePoly = outline.map((p) => converter.vacuumToMap(p[0], p[1]));
            result.set(String(roomId), imagePoly);
        }

        this.apiRoomPolygonsCache = result;
        this.apiRoomPolygonsCacheKey = cacheKey;
        return result;
    }

    /**
     * Overlay style Dreame : toute la carte assombrie sauf les pièces sélectionnées.
     * Utilise le pick buffer (canal bleu = room ID) pour un cutout pixel-perfect.
     * `overlayCanvas`/`mapImg` sont résolus par l'appelant (shadow DOM du composant) ;
     * l'engine ne les possède pas, il les reçoit à chaque appel.
     */
    drawSelectionOverlay(
        overlayCanvas: HTMLCanvasElement,
        mapImg: HTMLImageElement | null,
        selectedRooms: Room[],
        activeTab: string
    ): void {
        const ctx = overlayCanvas.getContext("2d");
        if (!ctx) return;

        // Hors mode pièce → pas d'overlay
        if (activeTab !== "room") {
            ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
            return;
        }

        if (!this.pickCtx || !this.pickCanvas) {
            ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
            return;
        }

        if (!mapImg || mapImg.naturalWidth === 0) return;

        const outW = mapImg.naturalWidth;
        const outH = mapImg.naturalHeight;

        if (overlayCanvas.width !== outW || overlayCanvas.height !== outH) {
            overlayCanvas.width = outW;
            overlayCanvas.height = outH;
        }

        const pickW = this.pickCanvas.width;
        const pickH = this.pickCanvas.height;

        // Construit l'inverse du mapping : room_id → Set<raw> pour comparer directement
        // aux valeurs lues dans le pick buffer (canal bleu). Plusieurs raw peuvent pointer
        // vers une même room quand l'intégration expose segment_id.
        const rawToRoomId = this.buildRawToRoomId();
        const selectedLogicalIds = new Set<string>();
        for (const room of selectedRooms) {
            selectedLogicalIds.add(String(room.toVacuum()));
        }
        const selectedRawValues = new Set<number>();
        for (const [raw, rid] of rawToRoomId) {
            if (selectedLogicalIds.has(String(rid))) selectedRawValues.add(raw);
        }
        // Fallback : pas de mapping connu ⇒ raw == room_id numérique.
        if (selectedRawValues.size === 0) {
            for (const room of selectedRooms) {
                const n = Number(room.toVacuum());
                if (!Number.isNaN(n)) selectedRawValues.add(n);
            }
        }
        const hasSelection = selectedRawValues.size > 0;

        // Cache le readback GPU → CPU : getImageData est coûteux et ne change pas tant que le pickCanvas ne bouge pas.
        if (this.pickDataCacheKey !== this.lastPickCacheKey || !this.pickData) {
            this.pickData = this.pickCtx.getImageData(0, 0, pickW, pickH).data;
            this.pickDataCacheKey = this.lastPickCacheKey;
        }
        const pickData = this.pickData;

        // Masque alpha du plan (échantillonné à la résolution du pick buffer). Rebâti
        // seulement quand l'image ou la géométrie change — pas à chaque toggle de pièce.
        const maskKey = `${mapImg.currentSrc}|${pickW}x${pickH}`;
        if (this.mapAlphaMaskKey !== maskKey || !this.mapAlphaMask) {
            const maskCanvas = document.createElement("canvas");
            maskCanvas.width = pickW;
            maskCanvas.height = pickH;
            const maskCtx = maskCanvas.getContext("2d", { willReadFrequently: true });
            if (maskCtx) {
                try {
                    maskCtx.drawImage(mapImg, 0, 0, pickW, pickH);
                    this.mapAlphaMask = maskCtx.getImageData(0, 0, pickW, pickH).data;
                    this.mapAlphaMaskKey = maskKey;
                } catch {
                    // Image cross-origin non lisible → pas de masque (voile plein cadre).
                    this.mapAlphaMask = undefined;
                    this.mapAlphaMaskKey = undefined;
                }
            }
        }
        const alphaMask = this.mapAlphaMask;

        // Construire l'overlay à la résolution du segment_map (petite) puis upscaler avec lissage.
        // Cela produit des bords lisses au lieu de marches d'escalier.
        // Canvas intermédiaire réutilisé entre les redraws (pas d'allocation par toggle de pièce).
        const smallCanvas = (this.overlaySmallCanvas ??= document.createElement("canvas"));
        if (smallCanvas.width !== pickW) smallCanvas.width = pickW;
        if (smallCanvas.height !== pickH) smallCanvas.height = pickH;
        const smallCtx = smallCanvas.getContext("2d");
        if (!smallCtx) return;
        const smallImg = smallCtx.createImageData(pickW, pickH);
        const sd = smallImg.data;

        for (let y = 0; y < pickH; y++) {
            for (let x = 0; x < pickW; x++) {
                const pi = (y * pickW + x) * 4;
                const raw = pickData[pi + 2];

                if (hasSelection && raw > 0 && selectedRawValues.has(raw)) {
                    // Pièce sélectionnée → transparent (pas de dim)
                    continue;
                }

                // Hors du plan (PNG transparent) → pas de voile : le fond de la
                // carte reste net, seul le plan est assombri.
                if (alphaMask && alphaMask[pi + 3] < 24) {
                    continue;
                }

                // Tout le reste → noir semi-transparent
                sd[pi + 3] = 100;
            }
        }

        smallCtx.putImageData(smallImg, 0, 0);

        // Upscaler avec lissage du navigateur → bords doux
        ctx.clearRect(0, 0, outW, outH);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(smallCanvas, 0, 0, outW, outH);
    }

    /**
     * Construit le mapping raw pixel → room_id depuis les attrs de la caméra.
     * Si l'intégration expose `segment_id` sur chaque room, on l'utilise ; sinon
     * fallback transparent (raw == room_id).
     */
    private buildRawToRoomId(): Map<number, string | number> {
        const camState = this.deps.getCameraState();
        const rooms = camState?.attributes?.["rooms"] as Record<string, MapExtractorRoom> | undefined;
        const cacheKey = RoomPickEngine.hashRoomsStructure(rooms);
        if (cacheKey === this.rawToRoomIdCacheKey) return this.rawToRoomId;

        const map = new Map<number, string | number>();
        if (rooms) {
            for (const [roomId, room] of Object.entries(rooms)) {
                const raw = room?.segment_id;
                if (typeof raw === "number" && raw > 0) {
                    map.set(raw, roomId);
                } else {
                    // Fallback : raw est supposé égal au room_id numérique.
                    const rid = parseInt(roomId);
                    if (!Number.isNaN(rid) && rid > 0) map.set(rid, roomId);
                }
            }
        }
        this.rawToRoomId = map;
        this.rawToRoomIdCacheKey = cacheKey;
        return map;
    }

    /** Résout une valeur raw du pick buffer vers l'id "logique" utilisé par les Room objects. */
    private rawToLogicalRoomId(raw: number): string | number | undefined {
        if (raw === 0) return undefined;
        const mapped = this.buildRawToRoomId().get(raw);
        // Si aucune room ne déclare ce raw, on retombe sur le raw brut (compat. anciens
        // devices où raw == room_id et `segment_id` absent partout).
        return mapped ?? raw;
    }

    /**
     * Hit-test pixel-perfect : canal bleu du pick buffer → room_id logique. Prend des
     * coordonnées NORMALISÉES [0,1] dans le référentiel de l'image visible (calculées par
     * l'appelant via `getBoundingClientRect()`, qui reste seul dépositaire du DOM réel) —
     * l'engine les reprojette lui-même sur la résolution propre du pick buffer, qui peut
     * différer de celle de l'image affichée (le segment_map garde sa résolution native).
     */
    hitTest(relX: number, relY: number): string | number | undefined {
        if (!this.pickCtx || !this.pickCanvas) return undefined;

        const x = Math.round(relX * this.pickCanvas.width);
        const y = Math.round(relY * this.pickCanvas.height);

        if (x < 0 || y < 0 || x >= this.pickCanvas.width || y >= this.pickCanvas.height) return undefined;

        const pixel = this.pickCtx.getImageData(x, y, 1, 1).data;
        return this.rawToLogicalRoomId(pixel[2]);
    }
}
