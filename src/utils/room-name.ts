import { HomeAssistantFixed } from "../types/fixes";

/**
 * Nom d'une pièce tel qu'affiché sur la carte Dreame : l'état de l'entité
 * `select.*_room_N_name` du même appareil (attribut `room_id`), sinon l'attribut
 * `rooms` de la caméra, sinon `undefined`. L'attribut `rooms` ne porte que le nom de
 * type par défaut (« Kitchen ») quand la pièce a été renommée dans l'app.
 */
export function findRoomName(
    hass: HomeAssistantFixed | undefined,
    vacuumId: string | undefined,
    roomId: string | number,
    cameraId?: string
): string | undefined {
    if (!hass) return undefined;
    const id = String(roomId);
    const deviceId = vacuumId ? hass.entities?.[vacuumId]?.device_id : undefined;
    if (deviceId) {
        for (const [eid, entry] of Object.entries(hass.entities)) {
            if (entry.device_id !== deviceId || entry.translation_key !== "room_name") continue;
            const st = hass.states[eid];
            if (st && String(st.attributes?.room_id) === id && st.state && st.state !== "unavailable") {
                return st.state;
            }
        }
    }
    const rooms = cameraId ? hass.states?.[cameraId]?.attributes?.rooms : undefined;
    const name = rooms?.[id]?.name;
    return typeof name === "string" && name ? name : undefined;
}
