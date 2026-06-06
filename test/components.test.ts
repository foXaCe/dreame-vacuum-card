import { describe, it, expect, beforeEach, vi } from "vitest";
import type { HomeAssistantFixed } from "../src/types/fixes";

// lottie-web touches a canvas 2D context at import time, which happy-dom does not
// implement. Mock the player so importing robot-animation.ts (and loading
// animations) is a no-op. We assert the rendering/state logic, not lottie itself.
vi.mock("lottie-web/build/player/lottie_light", () => ({
    default: {
        loadAnimation: vi.fn(() => ({ destroy: vi.fn() })),
    },
}));

// Importing the modules registers the custom elements as a side effect.
import { ActionButtons } from "../src/components/action-buttons";
import { DreameTabSelector } from "../src/components/tab-selector";
import { CleaningModeChip } from "../src/components/cleaning-mode-chip";
import { RobotAnimation } from "../src/components/robot-animation";

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
    // Force the localize() default-language path to "en" deterministically.
    try {
        localStorage.setItem("selectedLanguage", '"en"');
    } catch {
        /* ignore */
    }
});

// ===========================================================================
// dreame-action-buttons
// ===========================================================================

describe("dreame-action-buttons", () => {
    it("is registered as a custom element", () => {
        expect(customElements.get("dreame-action-buttons")).toBe(ActionButtons);
    });

    it("renders nothing without hass or entityId", async () => {
        const el = (await mount(document.createElement("dreame-action-buttons") as ActionButtons)) as ActionButtons;
        // No hass / no entityId -> render() returns `nothing`, so no buttons.
        expect(el.shadowRoot?.querySelector("button")).toBeNull();
    });

    it("renders nothing when the entity is missing from hass.states", async () => {
        const el = document.createElement("dreame-action-buttons") as ActionButtons;
        el.hass = makeHass({ states: {} });
        el.entityId = "vacuum.test";
        await mount(el);
        expect(el.shadowRoot?.querySelector("button")).toBeNull();
    });

    it("renders Clean/Dock as real <button>s with aria-labels when docked", async () => {
        const el = document.createElement("dreame-action-buttons") as ActionButtons;
        el.hass = makeHass({
            states: { "vacuum.test": { state: "docked" } as never },
        });
        el.entityId = "vacuum.test";
        await mount(el);

        const buttons = Array.from(el.shadowRoot!.querySelectorAll("button"));
        expect(buttons).toHaveLength(2);
        // Real <button> elements.
        expect(buttons.every((b) => b.tagName === "BUTTON")).toBe(true);
        expect(buttons.map((b) => b.getAttribute("aria-label"))).toEqual(["Clean", "Dock"]);
        // Primary class on first, secondary on second.
        expect(buttons[0].classList.contains("primary")).toBe(true);
        expect(buttons[1].classList.contains("secondary")).toBe(true);
    });

    it.each([
        ["idle", ["Clean", "Dock"]],
        ["charged", ["Clean", "Dock"]],
        ["returning", ["Clean", "Dock"]],
        ["unknown_state", ["Clean", "Dock"]],
    ])("maps state %s to %s buttons", async (state, labels) => {
        const el = document.createElement("dreame-action-buttons") as ActionButtons;
        el.hass = makeHass({ states: { "vacuum.test": { state } as never } });
        el.entityId = "vacuum.test";
        await mount(el);
        const buttons = Array.from(el.shadowRoot!.querySelectorAll("button"));
        expect(buttons.map((b) => b.getAttribute("aria-label"))).toEqual(labels);
    });

    it("maps cleaning state to Pause/Stop and primary is a warning", async () => {
        const el = document.createElement("dreame-action-buttons") as ActionButtons;
        el.hass = makeHass({ states: { "vacuum.test": { state: "cleaning" } as never } });
        el.entityId = "vacuum.test";
        await mount(el);
        const buttons = Array.from(el.shadowRoot!.querySelectorAll("button"));
        expect(buttons.map((b) => b.getAttribute("aria-label"))).toEqual(["Pause", "Stop"]);
        expect(buttons[0].classList.contains("warning")).toBe(true);
    });

    it.each(["segment_cleaning", "zoned_cleaning"])("maps %s to Pause/Stop too", async (state) => {
        const el = document.createElement("dreame-action-buttons") as ActionButtons;
        el.hass = makeHass({ states: { "vacuum.test": { state } as never } });
        el.entityId = "vacuum.test";
        await mount(el);
        const buttons = Array.from(el.shadowRoot!.querySelectorAll("button"));
        expect(buttons.map((b) => b.getAttribute("aria-label"))).toEqual(["Pause", "Stop"]);
    });

    it("maps paused state to Resume/Stop", async () => {
        const el = document.createElement("dreame-action-buttons") as ActionButtons;
        el.hass = makeHass({ states: { "vacuum.test": { state: "paused" } as never } });
        el.entityId = "vacuum.test";
        await mount(el);
        const buttons = Array.from(el.shadowRoot!.querySelectorAll("button"));
        expect(buttons.map((b) => b.getAttribute("aria-label"))).toEqual(["Resume", "Stop"]);
    });

    it("clicking the primary button while docked calls vacuum.start via target", async () => {
        const callService = vi.fn();
        const el = document.createElement("dreame-action-buttons") as ActionButtons;
        el.hass = makeHass({ states: { "vacuum.test": { state: "docked" } as never }, callService });
        el.entityId = "vacuum.test";
        await mount(el);
        const buttons = Array.from(el.shadowRoot!.querySelectorAll("button"));
        buttons[0].click();
        expect(callService).toHaveBeenCalledWith("vacuum", "start", undefined, { entity_id: "vacuum.test" });
    });

    it("clicking secondary while docked calls return_to_base", async () => {
        const callService = vi.fn();
        const el = document.createElement("dreame-action-buttons") as ActionButtons;
        el.hass = makeHass({ states: { "vacuum.test": { state: "docked" } as never }, callService });
        el.entityId = "vacuum.test";
        await mount(el);
        const buttons = Array.from(el.shadowRoot!.querySelectorAll("button"));
        buttons[1].click();
        expect(callService).toHaveBeenCalledWith("vacuum", "return_to_base", undefined, { entity_id: "vacuum.test" });
    });

    it("clicking pause while cleaning calls vacuum.pause", async () => {
        const callService = vi.fn();
        const el = document.createElement("dreame-action-buttons") as ActionButtons;
        el.hass = makeHass({ states: { "vacuum.test": { state: "cleaning" } as never }, callService });
        el.entityId = "vacuum.test";
        await mount(el);
        const buttons = Array.from(el.shadowRoot!.querySelectorAll("button"));
        buttons[0].click();
        expect(callService).toHaveBeenCalledWith("vacuum", "pause", undefined, { entity_id: "vacuum.test" });
    });

    it("shows selection buttons (Clean + count / Cancel) when room tab has a selection", async () => {
        const el = document.createElement("dreame-action-buttons") as ActionButtons;
        el.hass = makeHass({ states: { "vacuum.test": { state: "docked" } as never } });
        el.entityId = "vacuum.test";
        el.activeTab = "room";
        el.hasSelection = true;
        el.selectionCount = 3;
        await mount(el);
        const buttons = Array.from(el.shadowRoot!.querySelectorAll("button"));
        expect(buttons.map((b) => b.getAttribute("aria-label"))).toEqual(["Clean (3)", "Cancel"]);
    });

    it("omits the count suffix when selectionCount is 0", async () => {
        const el = document.createElement("dreame-action-buttons") as ActionButtons;
        el.hass = makeHass({ states: { "vacuum.test": { state: "docked" } as never } });
        el.entityId = "vacuum.test";
        el.activeTab = "zone";
        el.hasSelection = true;
        el.selectionCount = 0;
        await mount(el);
        const buttons = Array.from(el.shadowRoot!.querySelectorAll("button"));
        expect(buttons[0].getAttribute("aria-label")).toBe("Clean");
    });

    it("uses Add-to-cleaning (append) primary when canAppendRooms is set", async () => {
        const el = document.createElement("dreame-action-buttons") as ActionButtons;
        el.hass = makeHass({ states: { "vacuum.test": { state: "cleaning" } as never } });
        el.entityId = "vacuum.test";
        el.activeTab = "room";
        el.hasSelection = true;
        el.selectionCount = 2;
        el.canAppendRooms = true;
        await mount(el);
        const buttons = Array.from(el.shadowRoot!.querySelectorAll("button"));
        expect(buttons[0].getAttribute("aria-label")).toBe("Add to cleaning (2)");
    });

    it("selection primary fires action-run event (default) on click", async () => {
        const el = document.createElement("dreame-action-buttons") as ActionButtons;
        el.hass = makeHass({ states: { "vacuum.test": { state: "docked" } as never } });
        el.entityId = "vacuum.test";
        el.activeTab = "room";
        el.hasSelection = true;
        await mount(el);
        const handler = vi.fn();
        el.addEventListener("action-run", handler);
        const buttons = Array.from(el.shadowRoot!.querySelectorAll("button"));
        buttons[0].click();
        expect(handler).toHaveBeenCalledTimes(1);
    });

    it("selection primary fires action-append when canAppendRooms is set", async () => {
        const el = document.createElement("dreame-action-buttons") as ActionButtons;
        el.hass = makeHass({ states: { "vacuum.test": { state: "cleaning" } as never } });
        el.entityId = "vacuum.test";
        el.activeTab = "zone";
        el.hasSelection = true;
        el.canAppendRooms = true;
        await mount(el);
        const handler = vi.fn();
        el.addEventListener("action-append", handler);
        const buttons = Array.from(el.shadowRoot!.querySelectorAll("button"));
        buttons[0].click();
        expect(handler).toHaveBeenCalledTimes(1);
    });

    it("selection secondary fires action-cancel", async () => {
        const el = document.createElement("dreame-action-buttons") as ActionButtons;
        el.hass = makeHass({ states: { "vacuum.test": { state: "docked" } as never } });
        el.entityId = "vacuum.test";
        el.activeTab = "room";
        el.hasSelection = true;
        await mount(el);
        const handler = vi.fn();
        el.addEventListener("action-cancel", handler);
        const buttons = Array.from(el.shadowRoot!.querySelectorAll("button"));
        buttons[1].click();
        expect(handler).toHaveBeenCalledTimes(1);
    });

    it("falls back to state buttons on 'all' tab even with a selection", async () => {
        const el = document.createElement("dreame-action-buttons") as ActionButtons;
        el.hass = makeHass({ states: { "vacuum.test": { state: "docked" } as never } });
        el.entityId = "vacuum.test";
        el.activeTab = "all";
        el.hasSelection = true;
        el.selectionCount = 5;
        await mount(el);
        const buttons = Array.from(el.shadowRoot!.querySelectorAll("button"));
        // "all" never uses selection buttons -> state buttons.
        expect(buttons.map((b) => b.getAttribute("aria-label"))).toEqual(["Clean", "Dock"]);
    });
});

