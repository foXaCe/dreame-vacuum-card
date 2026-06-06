import { describe, it, expect, beforeEach, vi } from "vitest";
import { CSSResult } from "lit";
import type { HomeAssistantFixed } from "../src/types/fixes";

// lottie-web touches a canvas 2D context at import time, which happy-dom does not
// implement. card-styles.ts imports map_objects which (transitively) may pull
// modules that touch lottie; mock the player defensively so imports stay no-op.
// We assert the rendering/state logic, not lottie itself.
vi.mock("lottie-web/build/player/lottie_light", () => ({
    default: {
        loadAnimation: vi.fn(() => ({ destroy: vi.fn() })),
    },
}));

// Importing these modules registers the custom elements as a side effect.
import { StatusHeader } from "../src/components/status-header";
import { CleaningProgressBar } from "../src/components/cleaning-progress-bar";
import { cardStyles } from "../src/card-styles";
import { createActionWithConfigHandler, handleActionWithConfig } from "../src/utils/actions";
import type { XiaomiVacuumMapCard } from "../src/dreame-vacuum-card";
import type { ActionHandlerEvent } from "../src/ha";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Minimal hass mock builder. `callService` is a vitest spy so tests can assert
 * service calls. `localize` returns "" (falsy) on purpose so that
 * computeStateDisplay falls through to the raw entity state (deterministic).
 */
function makeHass(overrides: Partial<HomeAssistantFixed> = {}): HomeAssistantFixed {
    return {
        states: {},
        entities: {},
        locale: { language: "en" },
        localize: () => "",
        callService: vi.fn(),
        ...overrides,
    } as unknown as HomeAssistantFixed;
}

/** Appends the element to the body and waits for the first Lit render. */
async function mount<T extends HTMLElement & { updateComplete: Promise<unknown> }>(el: T): Promise<T> {
    document.body.appendChild(el);
    await el.updateComplete;
    return el;
}

beforeEach(() => {
    document.body.innerHTML = "";
    try {
        localStorage.setItem("selectedLanguage", '"en"');
    } catch {
        /* ignore */
    }
});

// ===========================================================================
// dreame-status-header
// ===========================================================================

