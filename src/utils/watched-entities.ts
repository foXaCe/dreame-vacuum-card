import {
    CardPresetConfig,
    Language,
    PredefinedPointConfig,
    PredefinedZoneConfig,
    XiaomiVacuumMapCardConfig,
} from "../types/types";
import { MapMode } from "../model/map_mode/map-mode";
import { SelectionType } from "../model/map_mode/selection-type";
import { PlatformGenerator } from "../model/generators/platform-generator";

export function getWatchedEntitiesForMapMode(mapMode: MapMode): Set<string> {
    const watchedEntities = new Set<string>();
    switch (mapMode.selectionType) {
        case SelectionType.PREDEFINED_RECTANGLE:
            mapMode.predefinedSelections
                .map((m) => m as PredefinedZoneConfig)
                .filter((p) => typeof p.zones === "string")
                .forEach((p) => watchedEntities.add((p.zones as string).split(".attributes.")[0]));
            break;
        case SelectionType.PREDEFINED_POINT:
            mapMode.predefinedSelections
                .map((m) => m as PredefinedPointConfig)
                .filter((p) => typeof p.position === "string")
                .forEach((p) => watchedEntities.add((p.position as string).split(".attributes.")[0]));
            break;
    }
    mapMode.predefinedSelections
        .filter((p) => p.state_entity)
        .forEach((p) => watchedEntities.add(p.state_entity as string));
    return watchedEntities;
}

export function getWatchedEntitiesForPreset(config: CardPresetConfig, language: Language): Set<string> {
    const watchedEntities = new Set<string>();
    if (config.entity) {
        watchedEntities.add(config.entity);
    }
    if (config.map_source.camera) {
        watchedEntities.add(config.map_source.camera);
    }
    if (config.calibration_source?.entity) {
        watchedEntities.add(config.calibration_source.entity);
    }
    (config.conditions ?? [])
        .map((c) => c?.entity)
        .forEach((e) => {
            if (e) watchedEntities.add(e);
        });
    (config.map_modes ?? [])
        .map((m) => new MapMode(PlatformGenerator.getPlatformName(config.vacuum_platform), m, language))
        .forEach((m) => getWatchedEntitiesForMapMode(m).forEach((e) => watchedEntities.add(e)));
    return watchedEntities;
}

export function getWatchedEntities(config: XiaomiVacuumMapCardConfig): string[] {
    const watchedEntities = new Set<string>();
    getWatchedEntitiesForPreset(config, config.language).forEach((e) => watchedEntities.add(e));
    return [...watchedEntities];
}
