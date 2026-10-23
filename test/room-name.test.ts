import { describe, it, expect } from "vitest";
import type { HomeAssistantFixed } from "../src/types/fixes";
import { findRoomName } from "../src/utils/room-name";

const VAC = "vacuum.aqua10";
const CAM = "camera.aqua10_map";

function makeHass(): HomeAssistantFixed {
    return {
        entities: {
            [VAC]: { entity_id: VAC, device_id: "dev1" },
            "select.aqua10_room_2_name": {
                entity_id: "select.aqua10_room_2_name",
                device_id: "dev1",
                translation_key: "room_name",
            },
            "select.other_room_3_name": {
                entity_id: "select.other_room_3_name",
                device_id: "dev2",
                translation_key: "room_name",
            },
        },
        states: {
            [VAC]: { state: "docked", attributes: {} },
            "select.aqua10_room_2_name": { state: "Cuisine", attributes: { room_id: 2 } },
            "select.other_room_3_name": { state: "Pas ce robot", attributes: { room_id: 3 } },
            [CAM]: { state: "idle", attributes: { rooms: { "2": { name: "Kitchen" }, "3": { name: "Living Room" } } } },
        },
    } as unknown as HomeAssistantFixed;
}

describe("findRoomName", () => {
    it("prend le nom de la pièce renommée (entité select du même robot)", () => {
        expect(findRoomName(makeHass(), VAC, 2, CAM)).toBe("Cuisine");
    });

    it("à défaut, le nom de l'attribut rooms de la caméra ; jamais celui d'un autre robot", () => {
        expect(findRoomName(makeHass(), VAC, "3", CAM)).toBe("Living Room");
    });

    it("rien de connu : undefined", () => {
        expect(findRoomName(makeHass(), VAC, 9, CAM)).toBeUndefined();
        expect(findRoomName(undefined, VAC, 2)).toBeUndefined();
    });
});