describe("dreame-status-header", () => {
    const VACUUM_ID = "vacuum.robot";

    /**
     * hass with a vacuum + sibling sensors (state / cleaned_area / cleaning_time /
     * battery_level) all on the same device. The sensors carry no
     * unit_of_measurement, so computeStateDisplay falls through to the raw state.
     */
    function headerHass(overrides: Partial<HomeAssistantFixed> = {}): HomeAssistantFixed {
        return makeHass({
            states: {
                [VACUUM_ID]: {
                    entity_id: VACUUM_ID,
                    state: "cleaning",
                    attributes: { friendly_name: "Robot" },
                } as never,
                "sensor.robot_state": { entity_id: "sensor.robot_state", state: "mopping", attributes: {} } as never,
                "sensor.robot_cleaned_area": {
                    entity_id: "sensor.robot_cleaned_area",
                    state: "42",
                    attributes: {},
                } as never,
                "sensor.robot_cleaning_time": {
                    entity_id: "sensor.robot_cleaning_time",
                    state: "15",
                    attributes: {},
                } as never,
                "sensor.robot_battery_level": {
                    entity_id: "sensor.robot_battery_level",
                    state: "88",
                    attributes: { icon: "mdi:battery-90" },
                } as never,
            },
            entities: {
                [VACUUM_ID]: { device_id: "dev1" },
                "sensor.robot_state": { device_id: "dev1" },
                "sensor.robot_cleaned_area": { device_id: "dev1" },
                "sensor.robot_cleaning_time": { device_id: "dev1" },
                "sensor.robot_battery_level": { device_id: "dev1" },
            } as never,
            ...overrides,
        });
    }

    it("is registered as a custom element", () => {
        expect(customElements.get("dreame-status-header")).toBe(StatusHeader);
    });

    it("renders nothing without hass or entityId", async () => {
        const el = await mount(document.createElement("dreame-status-header") as StatusHeader);
        expect(el.shadowRoot?.querySelector(".header-section")).toBeNull();
    });

    it("renders nothing when the entity is missing from hass.states", async () => {
        const el = document.createElement("dreame-status-header") as StatusHeader;
        el.hass = makeHass({ states: {} });
        el.entityId = VACUUM_ID;
        await mount(el);
        expect(el.shadowRoot?.querySelector(".header-section")).toBeNull();
    });

    it("renders the status from the dedicated _state sensor (raw state via fallthrough)", async () => {
        const el = document.createElement("dreame-status-header") as StatusHeader;
        el.hass = headerHass();
        el.entityId = VACUUM_ID;
        await mount(el);
        const status = el.shadowRoot!.querySelector(".status");
        expect(status?.textContent?.trim()).toBe("mopping");
    });

    it("falls back to the vacuum state when no _state sibling exists", async () => {
        const el = document.createElement("dreame-status-header") as StatusHeader;
        el.hass = makeHass({
            states: {
                [VACUUM_ID]: { entity_id: VACUUM_ID, state: "docked", attributes: {} } as never,
            },
            entities: { [VACUUM_ID]: { device_id: "dev1" } } as never,
        });
        el.entityId = VACUUM_ID;
        await mount(el);
        expect(el.shadowRoot!.querySelector(".status")?.textContent?.trim()).toBe("docked");
    });

    it("does not render the device name unless showTitle is set", async () => {
        const el = document.createElement("dreame-status-header") as StatusHeader;
        el.hass = headerHass();
        el.entityId = VACUUM_ID;
        await mount(el);
        expect(el.shadowRoot!.querySelector(".device-name")).toBeNull();
    });

    it("renders the friendly_name as device name when showTitle is set", async () => {
        const el = document.createElement("dreame-status-header") as StatusHeader;
        el.hass = headerHass();
        el.entityId = VACUUM_ID;
        el.showTitle = true;
        await mount(el);
        expect(el.shadowRoot!.querySelector(".device-name")?.textContent?.trim()).toBe("Robot");
    });

    it("falls back to entityId as device name when friendly_name is absent", async () => {
        const el = document.createElement("dreame-status-header") as StatusHeader;
        el.hass = makeHass({
            states: { [VACUUM_ID]: { entity_id: VACUUM_ID, state: "docked", attributes: {} } as never },
            entities: { [VACUUM_ID]: { device_id: "dev1" } } as never,
        });
        el.entityId = VACUUM_ID;
        el.showTitle = true;
        await mount(el);
        expect(el.shadowRoot!.querySelector(".device-name")?.textContent?.trim()).toBe(VACUUM_ID);
    });

    it("reads cleaned_area / cleaning_time / battery_level from sibling sensors with localized units", async () => {
        const el = document.createElement("dreame-status-header") as StatusHeader;
        el.hass = headerHass();
        el.entityId = VACUUM_ID;
        await mount(el);
        const stats = Array.from(el.shadowRoot!.querySelectorAll(".stat"));
        // Three stats: area, time, battery.
        expect(stats).toHaveLength(3);
        const values = stats.map((s) => s.querySelector(".stat-value")?.textContent?.trim());
        expect(values).toEqual(["42", "15", "88"]);
        const units = stats.map((s) => s.querySelector(".stat-unit")?.textContent?.trim());
        // en.json: m² / min / %.
        expect(units).toEqual(["m²", "min", "%"]);
    });

    it("prefers vacuum attributes over sibling sensors when present", async () => {
        const el = document.createElement("dreame-status-header") as StatusHeader;
        el.hass = makeHass({
            states: {
                [VACUUM_ID]: {
                    entity_id: VACUUM_ID,
                    state: "cleaning",
                    attributes: { cleaned_area: 99, cleaning_time: 7, battery_level: 50 },
                } as never,
                "sensor.robot_cleaned_area": {
                    entity_id: "sensor.robot_cleaned_area",
                    state: "1",
                    attributes: {},
                } as never,
            },
            entities: {
                [VACUUM_ID]: { device_id: "dev1" },
                "sensor.robot_cleaned_area": { device_id: "dev1" },
            } as never,
        });
        el.entityId = VACUUM_ID;
        await mount(el);
        const values = Array.from(el.shadowRoot!.querySelectorAll(".stat-value")).map((s) =>
            s.textContent?.trim()
        );
        expect(values).toEqual(["99", "7", "50"]);
    });

    it("renders no stats when neither attributes nor sibling sensors provide values", async () => {
        const el = document.createElement("dreame-status-header") as StatusHeader;
        el.hass = makeHass({
            states: { [VACUUM_ID]: { entity_id: VACUUM_ID, state: "docked", attributes: {} } as never },
            entities: { [VACUUM_ID]: { device_id: "dev1" } } as never,
        });
        el.entityId = VACUUM_ID;
        await mount(el);
        expect(el.shadowRoot!.querySelectorAll(".stat")).toHaveLength(0);
    });

    it("ignores sibling sensors with non-numeric state", async () => {
        const el = document.createElement("dreame-status-header") as StatusHeader;
        el.hass = makeHass({
            states: {
                [VACUUM_ID]: { entity_id: VACUUM_ID, state: "docked", attributes: {} } as never,
                "sensor.robot_cleaned_area": {
                    entity_id: "sensor.robot_cleaned_area",
                    state: "unknown",
                    attributes: {},
                } as never,
            },
            entities: {
                [VACUUM_ID]: { device_id: "dev1" },
                "sensor.robot_cleaned_area": { device_id: "dev1" },
            } as never,
        });
        el.entityId = VACUUM_ID;
        await mount(el);
        expect(el.shadowRoot!.querySelectorAll(".stat")).toHaveLength(0);
    });

    it("uses the sibling battery icon when the vacuum has no battery_level attribute", async () => {
        const el = document.createElement("dreame-status-header") as StatusHeader;
        el.hass = headerHass();
        el.entityId = VACUUM_ID;
        await mount(el);
        const batteryStat = Array.from(el.shadowRoot!.querySelectorAll(".stat")).find(
            (s) => s.querySelector(".stat-unit")?.textContent?.trim() === "%"
        );
        expect(batteryStat?.querySelector("ha-icon")?.getAttribute("icon")).toBe("mdi:battery-90");
    });

    it("renders no stats and no status crash when entity has no device_id (no siblings)", async () => {
        const el = document.createElement("dreame-status-header") as StatusHeader;
        el.hass = makeHass({
            states: { [VACUUM_ID]: { entity_id: VACUUM_ID, state: "paused", attributes: {} } as never },
            entities: { [VACUUM_ID]: {} } as never,
        });
        el.entityId = VACUUM_ID;
        await mount(el);
        expect(el.shadowRoot!.querySelector(".status")?.textContent?.trim()).toBe("paused");
        expect(el.shadowRoot!.querySelectorAll(".stat")).toHaveLength(0);
    });

    // -- sibling resolution cache --------------------------------------------

    it("caches sibling lookups per entityId across re-renders with the same entityId", async () => {
        const el = document.createElement("dreame-status-header") as StatusHeader;
        el.hass = headerHass();
        el.entityId = VACUUM_ID;
        await mount(el);
        expect(el.shadowRoot!.querySelectorAll(".stat")).toHaveLength(3);

        // Re-render with the SAME entityId but a registry that no longer lists the
        // area/time/battery sibling sensors. Their resolved ids are already cached
        // (_siblingCacheEntityId still matches), so the stats still resolve from the
        // cached sensor ids — proving lookups are not recomputed against the new
        // (sibling-less) registry.
        el.hass = makeHass({
            states: el.hass.states,
            entities: {
                [VACUUM_ID]: { device_id: "dev1" },
                "sensor.robot_state": { device_id: "dev1" },
            } as never,
        });
        await el.updateComplete;
        expect(el.shadowRoot!.querySelectorAll(".stat")).toHaveLength(3);
    });

    it("invalidates the cache when entityId changes", async () => {
        const el = document.createElement("dreame-status-header") as StatusHeader;
        el.hass = headerHass();
        el.entityId = VACUUM_ID;
        await mount(el);
        expect(el.shadowRoot!.querySelectorAll(".stat")).toHaveLength(3);

        // Point at a second vacuum on a different device with no sibling sensors.
        const SECOND = "vacuum.robot2";
        el.hass = makeHass({
            states: { [SECOND]: { entity_id: SECOND, state: "docked", attributes: {} } as never },
            entities: { [SECOND]: { device_id: "dev2" } } as never,
        });
        el.entityId = SECOND;
        await el.updateComplete;
        // Cache invalidated for the new entityId -> no siblings found -> no stats.
        expect(el.shadowRoot!.querySelectorAll(".stat")).toHaveLength(0);
    });

    it("resolves a sibling sensor by translation_key when the suffix does not match", async () => {
        const el = document.createElement("dreame-status-header") as StatusHeader;
        el.hass = makeHass({
            states: {
                [VACUUM_ID]: { entity_id: VACUUM_ID, state: "cleaning", attributes: {} } as never,
                // Name does NOT end with _cleaned_area, but translation_key matches.
                "sensor.robot_area_total": {
                    entity_id: "sensor.robot_area_total",
                    state: "12",
                    attributes: {},
                } as never,
            },
            entities: {
                [VACUUM_ID]: { device_id: "dev1" },
                "sensor.robot_area_total": { device_id: "dev1", translation_key: "cleaned_area" },
            } as never,
        });
        el.entityId = VACUUM_ID;
        await mount(el);
        const values = Array.from(el.shadowRoot!.querySelectorAll(".stat-value")).map((s) =>
            s.textContent?.trim()
        );
        expect(values).toEqual(["12"]);
    });
});

