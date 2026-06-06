import { describe, it, expect, vi } from "vitest";
import { fireEvent, hasAction, computeStateDomain, handleAction, forwardHaptic } from "../src/ha";
import type { HassEntity } from "home-assistant-js-websocket";

describe("fireEvent", () => {
    it("dispatches a CustomEvent with the given type and detail", () => {
        const node = document.createElement("div");
        const detail = { x: 1 };
        const spy = vi.fn();
        node.addEventListener("test-event", spy);
        fireEvent(node, "test-event", detail);
        expect(spy).toHaveBeenCalledOnce();
        expect((spy.mock.calls[0][0] as CustomEvent).detail).toEqual(detail);
    });

    it("bubbles and composes by default", () => {
        const event = fireEvent(document.createElement("div"), "test", undefined);
        expect((event as CustomEvent).bubbles).toBe(true);
        expect((event as CustomEvent).composed).toBe(true);
    });
});

describe("hasAction", () => {
    it("returns false for undefined or action=none", () => {
        expect(hasAction()).toBe(false);
        expect(hasAction({ action: "none" })).toBe(false);
    });

    it("returns true for any other action", () => {
        expect(hasAction({ action: "toggle" })).toBe(true);
        expect(hasAction({ action: "more-info" })).toBe(true);
    });
});

describe("computeStateDomain", () => {
    it("extracts the domain from entity_id", () => {
        expect(computeStateDomain({ entity_id: "vacuum.foo" } as HassEntity)).toBe("vacuum");
        expect(computeStateDomain({ entity_id: "sensor.bar_baz" } as HassEntity)).toBe("sensor");
    });
});

describe("forwardHaptic", () => {
    it("dispatches a 'haptic' event on window with the given type", () => {
        const spy = vi.fn();
        window.addEventListener("haptic", spy);
        forwardHaptic("success");
        expect(spy).toHaveBeenCalledOnce();
        expect((spy.mock.calls[0][0] as CustomEvent).detail).toBe("success");
        window.removeEventListener("haptic", spy);
    });
});

describe("handleAction", () => {
    it("calls hass service for a call-service action", () => {
        const callService = vi.fn().mockResolvedValue(undefined);
        const node = document.createElement("div");
        const config = {
            tap_action: {
                action: "call-service" as const,
                service: "vacuum.start",
                target: { entity_id: "vacuum.foo" },
            },
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        handleAction(node, { callService } as any, config, "tap");
        expect(callService).toHaveBeenCalledWith("vacuum", "start", undefined, { entity_id: "vacuum.foo" });
    });

    it("toggles the entity for a toggle action", () => {
        const callService = vi.fn().mockResolvedValue(undefined);
        const node = document.createElement("div");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        handleAction(node, { callService } as any, { entity: "light.x", tap_action: { action: "toggle" } }, "tap");
        expect(callService).toHaveBeenCalledWith("homeassistant", "toggle", undefined, { entity_id: "light.x" });
    });

    it("does nothing for action=none", () => {
        const callService = vi.fn();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        handleAction(document.createElement("div"), { callService } as any, { tap_action: { action: "none" } }, "tap");
        expect(callService).not.toHaveBeenCalled();
    });
});
