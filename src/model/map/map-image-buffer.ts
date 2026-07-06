import { MapSourceConfig } from "../../types/types";
import { DISCONNECTED_IMAGE } from "../../const";

export interface MapImageBufferDeps {
    /** Résout une URL relative (`entity_picture`) en URL absolue — typiquement `hass.hassUrl`. */
    resolveUrl: (path: string) => string;
    /** Appelé une fois qu'une nouvelle image a fini de se décoder et est devenue l'image
     *  affichée — permet au composant de redemander un rendu (`requestUpdate`). */
    onSwapped: () => void;
}

export interface MapSrcInput {
    mapSource: MapSourceConfig;
    /** `entity_picture` de l'entité caméra du preset, si une caméra est configurée. */
    cameraEntityPicture: string | undefined;
    /** `true` si la connexion HA est active et la dernière mise à jour assez récente
     *  (fenêtre `DISCONNECTION_TIME`) — calculé par l'appelant, qui possède l'horloge
     *  et l'état de connexion. */
    isFresh: boolean;
}

/**
 * Double-buffering de l'image de carte affichée : précharge l'URL hors-écran et ne
 * bascule la source affichée qu'une fois l'image décodée, pour éliminer le flash
 * quand `entity_picture` change (cf. `test-browser/map-double-buffering.test.ts`).
 * État encapsulé : URL affichée, URL en cours de préchargement, dernière URL valide
 * (fallback hors-ligne).
 */
export class MapImageBuffer {
    private displayedUrl?: string;
    private pendingUrl?: string;
    private lastValidUrl?: string;

    constructor(private readonly deps: MapImageBufferDeps) {}

    /** Purge tous les buffers (changement de caméra/preset) : la prochaine résolution
     *  repart de zéro, comme si aucune image n'avait jamais été affichée. */
    reset(): void {
        this.displayedUrl = undefined;
        this.pendingUrl = undefined;
        this.lastValidUrl = undefined;
    }

    resolveSrc({ mapSource, cameraEntityPicture, isFresh }: MapSrcInput): string {
        if (mapSource.camera) {
            if (isFresh && cameraEntityPicture) {
                // `entity_picture` de l'intégration contient DÉJÀ un cache-buster `?v=int(last_updated)`
                // qui ne change que lorsque la carte/position change réellement. On n'ajoute donc pas
                // de second `&v=${last_updated}` (qui forçait un re-fetch à chaque écriture d'état, même
                // image identique). Couplé au double-buffering ci-dessous, cela supprime le flash.
                const fullUrl = this.deps.resolveUrl(cameraEntityPicture);
                this.lastValidUrl = fullUrl;
                this._preload(fullUrl);
                // Tant que la nouvelle image n'est pas décodée, on garde l'URL déjà affichée :
                // l'<img> visible ne pointe jamais vers une ressource non prête -> aucun blanc.
                return this.displayedUrl ?? fullUrl;
            }
            // Return cached map instead of disconnected image
            if (this.displayedUrl) {
                return this.displayedUrl;
            }
            if (this.lastValidUrl) {
                return this.lastValidUrl;
            }
            return DISCONNECTED_IMAGE;
        }
        if (mapSource.image) {
            return `${mapSource.image}`;
        }
        return DISCONNECTED_IMAGE;
    }

    /**
     * `true` quand l'image AFFICHÉE correspond à l'`entity_picture` courant.
     * `false` pendant la fenêtre où les attributs d'état (calibration,
     * vacuum_position) décrivent déjà la nouvelle frame alors que l'<img>
     * visible montre encore l'ancienne (préchargement en cours, ou échec de
     * chargement — ex. reboot de HA) : dans cette fenêtre, tout overlay
     * positionné en % de l'image affichée serait calculé avec des données
     * incohérentes (signalement 2026-07-06 : robot dans le coin au reboot).
     */
    isSettled(): boolean {
        return this.lastValidUrl === undefined || this.displayedUrl === this.lastValidUrl;
    }

    /**
     * Précharge l'URL hors-écran et ne bascule `displayedUrl` (donc le `src` de
     * `#map-image` côté composant) qu'une fois l'image décodée. L'`<img>` visible
     * continue d'afficher la frame précédente pendant ce temps -> pas de flash.
     */
    private _preload(url: string): void {
        if (url === this.displayedUrl || url === this.pendingUrl) {
            return;
        }
        this.pendingUrl = url;
        const img = new Image();
        img.crossOrigin = "anonymous";
        const finish = (): void => {
            // Une URL plus récente a pris le relais entre-temps : on abandonne celle-ci.
            if (this.pendingUrl !== url) {
                return;
            }
            this.pendingUrl = undefined;
            this.displayedUrl = url;
            this.deps.onSwapped();
        };
        img.onload = finish;
        img.onerror = (): void => {
            if (this.pendingUrl === url) {
                this.pendingUrl = undefined;
            }
        };
        img.src = url;
        // decode() garantit que la frame est prête à peindre (pas seulement téléchargée) ;
        // en cas d'échec (header/navigateur) on retombe sur l'évènement onload.
        if (img.decode) {
            img.decode()
                .then(finish)
                .catch(() => undefined);
        }
    }
}
