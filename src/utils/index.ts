export * from "./dom";
export * from "./misc";
export * from "./ha-change-detection";
export * from "./conditions";
export * from "./watched-entities";
export * from "./actions";
export * from "./entity-registry";

// Primitives de substitution de templates : déplacées dans ./template-utils pour éviter
// un cycle d'import (utils a besoin de MapMode, le module map_mode a besoin des primitives).
// Ré-exportées ici pour compatibilité ascendante des imports existants `from ".../utils"`.
export {
    replaceInTarget,
    getReplacedValue,
    replaceInStr,
    getFilledTemplate,
    evaluateJinjaTemplate,
} from "../template-utils";