// ===========================================================================
// dreame-tab-selector
// ===========================================================================

describe("dreame-tab-selector", () => {
    it("is registered as a custom element", () => {
        expect(customElements.get("dreame-tab-selector")).toBe(DreameTabSelector);
    });

    it("renders a tablist with three role=tab buttons", async () => {
        const el = document.createElement("dreame-tab-selector") as DreameTabSelector;
        await mount(el);
        const tablist = el.shadowRoot!.querySelector('[role="tablist"]');
        expect(tablist).not.toBeNull();
        const tabs = el.shadowRoot!.querySelectorAll<HTMLButtonElement>('button[role="tab"]');
        expect(tabs).toHaveLength(3);
    });

    it("marks only the active tab with aria-selected=true (default room)", async () => {
        const el = document.createElement("dreame-tab-selector") as DreameTabSelector;
        await mount(el);
        const tabs = Array.from(el.shadowRoot!.querySelectorAll<HTMLButtonElement>('button[role="tab"]'));
        expect(tabs.map((t) => t.getAttribute("aria-selected"))).toEqual(["true", "false", "false"]);
        expect(tabs[0].classList.contains("active")).toBe(true);
    });

    it("reflects activeTab changes in aria-selected", async () => {
        const el = document.createElement("dreame-tab-selector") as DreameTabSelector;
        el.activeTab = "zone";
        await mount(el);
        const tabs = Array.from(el.shadowRoot!.querySelectorAll<HTMLButtonElement>('button[role="tab"]'));
        expect(tabs.map((t) => t.getAttribute("aria-selected"))).toEqual(["false", "false", "true"]);
    });

    it("clicking a tab updates activeTab and emits tab-changed", async () => {
        const el = document.createElement("dreame-tab-selector") as DreameTabSelector;
        await mount(el);
        const handler = vi.fn();
        el.addEventListener("tab-changed", handler);
        const tabs = Array.from(el.shadowRoot!.querySelectorAll<HTMLButtonElement>('button[role="tab"]'));
        tabs[1].click(); // "all"
        expect(el.activeTab).toBe("all");
        expect(handler).toHaveBeenCalledTimes(1);
        const ev = handler.mock.calls[0][0] as CustomEvent;
        expect(ev.detail).toEqual({ tab: "all" });
        expect(ev.bubbles).toBe(true);
        expect(ev.composed).toBe(true);
    });

    it("does not re-emit tab-changed when clicking the already-active tab", async () => {
        const el = document.createElement("dreame-tab-selector") as DreameTabSelector;
        await mount(el); // default active is "room"
        const handler = vi.fn();
        el.addEventListener("tab-changed", handler);
        const tabs = Array.from(el.shadowRoot!.querySelectorAll<HTMLButtonElement>('button[role="tab"]'));
        tabs[0].click(); // already "room"
        expect(handler).not.toHaveBeenCalled();
    });

    it("updates aria-selected after a click without manual property set", async () => {
        const el = document.createElement("dreame-tab-selector") as DreameTabSelector;
        await mount(el);
        const tabs = () => Array.from(el.shadowRoot!.querySelectorAll<HTMLButtonElement>('button[role="tab"]'));
        tabs()[2].click(); // "zone"
        await el.updateComplete;
        expect(tabs().map((t) => t.getAttribute("aria-selected"))).toEqual(["false", "false", "true"]);
    });

    it("renders localized tab labels", async () => {
        const el = document.createElement("dreame-tab-selector") as DreameTabSelector;
        el.language = "en";
        await mount(el);
        const text = el.shadowRoot!.textContent ?? "";
        expect(text).toContain("Room");
        expect(text).toContain("All");
        expect(text).toContain("Zone");
    });
});

