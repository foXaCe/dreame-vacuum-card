// Le paquet `pointer-tracker` fournit bien des types (dist/index.d.ts) mais son champ
// `exports` n'expose pas de condition "types" ; avec `moduleResolution: bundler`, TS ne les
// résout donc pas. On déclare ici le module (API publique réelle, miroir de dist/index.d.ts).
declare module "pointer-tracker" {
    export class Pointer {
        /** Décalage X depuis le haut du document. */
        pageX: number;
        /** Décalage Y depuis le haut du document. */
        pageY: number;
        /** Décalage X depuis le haut du viewport. */
        clientX: number;
        /** Décalage Y depuis le haut du viewport. */
        clientY: number;
        /** Identifiant unique du pointeur. */
        id: number;
        /** Objet plateforme ayant créé ce Pointer. */
        nativePointer: Touch | PointerEvent | MouseEvent;
        constructor(nativePointer: Touch | PointerEvent | MouseEvent);
        getCoalesced(): Pointer[];
    }

    export type InputEvent = TouchEvent | PointerEvent | MouseEvent;

    export interface PointerTrackerOptions {
        start?: (pointer: Pointer, event: InputEvent) => boolean;
        move?: (previousPointers: Pointer[], changedPointers: Pointer[], event: InputEvent) => void;
        end?: (pointer: Pointer, event: InputEvent, cancelled: boolean) => void;
        avoidPointerEvents?: boolean;
        rawUpdates?: boolean;
    }

    export default class PointerTracker {
        readonly startPointers: Pointer[];
        readonly currentPointers: Pointer[];
        constructor(element: HTMLElement, options?: PointerTrackerOptions);
        stop(): void;
    }
}
