import PinchZoom from "./pinch-zoom";
import { defineElementOnce } from "../utils/define-element";

export * from "./pinch-zoom";
export { default } from "./pinch-zoom";
// Nom préfixé : `pinch-zoom` tout court est aussi déclaré par d'autres cartes qui
// embarquent pinch-zoom-element (Xiaomi Vacuum Map Card, dont cette carte est issue) ;
// la collision faisait avorter tout le bundle (cf. utils/define-element.ts).
defineElementOnce("dreame-pinch-zoom", PinchZoom);
