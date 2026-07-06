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

    it("falls back to DEFAULT_ACTIONS.tap (more-info) when no tap_action is configured", () => {
        const callService = vi.fn();
        const node = document.createElement("div");
        const handler = vi.fn();
        node.addEventListener("hass-more-info", handler);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        handleAction(node, { callService } as any, { entity: "light.x" }, "tap");
        expect(handler).toHaveBeenCalledOnce();
        expect((handler.mock.calls[0][0] as CustomEvent).detail).toEqual({ entityId: "light.x" });
    });

    it("falls back to DEFAULT_ACTIONS.hold (none) when no hold_action is configured", () => {
        const callService = vi.fn();
        const node = document.createElement("div");
        const handler = vi.fn();
        node.addEventListener("hass-more-info", handler);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        handleAction(node, { callService } as any, { entity: "light.x" }, "hold");
        expect(handler).not.toHaveBeenCalled();
        expect(callService).not.toHaveBeenCalled();
    });

    it("uses the explicit hold_action when action='hold'", () => {
        const callService = vi.fn().mockResolvedValue(undefined);
        const node = document.createElement("div");
        handleAction(
            node,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            { callService } as any,
            {
                hold_action: {
                    action: "call-service",
                    service: "vacuum.locate",
                    target: { entity_id: "vacuum.foo" },
                },
            },
            "hold"
        );
        expect(callService).toHaveBeenCalledWith("vacuum", "locate", undefined, { entity_id: "vacuum.foo" });
    });

    it("uses the explicit double_tap_action when action='double_tap'", () => {
        const callService = vi.fn().mockResolvedValue(undefined);
        const node = document.createElement("div");
        handleAction(
            node,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            { callService } as any,
            {
                double_tap_action: {
                    action: "call-service",
                    service: "vacuum.pause",
                    target: { entity_id: "vacuum.foo" },
                },
            },
            "double_tap"
        );
        expect(callService).toHaveBeenCalledWith("vacuum", "pause", undefined, { entity_id: "vacuum.foo" });
    });

    it("toggle does nothing when config.entity is missing", () => {
        const callService = vi.fn();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        handleAction(
            document.createElement("div"),
            { callService } as any,
            { tap_action: { action: "toggle" } },
            "tap"
        );
        expect(callService).not.toHaveBeenCalled();
    });

    it("call-service falls back to service_data ?? data when service_data is absent", () => {
        const callService = vi.fn().mockResolvedValue(undefined);
        const node = document.createElement("div");
        handleAction(
            node,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            { callService } as any,
            {
                tap_action: {
                    action: "call-service",
                    service: "vacuum.set_fan_speed",
                    data: { fan_speed: "max" },
                    target: { entity_id: "vacuum.foo" },
                },
            },
            "tap"
        );
        expect(callService).toHaveBeenCalledWith(
            "vacuum",
            "set_fan_speed",
            { fan_speed: "max" },
            {
                entity_id: "vacuum.foo",
            }
        );
    });

    it("call-service does nothing when the action has no service", () => {
        const callService = vi.fn();
        handleAction(
            document.createElement("div"),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            { callService } as any,
            { tap_action: { action: "call-service" } as never },
            "tap"
        );
        expect(callService).not.toHaveBeenCalled();
    });

    it("navigate pushes history state and fires a location-changed event", () => {
        const callService = vi.fn();
        const pushStateSpy = vi.spyOn(history, "pushState").mockImplementation(() => {});
        const spy = vi.fn();
        window.addEventListener("location-changed", spy);
        handleAction(
            document.createElement("div"),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            { callService } as any,
            { tap_action: { action: "navigate", navigation_path: "/lovelace/0" } },
            "tap"
        );
        expect(pushStateSpy).toHaveBeenCalledWith(null, "", "/lovelace/0");
        expect(spy).toHaveBeenCalledOnce();
        expect((spy.mock.calls[0][0] as CustomEvent).detail).toEqual({ replace: false });
        window.removeEventListener("location-changed", spy);
        pushStateSpy.mockRestore();
    });

    it("url opens the link in a new tab without opener access", () => {
        const callService = vi.fn();
        const openSpy = vi.spyOn(window, "open").mockReturnValue(null);
        handleAction(
            document.createElement("div"),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            { callService } as any,
            { tap_action: { action: "url", url_path: "https://example.com" } },
            "tap"
        );
        expect(openSpy).toHaveBeenCalledWith("https://example.com", "_blank", "noopener");
        openSpy.mockRestore();
    });

    it("url preserves the URL intact (hyphens not stripped)", () => {
        const callService = vi.fn();
        const openSpy = vi.spyOn(window, "open").mockReturnValue(null);
        handleAction(
            document.createElement("div"),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            { callService } as any,
            { tap_action: { action: "url", url_path: "https://example.com/my-page" } },
            "tap"
        );
        expect(openSpy).toHaveBeenCalledWith("https://example.com/my-page", "_blank", "noopener");
        openSpy.mockRestore();
    });

    it("url allows a relative path", () => {
        const callService = vi.fn();
        const openSpy = vi.spyOn(window, "open").mockReturnValue(null);
        handleAction(
            document.createElement("div"),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            { callService } as any,
            { tap_action: { action: "url", url_path: "/local/dashboard" } },
            "tap"
        );
        expect(openSpy).toHaveBeenCalledWith("/local/dashboard", "_blank", "noopener");
        openSpy.mockRestore();
    });

    it("url rejects a javascript: scheme (XSS guard)", () => {
        const callService = vi.fn();
        const openSpy = vi.spyOn(window, "open").mockReturnValue(null);
        handleAction(
            document.createElement("div"),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            { callService } as any,
            { tap_action: { action: "url", url_path: "javascript:alert(1)" } },
            "tap"
        );
        expect(openSpy).not.toHaveBeenCalled();
        openSpy.mockRestore();
    });

    it("url rejects a javascript: scheme hidden behind a control character (tab bypass)", () => {
        const callService = vi.fn();
        const openSpy = vi.spyOn(window, "open").mockReturnValue(null);
        handleAction(
            document.createElement("div"),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            { callService } as any,
            { tap_action: { action: "url", url_path: "java\tscript:alert(1)" } },
            "tap"
        );
        expect(openSpy).not.toHaveBeenCalled();
        openSpy.mockRestore();
    });

    it("url rejects a javascript: scheme regardless of casing", () => {
        const callService = vi.fn();
        const openSpy = vi.spyOn(window, "open").mockReturnValue(null);
        handleAction(
            document.createElement("div"),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            { callService } as any,
            { tap_action: { action: "url", url_path: "JaVaScRiPt:alert(1)" } },
            "tap"
        );
        expect(openSpy).not.toHaveBeenCalled();
        openSpy.mockRestore();
    });

    it("url rejects a mailto: scheme (allowlist is http/https only)", () => {
        const callService = vi.fn();
        const openSpy = vi.spyOn(window, "open").mockReturnValue(null);
        handleAction(
            document.createElement("div"),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            { callService } as any,
            { tap_action: { action: "url", url_path: "mailto:x@y.z" } },
            "tap"
        );
        expect(openSpy).not.toHaveBeenCalled();
        openSpy.mockRestore();
    });

    it("url does nothing when url_path is empty", () => {
        const callService = vi.fn();
        const openSpy = vi.spyOn(window, "open").mockReturnValue(null);
        handleAction(
            document.createElement("div"),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            { callService } as any,
            { tap_action: { action: "url", url_path: "" } },
            "tap"
        );
        expect(openSpy).not.toHaveBeenCalled();
        openSpy.mockRestore();
    });

    it("fire-dom-event dispatches an 'll-custom' event with the action config as detail", () => {
        const callService = vi.fn();
        const node = document.createElement("div");
        const spy = vi.fn();
        node.addEventListener("ll-custom", spy);
        const actionConfig = { action: "fire-dom-event" as const, foo: "bar" };
        handleAction(
            node,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            { callService } as any,
            { tap_action: actionConfig },
            "tap"
        );
        expect(spy).toHaveBeenCalledOnce();
        expect((spy.mock.calls[0][0] as CustomEvent).detail).toEqual(actionConfig);
    });
});
