import { describe, it, expect, vi } from "vitest";
import { MapImageBuffer } from "../src/model/map/map-image-buffer";
import { DISCONNECTED_IMAGE } from "../src/const";

/** Petit PNG 1x1 valide (data URI) : happy-dom résout réellement `decode()` dessus,
 *  ce qui permet de tester la bascule anti-flash sans mocker `Image`. */
const TINY_PNG =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";

function makeBuffer(onSwapped: () => void = () => {}): {
    buffer: MapImageBuffer;
    resolveUrl: ReturnType<typeof vi.fn>;
} {
    const resolveUrl = vi.fn((path: string) => path);
    const buffer = new MapImageBuffer({ resolveUrl, onSwapped });
    return { buffer, resolveUrl };
}

describe("MapImageBuffer.resolveSrc — branches statiques", () => {
    it("pas de caméra ni image configurées -> DISCONNECTED_IMAGE", () => {
        const { buffer } = makeBuffer();
        const src = buffer.resolveSrc({ mapSource: {}, cameraEntityPicture: undefined, isFresh: false });
        expect(src).toBe(DISCONNECTED_IMAGE);
    });

    it("pas de caméra, image statique configurée -> renvoyée telle quelle", () => {
        const { buffer } = makeBuffer();
        const src = buffer.resolveSrc({
            mapSource: { image: "/local/my-map.png" },
            cameraEntityPicture: undefined,
            isFresh: false,
        });
        expect(src).toBe("/local/my-map.png");
    });

    it("caméra fraîche + entity_picture -> résout via resolveUrl et renvoie l'URL (rien encore affiché)", () => {
        const { buffer, resolveUrl } = makeBuffer();
        const src = buffer.resolveSrc({
            mapSource: { camera: "camera.vacuum" },
            cameraEntityPicture: "/api/camera_proxy/camera.vacuum?v=1",
            isFresh: true,
        });
        expect(resolveUrl).toHaveBeenCalledWith("/api/camera_proxy/camera.vacuum?v=1");
        expect(src).toBe("/api/camera_proxy/camera.vacuum?v=1");
    });

    it("caméra non fraîche, aucun cache -> DISCONNECTED_IMAGE", () => {
        const { buffer } = makeBuffer();
        const src = buffer.resolveSrc({
            mapSource: { camera: "camera.vacuum" },
            cameraEntityPicture: undefined,
            isFresh: false,
        });
        expect(src).toBe(DISCONNECTED_IMAGE);
    });

    it("caméra non fraîche mais une URL valide a déjà été vue -> retombe sur cette dernière", () => {
        const { buffer } = makeBuffer();
        // Premier appel frais : mémorise lastValidUrl.
        buffer.resolveSrc({
            mapSource: { camera: "camera.vacuum" },
            cameraEntityPicture: "/img/a.png",
            isFresh: true,
        });
        // Coupure de connexion : plus d'entity_picture fraîche.
        const src = buffer.resolveSrc({
            mapSource: { camera: "camera.vacuum" },
            cameraEntityPicture: undefined,
            isFresh: false,
        });
        expect(src).toBe("/img/a.png");
    });
});

describe("MapImageBuffer — bascule anti-flash après décodage", () => {
    // NOTE : happy-dom résout `onload`/`decode()` de façon synchrone pour une data URI (à la
    // différence d'un vrai navigateur, où le décodage est asynchrone — c'est ce déphasage réel
    // que verrouille `test-browser/map-double-buffering.test.ts` via un `Image` entièrement
    // contrôlé). Ce test unitaire vérifie donc l'état final et le déclenchement de `onSwapped`,
    // pas l'ordonnancement fin de la fenêtre "ancienne image encore affichée".
    it("après décodage de la nouvelle image, displayedUrl bascule et onSwapped est déclenché", async () => {
        const onSwapped = vi.fn();
        const { buffer } = makeBuffer(onSwapped);

        buffer.resolveSrc({
            mapSource: { camera: "camera.vacuum" },
            cameraEntityPicture: TINY_PNG,
            isFresh: true,
        });

        // Laisse les microtasks de `decode()`/`onload` se résoudre.
        await new Promise((resolve) => setTimeout(resolve, 0));
        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(onSwapped).toHaveBeenCalled();

        // Un nouvel appel (même s'il redevient "non frais") doit maintenant retomber sur
        // l'URL affichée, mémorisée par le double-buffering.
        const secondSrc = buffer.resolveSrc({
            mapSource: { camera: "camera.vacuum" },
            cameraEntityPicture: undefined,
            isFresh: false,
        });
        expect(secondSrc).toBe(TINY_PNG);
    });
});

describe("MapImageBuffer.isSettled — cohérence image affichée / entity_picture courant", () => {
    it("true avant tout flux caméra (source statique ou aucun état encore reçu)", () => {
        const { buffer } = makeBuffer();
        expect(buffer.isSettled()).toBe(true);
    });

    it("false tant que l'entity_picture courant n'a pas pu être affiché (préchargement/échec), true une fois décodé", () => {
        // Image contrôlée à la main (happy-dom « charge » n'importe quelle data URI,
        // impossible d'y matérialiser un échec réel — même approche que la suite
        // navigateur test-browser/map-double-buffering.test.ts).
        const RealImage = globalThis.Image;
        const instances: Array<{ onload: (() => void) | null; onerror: (() => void) | null }> = [];
        class FakeImage {
            public onload: (() => void) | null = null;
            public onerror: (() => void) | null = null;
            public crossOrigin = "";
            public set src(_v: string) {
                instances.push(this);
            }
        }
        globalThis.Image = FakeImage as unknown as typeof Image;
        try {
            const { buffer } = makeBuffer();
            const input = {
                mapSource: { camera: "camera.vacuum" },
                cameraEntityPicture: TINY_PNG,
                isFresh: true,
            };
            buffer.resolveSrc(input);
            // Préchargement en cours : l'état décrit une frame pas encore affichée.
            expect(buffer.isSettled()).toBe(false);
            // Échec de chargement (HA down pendant un reboot) : toujours pas affichable.
            instances[0].onerror?.();
            expect(buffer.isSettled()).toBe(false);
            // Retentative (nouvel état) puis décodage réussi : l'affiché rejoint le courant.
            buffer.resolveSrc(input);
            instances[1].onload?.();
            expect(buffer.isSettled()).toBe(true);
        } finally {
            globalThis.Image = RealImage;
        }
    });
});

describe("MapImageBuffer.reset", () => {
    it("purge tous les buffers -> retombe sur DISCONNECTED_IMAGE comme un état neuf", async () => {
        const { buffer } = makeBuffer();
        buffer.resolveSrc({
            mapSource: { camera: "camera.vacuum" },
            cameraEntityPicture: TINY_PNG,
            isFresh: true,
        });
        await new Promise((resolve) => setTimeout(resolve, 0));
        await new Promise((resolve) => setTimeout(resolve, 0));

        buffer.reset();

        const src = buffer.resolveSrc({
            mapSource: { camera: "camera.vacuum" },
            cameraEntityPicture: undefined,
            isFresh: false,
        });
        expect(src).toBe(DISCONNECTED_IMAGE);
    });
});
