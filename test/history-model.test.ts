import { describe, it, expect } from "vitest";
import { historySignature, parseCleaningHistory, parseObstaclePhotos } from "../src/model/history/history-model";

const URL = (index: number, v: number) =>
    `/api/camera_history_map_proxy/camera.aqua10_map?token=abc&index=${index}&v=${v}`;

// Extraits des attributs réels d'un Aqua10 Ultra (caméra de carte + capteur d'historique).
const camera = {
    cleaning_history_picture: {
        "1: 10/22 17:40 - Zone Cleaning (Interrupted)": URL(1, 1792683633),
        "2: 10/21 16:39 - Room Cleaning (Completed)": URL(2, 1792593561),
        "3: 10/20 09:12 - Second Cleaning (Completed)": URL(3, 1792500000),
    },
    obstacle_picture: {
        "2: Shoe %85 (Salon)": "/api/camera_map_obstacle_proxy/camera.aqua10_map?token=abc&index=7&v=12",
        "1: Pet Waste (Cuisine) (Ignored)": "/api/camera_map_obstacle_proxy/camera.aqua10_map?token=abc&index=3&v=9",
    },
};
const sensor = {
    friendly_name: "Historique de nettoyage",
    "10-22 17:40": { timestamp: 1792683633.0, cleaning_time: "9 min", cleaned_area: "12 m²", completed: false },
    "10-21 16:39": { timestamp: 1792593561.0, cleaning_time: "8 min", cleaned_area: "6 m²", completed: true },
};

describe("parseCleaningHistory", () => {
    it("lit les nettoyages, leur issue et leur carte", () => {
        const runs = parseCleaningHistory(camera, sensor);
        expect(runs).toHaveLength(3);
        expect(runs[0]).toMatchObject({
            index: 1,
            kind: "Zone Cleaning",
            kindKey: "zone_cleaning",
            second: false,
            completed: false,
            when: "10/22 17:40",
            timestamp: 1792683633,
            url: URL(1, 1792683633),
            duration: "9 min",
            area: "12 m²",
        });
        expect(runs[1]).toMatchObject({ kindKey: "room_cleaning", completed: true, duration: "8 min", area: "6 m²" });
    });

    it("repère le deuxième passage et tolère l'absence de détail du capteur", () => {
        const run = parseCleaningHistory(camera, sensor)[2];
        expect(run).toMatchObject({ kind: "Cleaning", second: true, completed: true });
        expect(run.duration).toBeUndefined();
    });

    it("trie par rang et accepte une clé inattendue", () => {
        const runs = parseCleaningHistory({
            cleaning_history_picture: { "2: a - B": URL(2, 2), étrange: URL(9, 1), "1: x - Y": URL(1, 3) },
        });
        expect(runs.map((r) => r.kind)).toEqual(["Y", "B", "étrange"]);
        expect(runs[2].completed).toBeUndefined();
    });

    it("vide sans attribut exploitable", () => {
        expect(parseCleaningHistory(undefined)).toEqual([]);
        expect(parseCleaningHistory({ cleaning_history_picture: "x" })).toEqual([]);
        expect(parseCleaningHistory({ cleaning_history_picture: { "1: a - B": 42 } })).toEqual([]);
    });
});

describe("parseObstaclePhotos", () => {
    it("lit type, probabilité et compléments", () => {
        expect(parseObstaclePhotos(camera)).toEqual([
            {
                index: 2,
                type: "Shoe",
                probability: 85,
                details: ["Salon"],
                url: camera.obstacle_picture["2: Shoe %85 (Salon)"],
            },
            {
                index: 1,
                type: "Pet Waste",
                probability: undefined,
                details: ["Cuisine", "Ignored"],
                url: camera.obstacle_picture["1: Pet Waste (Cuisine) (Ignored)"],
            },
        ]);
    });

    it("vide quand la carte ne signale aucun obstacle", () => {
        expect(parseObstaclePhotos({})).toEqual([]);
    });
});

describe("historySignature", () => {
    it("change avec la liste des nettoyages ou le nombre de photos", () => {
        const runs = parseCleaningHistory(camera, sensor);
        const photos = parseObstaclePhotos(camera);
        const sig = historySignature(runs, photos);
        expect(historySignature(parseCleaningHistory(camera), photos)).toBe(sig);
        expect(historySignature(runs.slice(1), photos)).not.toBe(sig);
        expect(historySignature(runs, photos.slice(1))).not.toBe(sig);
    });
});
