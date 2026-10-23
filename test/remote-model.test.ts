import { describe, it, expect } from "vitest";
import {
    REMOTE_SPEEDS,
    directionForKey,
    isRemoteAvailable,
    remoteStep,
    type RemoteDirection,
} from "../src/model/remote/remote-model";

describe("remoteStep", () => {
    it("avance et recule en ligne droite, tourne sur place", () => {
        expect(remoteStep("forward", "normal")).toEqual({ rotation: 0, velocity: 200 });
        expect(remoteStep("backward", "normal")).toEqual({ rotation: 0, velocity: -200 });
        expect(remoteStep("left", "normal")).toEqual({ rotation: 40, velocity: 0 });
        expect(remoteStep("right", "normal")).toEqual({ rotation: -40, velocity: 0 });
    });

    it("les vitesses croissent et restent dans les bornes du service", () => {
        const dirs: RemoteDirection[] = ["forward", "left"];
        for (const dir of dirs) {
            const magnitudes = REMOTE_SPEEDS.map((s) => {
                const step = remoteStep(dir, s);
                return Math.abs(step.velocity) + Math.abs(step.rotation);
            });
            expect(magnitudes).toEqual([...magnitudes].sort((a, b) => a - b));
            expect(new Set(magnitudes).size).toBe(3);
        }
        for (const s of REMOTE_SPEEDS) {
            expect(Math.abs(remoteStep("forward", s).velocity)).toBeLessThanOrEqual(600);
            expect(Math.abs(remoteStep("left", s).rotation)).toBeLessThanOrEqual(360);
        }
    });
});

describe("directionForKey", () => {
    it("associe les flèches du clavier aux directions", () => {
        expect(directionForKey("ArrowUp")).toBe("forward");
        expect(directionForKey("ArrowDown")).toBe("backward");
        expect(directionForKey("ArrowLeft")).toBe("left");
        expect(directionForKey("ArrowRight")).toBe("right");
        expect(directionForKey("Enter")).toBeUndefined();
    });
});

describe("isRemoteAvailable", () => {
    it("autorise le pilotage au repos, en pause ou en erreur", () => {
        expect(isRemoteAvailable("docked", "charging_completed")).toBe(true);
        expect(isRemoteAvailable("idle", undefined)).toBe(true);
        expect(isRemoteAvailable("paused", "paused")).toBe(true);
        expect(isRemoteAvailable("error", "error")).toBe(true);
    });

    it("refuse un robot indisponible", () => {
        expect(isRemoteAvailable(undefined, undefined)).toBe(false);
        expect(isRemoteAvailable("unavailable", undefined)).toBe(false);
        expect(isRemoteAvailable("unknown", "idle")).toBe(false);
    });

    it("refuse pendant une tâche ou quand la station occupe le robot", () => {
        expect(isRemoteAvailable("cleaning", "sweeping")).toBe(false);
        expect(isRemoteAvailable("returning", "returning")).toBe(false);
        expect(isRemoteAvailable("docked", "drying")).toBe(false);
        expect(isRemoteAvailable("cleaning", "washing")).toBe(false);
        expect(isRemoteAvailable("docked", "building")).toBe(false);
        expect(isRemoteAvailable("idle", "upgrading")).toBe(false);
    });

    it("reste disponible pendant le pilotage, présenté comme un nettoyage", () => {
        expect(isRemoteAvailable("cleaning", "remote_control")).toBe(true);
    });
});