// ===========================================================================
// dreame-cleaning-progress-bar
// ===========================================================================

describe("dreame-cleaning-progress-bar", () => {
    const VACUUM_ID = "vacuum.robot";
    const PROGRESS_ID = "sensor.robot_cleaning_progress";

    function progressHass(progress: string, overrides: Partial<HomeAssistantFixed> = {}): HomeAssistantFixed {
        return makeHass({
            states: {
                [VACUUM_ID]: { entity_id: VACUUM_ID, state: "cleaning", attributes: {} } as never,
                [PROGRESS_ID]: { entity_id: PROGRESS_ID, state: progress, attributes: {} } as never,
            },
            entities: {
                [VACUUM_ID]: { device_id: "dev1" },
                [PROGRESS_ID]: { device_id: "dev1" },
            } as never,
            ...overrides,
        });
    }

    it("is registered as a custom element", () => {
        expect(customElements.get("dreame-cleaning-progress-bar")).toBe(CleaningProgressBar);
    });

    it("renders nothing without hass or entityId", async () => {
        const el = await mount(document.createElement("dreame-cleaning-progress-bar") as CleaningProgressBar);
        expect(el.shadowRoot?.querySelector(".progress-container")).toBeNull();
    });

    it("renders nothing when no *_cleaning_progress sibling exists on the device", async () => {
        const el = document.createElement("dreame-cleaning-progress-bar") as CleaningProgressBar;
        el.hass = makeHass({
            states: { [VACUUM_ID]: { entity_id: VACUUM_ID, state: "cleaning", attributes: {} } as never },
            entities: { [VACUUM_ID]: { device_id: "dev1" } } as never,
        });
        el.entityId = VACUUM_ID;
        await mount(el);
        expect(el.shadowRoot?.querySelector(".progress-container")).toBeNull();
    });

    it("renders nothing when the entity has no device_id", async () => {
        const el = document.createElement("dreame-cleaning-progress-bar") as CleaningProgressBar;
        el.hass = makeHass({
            states: { [VACUUM_ID]: { entity_id: VACUUM_ID, state: "cleaning", attributes: {} } as never },
            entities: { [VACUUM_ID]: {} } as never,
        });
        el.entityId = VACUUM_ID;
        await mount(el);
        expect(el.shadowRoot?.querySelector(".progress-container")).toBeNull();
    });

    it("renders the bar with width and rounded text when progress > 0", async () => {
        const el = document.createElement("dreame-cleaning-progress-bar") as CleaningProgressBar;
        el.hass = progressHass("42.6");
        el.entityId = VACUUM_ID;
        await mount(el);
        const fill = el.shadowRoot!.querySelector(".progress-fill") as HTMLElement;
        expect(fill).not.toBeNull();
        expect(fill.style.width).toBe("42.6%");
        expect(el.shadowRoot!.querySelector(".progress-text")?.textContent?.trim()).toBe("43%");
    });

    it("clamps the fill width to 100% when progress exceeds 100", async () => {
        const el = document.createElement("dreame-cleaning-progress-bar") as CleaningProgressBar;
        el.hass = progressHass("150");
        el.entityId = VACUUM_ID;
        await mount(el);
        const fill = el.shadowRoot!.querySelector(".progress-fill") as HTMLElement;
        expect(fill.style.width).toBe("100%");
        // The text is NOT clamped (only the width is).
        expect(el.shadowRoot!.querySelector(".progress-text")?.textContent?.trim()).toBe("150%");
    });

    it("renders nothing when progress is 0", async () => {
        const el = document.createElement("dreame-cleaning-progress-bar") as CleaningProgressBar;
        el.hass = progressHass("0");
        el.entityId = VACUUM_ID;
        await mount(el);
        expect(el.shadowRoot?.querySelector(".progress-container")).toBeNull();
    });

    it("renders nothing for a negative progress value", async () => {
        const el = document.createElement("dreame-cleaning-progress-bar") as CleaningProgressBar;
        el.hass = progressHass("-5");
        el.entityId = VACUUM_ID;
        await mount(el);
        expect(el.shadowRoot?.querySelector(".progress-container")).toBeNull();
    });

    it("renders nothing when progress is non-numeric", async () => {
        const el = document.createElement("dreame-cleaning-progress-bar") as CleaningProgressBar;
        el.hass = progressHass("unknown");
        el.entityId = VACUUM_ID;
        await mount(el);
        expect(el.shadowRoot?.querySelector(".progress-container")).toBeNull();
    });

    it("renders nothing when the resolved progress sensor state is missing", async () => {
        const el = document.createElement("dreame-cleaning-progress-bar") as CleaningProgressBar;
        // The entity registry knows the sibling, but it has no state object.
        el.hass = makeHass({
            states: { [VACUUM_ID]: { entity_id: VACUUM_ID, state: "cleaning", attributes: {} } as never },
            entities: {
                [VACUUM_ID]: { device_id: "dev1" },
                [PROGRESS_ID]: { device_id: "dev1" },
            } as never,
        });
        el.entityId = VACUUM_ID;
        await mount(el);
        expect(el.shadowRoot?.querySelector(".progress-container")).toBeNull();
    });
});