// ===========================================================================
// dreame-cleaning-mode-chip
// ===========================================================================

describe("dreame-cleaning-mode-chip", () => {
    const SELECT_ID = "select.robot_cleaning_mode";
    const VACUUM_ID = "vacuum.robot";

    function chipHass(overrides: Partial<HomeAssistantFixed> = {}, options = ["sweeping", "mopping"], current = "sweeping") {
        return makeHass({
            states: {
                [VACUUM_ID]: { state: "docked", attributes: {} } as never,
                [SELECT_ID]: {
                    entity_id: SELECT_ID,
                    state: current,
                    attributes: { options },
                } as never,
            },
            entities: {
                [VACUUM_ID]: { device_id: "dev1" },
                [SELECT_ID]: { device_id: "dev1" },
            } as never,
            ...overrides,
        });
    }

    it("is registered as a custom element", () => {
        expect(customElements.get("dreame-cleaning-mode-chip")).toBe(CleaningModeChip);
    });

    it("renders nothing without hass or entityId", async () => {
        const el = document.createElement("dreame-cleaning-mode-chip") as CleaningModeChip;
        await mount(el);
        expect(el.shadowRoot?.querySelector(".mode-chip")).toBeNull();
    });

    it("renders nothing when no matching select.*cleaning_mode entity exists on the device", async () => {
        const el = document.createElement("dreame-cleaning-mode-chip") as CleaningModeChip;
        el.hass = makeHass({
            states: { [VACUUM_ID]: { state: "docked", attributes: {} } as never },
            entities: { [VACUUM_ID]: { device_id: "dev1" } } as never,
        });
        el.entityId = VACUUM_ID;
        await mount(el);
        expect(el.shadowRoot?.querySelector(".mode-chip")).toBeNull();
    });

    it("renders an accessible role=button chip with tabindex=0 and aria-label", async () => {
        const el = document.createElement("dreame-cleaning-mode-chip") as CleaningModeChip;
        el.hass = chipHass();
        el.entityId = VACUUM_ID;
        await mount(el);
        const chip = el.shadowRoot!.querySelector(".mode-chip")!;
        expect(chip.getAttribute("role")).toBe("button");
        expect(chip.getAttribute("tabindex")).toBe("0");
        // The "Cleaning mode" label comes from the static localize() (en.json),
        // while the mode value comes from hass.localize (mocked to "") which makes
        // computeStateDisplay fall through to the raw select state ("sweeping").
        expect(chip.getAttribute("aria-label")).toBe("Cleaning mode: sweeping");
    });

    it("renders one icon for a sweep-only mode", async () => {
        const el = document.createElement("dreame-cleaning-mode-chip") as CleaningModeChip;
        el.hass = chipHass({}, ["sweeping", "mopping"], "sweeping");
        el.entityId = VACUUM_ID;
        await mount(el);
        expect(el.shadowRoot!.querySelectorAll(".mode-icon")).toHaveLength(1);
    });

    it("renders two icons for a combined sweep+mop mode", async () => {
        const el = document.createElement("dreame-cleaning-mode-chip") as CleaningModeChip;
        el.hass = chipHass({}, ["sweeping and mopping"], "sweeping and mopping");
        el.entityId = VACUUM_ID;
        await mount(el);
        expect(el.shadowRoot!.querySelectorAll(".mode-icon")).toHaveLength(2);
    });

    it("clicking the chip cycles to the next option via select.select_option", async () => {
        const callService = vi.fn();
        const el = document.createElement("dreame-cleaning-mode-chip") as CleaningModeChip;
        el.hass = chipHass({ callService }, ["sweeping", "mopping", "sweeping and mopping"], "sweeping");
        el.entityId = VACUUM_ID;
        await mount(el);
        (el.shadowRoot!.querySelector(".mode-chip") as HTMLElement).click();
        expect(callService).toHaveBeenCalledWith(
            "select",
            "select_option",
            { option: "mopping" },
            { entity_id: SELECT_ID }
        );
    });

    it("wraps around to the first option when on the last", async () => {
        const callService = vi.fn();
        const el = document.createElement("dreame-cleaning-mode-chip") as CleaningModeChip;
        el.hass = chipHass({ callService }, ["sweeping", "mopping"], "mopping");
        el.entityId = VACUUM_ID;
        await mount(el);
        (el.shadowRoot!.querySelector(".mode-chip") as HTMLElement).click();
        expect(callService).toHaveBeenCalledWith(
            "select",
            "select_option",
            { option: "sweeping" },
            { entity_id: SELECT_ID }
        );
    });

    it("pressing Enter triggers the same cycle as click", async () => {
        const callService = vi.fn();
        const el = document.createElement("dreame-cleaning-mode-chip") as CleaningModeChip;
        el.hass = chipHass({ callService }, ["sweeping", "mopping"], "sweeping");
        el.entityId = VACUUM_ID;
        await mount(el);
        const chip = el.shadowRoot!.querySelector(".mode-chip") as HTMLElement;
        chip.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
        expect(callService).toHaveBeenCalledWith(
            "select",
            "select_option",
            { option: "mopping" },
            { entity_id: SELECT_ID }
        );
    });

    it("pressing Space triggers the cycle", async () => {
        const callService = vi.fn();
        const el = document.createElement("dreame-cleaning-mode-chip") as CleaningModeChip;
        el.hass = chipHass({ callService }, ["sweeping", "mopping"], "sweeping");
        el.entityId = VACUUM_ID;
        await mount(el);
        const chip = el.shadowRoot!.querySelector(".mode-chip") as HTMLElement;
        chip.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true }));
        expect(callService).toHaveBeenCalledTimes(1);
    });

    it("ignores other keys (e.g. Tab)", async () => {
        const callService = vi.fn();
        const el = document.createElement("dreame-cleaning-mode-chip") as CleaningModeChip;
        el.hass = chipHass({ callService }, ["sweeping", "mopping"], "sweeping");
        el.entityId = VACUUM_ID;
        await mount(el);
        const chip = el.shadowRoot!.querySelector(".mode-chip") as HTMLElement;
        chip.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true }));
        expect(callService).not.toHaveBeenCalled();
    });

    it("does not call the service when the select has no options", async () => {
        const callService = vi.fn();
        const el = document.createElement("dreame-cleaning-mode-chip") as CleaningModeChip;
        // Render requires the chip to exist, so give options for render but test the click path
        // with an empty options array applied just before clicking.
        el.hass = makeHass({
            states: {
                [VACUUM_ID]: { state: "docked", attributes: {} } as never,
                [SELECT_ID]: { entity_id: SELECT_ID, state: "sweeping", attributes: { options: [] } } as never,
            },
            entities: {
                [VACUUM_ID]: { device_id: "dev1" },
                [SELECT_ID]: { device_id: "dev1" },
            } as never,
            callService,
        });
        el.entityId = VACUUM_ID;
        await mount(el);
        const chip = el.shadowRoot!.querySelector(".mode-chip") as HTMLElement;
        chip.click();
        expect(callService).not.toHaveBeenCalled();
    });
});

