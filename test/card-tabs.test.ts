import { describe, it, expect } from "vitest";
import { findSpotModeIndex, visibleTabs, type TabModeCandidate } from "../src/model/map_mode/card-tabs";
import { SelectionType } from "../src/model/map_mode/selection-type";

const mode = (selectionType: SelectionType, service?: string): TabModeCandidate => ({
    selectionType,
    serviceCallSchema: { config: service ? { service } : {} },
});

describe("findSpotModeIndex", () => {
    it("trouve le mode point manuel servi par vacuum_clean_spot", () => {
        const modes = [
            mode(SelectionType.MANUAL_RECTANGLE, "dreame_vacuum.vacuum_clean_zone"),
            mode(SelectionType.ROOM, "dreame_vacuum.vacuum_clean_segment"),
            mode(SelectionType.MANUAL_POINT, "dreame_vacuum.vacuum_clean_spot"),
            mode(SelectionType.MANUAL_POINT, "dreame_vacuum.vacuum_goto"),
        ];
        expect(findSpotModeIndex(modes)).toBe(2);
    });

    it("ignore le mode « aller à », qui partage le type de sélection", () => {
        expect(findSpotModeIndex([mode(SelectionType.MANUAL_POINT, "dreame_vacuum.vacuum_goto")])).toBe(-1);
    });

    it("ignore les points prédéfinis (pas de toucher sur la carte)", () => {
        expect(findSpotModeIndex([mode(SelectionType.PREDEFINED_POINT, "dreame_vacuum.vacuum_clean_spot")])).toBe(-1);
    });

    it("accepte un service sans domaine et un mode sans schéma", () => {
        expect(
            findSpotModeIndex([mode(SelectionType.MANUAL_POINT), mode(SelectionType.MANUAL_POINT, "vacuum_clean_spot")])
        ).toBe(1);
    });
});

describe("visibleTabs", () => {
    it("ajoute « Point » après Zone quand il est disponible et autorisé", () => {
        expect(visibleTabs({ spotAvailable: true, showSpot: true })).toEqual(["room", "all", "zone", "spot"]);
    });

    it("le masque sans mode point ou quand l'option le coupe", () => {
        expect(visibleTabs({ spotAvailable: false, showSpot: true })).toEqual(["room", "all", "zone"]);
        expect(visibleTabs({ spotAvailable: true, showSpot: false })).toEqual(["room", "all", "zone"]);
    });
});