// ===========================================================================
// card-styles
// ===========================================================================

describe("cardStyles", () => {
    it("is a non-empty CSSResult", () => {
        // cardStyles is typed as CSSResultGroup but produced by the css`` tag,
        // which yields a single CSSResult instance with a cssText string.
        expect(cardStyles).toBeInstanceOf(CSSResult);
        const css = cardStyles as CSSResult;
        expect(typeof css.cssText).toBe("string");
        expect(css.cssText.length).toBeGreaterThan(0);
    });

    it("contains the ha-card container styling rules", () => {
        const css = cardStyles as CSSResult;
        expect(css.cssText).toContain("ha-card");
        expect(css.cssText).toContain("container-name: vacuum-card");
    });
});

// ===========================================================================
// utils/actions
// ===========================================================================

describe("utils/actions", () => {
    /**
     * Minimal mock implementing only the surface of XiaomiVacuumMapCard that
     * handleActionWithConfig touches: hass, _getCurrentPreset, _getCurrentMode,
     * _getSelection, repeats, internalVariables. Cast through unknown because the
     * real class has a large public API we deliberately do not implement.
     */
    function makeNode(overrides: Partial<Record<string, unknown>> = {}): XiaomiVacuumMapCard {
        const callService = vi.fn();
        // Back the node with a real DOM element so handleAction can dispatch
        // DOM events on it (fireEvent calls node.dispatchEvent) for the
        // more-info / fire-dom-event paths.
        const node = document.createElement("div");
        return Object.assign(node, {
            hass: makeHass({ callService }),
            repeats: 1,
            internalVariables: {},
            _getCurrentPreset: () => ({ entity: "vacuum.robot" }),
            _getCurrentMode: () => undefined,
            _getSelection: () => ({ selection: [], variables: {} }),
            ...overrides,
        }) as unknown as XiaomiVacuumMapCard;
    }

    it("handleActionWithConfig does nothing when hass is missing", () => {
        const callService = vi.fn();
        const node = makeNode({ hass: undefined });
        handleActionWithConfig(node, { tap_action: { action: "toggle" }, entity: "vacuum.robot" } as never, "tap");
        expect(callService).not.toHaveBeenCalled();
    });

    it("handleActionWithConfig does nothing when config is undefined", () => {
        const node = makeNode();
        const callService = node.hass.callService as ReturnType<typeof vi.fn>;
        handleActionWithConfig(node, undefined, "tap");
        expect(callService).not.toHaveBeenCalled();
    });

    it("handleActionWithConfig does nothing when action is empty", () => {
        const node = makeNode();
        const callService = node.hass.callService as ReturnType<typeof vi.fn>;
        handleActionWithConfig(node, { tap_action: { action: "toggle" }, entity: "vacuum.robot" } as never, "");
        expect(callService).not.toHaveBeenCalled();
    });

    it("handleActionWithConfig dispatches a call-service tap_action through handleAction", () => {
        const node = makeNode();
        const callService = node.hass.callService as ReturnType<typeof vi.fn>;
        const config = {
            entity: "vacuum.robot",
            tap_action: {
                action: "call-service",
                service: "vacuum.start",
                target: { entity_id: "vacuum.robot" },
            },
        };
        handleActionWithConfig(node, config as never, "tap");
        // handleAction parses "vacuum.start" into domain/service and forwards
        // service_data (undefined here) + target to hass.callService.
        expect(callService).toHaveBeenCalledWith("vacuum", "start", undefined, { entity_id: "vacuum.robot" });
    });

    it("handleActionWithConfig fires hass-more-info for a more-info tap_action", () => {
        const node = makeNode();
        const handler = vi.fn();
        (node as unknown as HTMLElement).addEventListener("hass-more-info", handler);
        handleActionWithConfig(
            node,
            { entity: "vacuum.robot", tap_action: { action: "more-info" } } as never,
            "tap"
        );
        expect(handler).toHaveBeenCalledTimes(1);
        const ev = handler.mock.calls[0][0] as CustomEvent;
        expect(ev.detail).toEqual({ entityId: "vacuum.robot" });
    });

    it("handleActionWithConfig templates [[entity_id]] from the current preset before dispatching", () => {
        const node = makeNode({ _getCurrentPreset: () => ({ entity: "vacuum.templated" }) });
        const callService = node.hass.callService as ReturnType<typeof vi.fn>;
        const config = {
            tap_action: {
                action: "call-service",
                service: "vacuum.start",
                target: { entity_id: "[[entity_id]]" },
            },
        };
        handleActionWithConfig(node, config as never, "tap");
        expect(callService).toHaveBeenCalledWith("vacuum", "start", undefined, { entity_id: "vacuum.templated" });
    });

    it("handleActionWithConfig merges config.variables into the templated payload", () => {
        const node = makeNode();
        const callService = node.hass.callService as ReturnType<typeof vi.fn>;
        const config = {
            variables: { fan_speed: "max" },
            tap_action: {
                action: "call-service",
                service: "vacuum.set_fan_speed",
                service_data: { fan_speed: "[[fan_speed]]" },
                target: { entity_id: "vacuum.robot" },
            },
        };
        handleActionWithConfig(node, config as never, "tap");
        expect(callService).toHaveBeenCalledWith(
            "vacuum",
            "set_fan_speed",
            { fan_speed: "max" },
            { entity_id: "vacuum.robot" }
        );
    });

    it("createActionWithConfigHandler with an explicit action ignores the event action", () => {
        const node = makeNode();
        const callService = node.hass.callService as ReturnType<typeof vi.fn>;
        const config = {
            entity: "vacuum.robot",
            tap_action: {
                action: "call-service",
                service: "vacuum.start",
                target: { entity_id: "vacuum.robot" },
            },
        };
        const handler = createActionWithConfigHandler(node, config as never, "tap");
        // No event needed: the explicit "tap" action is used.
        handler();
        expect(callService).toHaveBeenCalledWith("vacuum", "start", undefined, { entity_id: "vacuum.robot" });
    });

    it("createActionWithConfigHandler without an explicit action reads ev.detail.action", () => {
        const node = makeNode();
        const callService = node.hass.callService as ReturnType<typeof vi.fn>;
        const config = {
            entity: "vacuum.robot",
            hold_action: {
                action: "call-service",
                service: "vacuum.stop",
                target: { entity_id: "vacuum.robot" },
            },
        };
        const handler = createActionWithConfigHandler(node, config as never);
        const ev = { detail: { action: "hold" } } as unknown as ActionHandlerEvent;
        handler(ev);
        expect(callService).toHaveBeenCalledWith("vacuum", "stop", undefined, { entity_id: "vacuum.robot" });
    });

    it("createActionWithConfigHandler defaults to 'tap' when the event lacks a detail action", () => {
        const node = makeNode();
        const callService = node.hass.callService as ReturnType<typeof vi.fn>;
        const config = {
            entity: "vacuum.robot",
            tap_action: {
                action: "call-service",
                service: "vacuum.start",
                target: { entity_id: "vacuum.robot" },
            },
        };
        const handler = createActionWithConfigHandler(node, config as never);
        // No event at all -> ev?.detail?.action ?? "tap" -> "tap".
        handler(undefined);
        expect(callService).toHaveBeenCalledWith("vacuum", "start", undefined, { entity_id: "vacuum.robot" });
    });
});