// ===========================================================================
// dreame-robot-animation
// ===========================================================================

describe("dreame-robot-animation", () => {
    // NOTE: `document.createElement("dreame-robot-animation")` does not reliably
    // run the class constructor / field initializers under happy-dom for this
    // component (its logic lives in the `updated()` lifecycle, unlike the other
    // components which are pure-render). Constructing via `new RobotAnimation()`
    // upgrades it correctly. This is a test-environment quirk, not a src bug.
    function makeAnim(): RobotAnimation {
        return new RobotAnimation();
    }

    // The markup (#lottie-container / .zzz-container) depends on `_currentState`,
    // which is only mutated inside `updated()` AFTER render. Since `updated()`
    // never calls requestUpdate(), the markup is always ONE render behind the
    // state. Forcing a second render (via a benign prop bump) lets the markup
    // catch up to the current state. See `notes` for the underlying bug.
    async function flushMarkup(el: RobotAnimation): Promise<void> {
        el.chargerX = el.chargerX + 0.0001;
        await el.updateComplete;
    }

    it("is registered as a custom element", () => {
        expect(customElements.get("dreame-robot-animation")).toBe(RobotAnimation);
    });

    it("renders the wrapper, no animation, for an empty state", async () => {
        const el = await mount(makeAnim());
        // With the default empty robotState, updated() early-returns because the
        // target ("") already equals the initial _currentState (""), so opacity is
        // never assigned and stays the CSS default ("" inline -> 0 via stylesheet).
        expect(el.style.opacity).toBe("");
        await flushMarkup(el);
        expect(el.shadowRoot!.querySelector("#lottie-wrapper")).not.toBeNull();
        expect(el.shadowRoot!.querySelector("#lottie-container")).toBeNull();
        expect(el.shadowRoot!.querySelector(".zzz-container")).toBeNull();
    });

    it.each(["charging", "charging_completed", "idle"])(
        "maps sleeping state %s to opacity 1 and ZZZ markup",
        async (state) => {
            const el = makeAnim();
            el.robotState = state;
            await mount(el);
            // Reliable, set in updated():
            expect(el.style.opacity).toBe("1");
            // Markup lags one render; force it to catch up.
            await flushMarkup(el);
            expect(el.shadowRoot!.querySelector(".zzz-container")).not.toBeNull();
            expect(el.shadowRoot!.querySelector("#lottie-container")).toBeNull();
            expect(el.shadowRoot!.querySelectorAll(".zzz-container .z")).toHaveLength(3);
        }
    );

    it.each([
        "drying",
        "dust_bag_drying",
        "dust_bag_drying_paused",
        "sanitizing_with_dry",
        "washing",
        "washing_paused",
        "clean_add_water",
        "station_cleaning",
        "sanitizing",
        "initial_deep_cleaning",
        "initial_deep_cleaning_paused",
        "auto_emptying",
        "emptying",
    ])("maps animated state %s to opacity 1 and a lottie container", async (state) => {
        const el = makeAnim();
        el.robotState = state;
        await mount(el);
        expect(el.style.opacity).toBe("1");
        await flushMarkup(el);
        expect(el.shadowRoot!.querySelector("#lottie-container")).not.toBeNull();
        expect(el.shadowRoot!.querySelector(".zzz-container")).toBeNull();
    });

    it("is case-insensitive for the robot state", async () => {
        const el = makeAnim();
        el.robotState = "DRYING";
        await mount(el);
        expect(el.style.opacity).toBe("1");
        await flushMarkup(el);
        expect(el.shadowRoot!.querySelector("#lottie-container")).not.toBeNull();
    });

    it("hides (opacity 0) for an unmapped non-sleep state", async () => {
        const el = makeAnim();
        el.robotState = "cleaning";
        await mount(el);
        expect(el.style.opacity).toBe("0");
        await flushMarkup(el);
        expect(el.shadowRoot!.querySelector("#lottie-container")).toBeNull();
        expect(el.shadowRoot!.querySelector(".zzz-container")).toBeNull();
    });

    it("uses the centered wrapper class without charger coordinates", async () => {
        const el = makeAnim();
        el.robotState = "idle";
        await mount(el);
        const wrapper = el.shadowRoot!.querySelector("#lottie-wrapper")!;
        expect(wrapper.classList.contains("centered")).toBe(true);
        expect(wrapper.classList.contains("positioned")).toBe(false);
    });

    it("uses the positioned wrapper with inline left/top when charger coords are set", async () => {
        const el = makeAnim();
        el.robotState = "idle";
        el.chargerX = 30;
        el.chargerY = 70;
        await mount(el);
        const wrapper = el.shadowRoot!.querySelector("#lottie-wrapper") as HTMLElement;
        expect(wrapper.classList.contains("positioned")).toBe(true);
        expect(wrapper.style.left).toBe("30%");
        expect(wrapper.style.top).toBe("70%");
    });

    it("negative charger coords fall back to the centered wrapper", async () => {
        const el = makeAnim();
        el.robotState = "idle";
        el.chargerX = -1;
        el.chargerY = -1;
        await mount(el);
        const wrapper = el.shadowRoot!.querySelector("#lottie-wrapper")!;
        expect(wrapper.classList.contains("centered")).toBe(true);
    });

    it("updates opacity when transitioning from animated to an unmapped state", async () => {
        const el = makeAnim();
        el.robotState = "washing";
        await mount(el);
        expect(el.style.opacity).toBe("1");

        el.robotState = "cleaning"; // unmapped, non-sleep
        await el.updateComplete;
        // opacity reflects the new state immediately.
        expect(el.style.opacity).toBe("0");
    });

    it("updates opacity and markup when transitioning ZZZ -> lottie", async () => {
        const el = makeAnim();
        el.robotState = "idle";
        await mount(el);
        await flushMarkup(el);
        expect(el.shadowRoot!.querySelector(".zzz-container")).not.toBeNull();

        el.robotState = "drying";
        await el.updateComplete;
        expect(el.style.opacity).toBe("1");
        await flushMarkup(el);
        expect(el.shadowRoot!.querySelector(".zzz-container")).toBeNull();
        expect(el.shadowRoot!.querySelector("#lottie-container")).not.toBeNull();
    });
});
