import { EntityRegistryEntry } from "../types/types";
import { HomeAssistantFixed } from "../types/fixes";

export async function getAllEntitiesFromTheSameDevice(
    hass: HomeAssistantFixed,
    entity: string
): Promise<EntityRegistryEntry[]> {
    let entityRegistryEntries: EntityRegistryEntry[];
    try {
        entityRegistryEntries = await _getAllEntitiesFromTheSameDevice(hass, entity);
    } catch {
        entityRegistryEntries = [];
    }
    return entityRegistryEntries;
}

async function _getAllEntitiesFromTheSameDevice(
    hass: HomeAssistantFixed,
    entity: string
): Promise<EntityRegistryEntry[]> {
    const vacuumDeviceId = (
        await hass.callWS<EntityRegistryEntry>({
            type: "config/entity_registry/get",
            entity_id: entity,
        })
    )["device_id"];
    const vacuumSensors = (
        await hass.callWS<{ device_id: string; entity_id: string }[]>({
            type: "config/entity_registry/list",
        })
    ).filter((e) => e.device_id === vacuumDeviceId);
    const allEntities = await Promise.all(
        vacuumSensors.map((vs) =>
            hass.callWS<EntityRegistryEntry>({
                type: "config/entity_registry/get",
                entity_id: vs.entity_id,
            })
        )
    );
    return allEntities.filter((e) => e.disabled_by == null);
}
