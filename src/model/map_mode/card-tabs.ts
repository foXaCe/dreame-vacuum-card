import { SelectionType } from "./selection-type";
import { ServiceCallSchemaConfig } from "../../types/types";

/** Onglets du sélecteur sous la carte, dans leur ordre d'affichage. */
export type CardTab = "room" | "all" | "zone" | "spot";

/** Service de l'intégration foXaCe/dreame-vacuum pour le nettoyage par point. */
export const SPOT_CLEAN_SERVICE = "vacuum_clean_spot";

/** Sous-ensemble d'un `MapMode` utile à la résolution des onglets (testable sans Lit).
 *  On lit le schéma résolu (`serviceCallSchema`), pas `config` : un mode issu d'un
 *  template (`{ template: "vacuum_clean_point" }`) n'a pas de schéma dans sa config brute. */
export interface TabModeCandidate {
    readonly selectionType: SelectionType;
    readonly serviceCallSchema: { readonly config: Partial<Pick<ServiceCallSchemaConfig, "service">> };
}

/**
 * Index du mode « nettoyage par point » : un point posé à la main (`MANUAL_POINT`) envoyé
 * au service `vacuum_clean_spot`. Le mode « aller à » partage le même type de sélection,
 * c'est donc le service qui les distingue. -1 si la config ne propose pas ce mode.
 */
export function findSpotModeIndex(modes: readonly TabModeCandidate[]): number {
    return modes.findIndex(
        (m) =>
            m.selectionType === SelectionType.MANUAL_POINT &&
            (m.serviceCallSchema.config.service ?? "").split(".").pop() === SPOT_CLEAN_SERVICE
    );
}

/** Onglets à afficher : « Point » n'apparaît que si un mode le sert et que l'option l'autorise. */
export function visibleTabs(options: { spotAvailable: boolean; showSpot: boolean }): CardTab[] {
    const tabs: CardTab[] = ["room", "all", "zone"];
    if (options.spotAvailable && options.showSpot) tabs.push("spot");
    return tabs;
}
