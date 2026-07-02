import { describe, it, expect, beforeEach, vi } from "vitest";

// Importing the module registers the custom element as a side effect.
import { DreameTabSelector } from "../src/components/tab-selector";

/** Appends the element to the body and waits for the first Lit render. */
async function mount<T extends HTMLElement & { updateComplete: Promise<unknown> }>(el: T): Promise<T> {
    document.body.appendChild(el);
    await el.updateComplete;
    return el;
}

// NOTE : `document.createElement("dreame-tab-selector")` n'upgrade pas toujours de façon
// fiable l'élément sous happy-dom quand c'est le tout premier test asynchrone du fichier
// (shadowRoot reste `null` après `updateComplete`, cf. le même contournement documenté
// pour RobotAnimation dans components-extra.test.ts). `new DreameTabSelector()` construit
// l'instance directement et évite cette course.
function makeSelector(): DreameTabSelector {
    return new DreameTabSelector();
}

function tablist(el: DreameTabSelector): HTMLElement {
    return el.shadowRoot!.querySelector('[role="tablist"]') as HTMLElement;
}

function tabs(el: DreameTabSelector): HTMLButtonElement[] {
    return Array.from(el.shadowRoot!.querySelectorAll<HTMLButtonElement>('button[role="tab"]'));
}

/** Dispatches a keydown on the tablist and returns the event (to check defaultPrevented). */
function pressKey(el: DreameTabSelector, key: string): KeyboardEvent {
    const ev = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true });
    tablist(el).dispatchEvent(ev);
    return ev;
}

beforeEach(() => {
    document.body.innerHTML = "";
    try {
        localStorage.setItem("selectedLanguage", '"en"');
    } catch {
        /* ignore */
    }
});

describe("dreame-tab-selector keyboard navigation", () => {
    // Ordre des onglets : room, all, zone.

    it("ArrowRight moves from 'all' to 'zone' and fires tab-changed", async () => {
        const el = makeSelector();
        el.activeTab = "all";
        await mount(el);
        const handler = vi.fn();
        el.addEventListener("tab-changed", handler);
        pressKey(el, "ArrowRight");
        expect(el.activeTab).toBe("zone");
        expect(handler).toHaveBeenCalledTimes(1);
        expect((handler.mock.calls[0][0] as CustomEvent).detail).toEqual({ tab: "zone" });
    });

    it("ArrowRight wraps from 'zone' to 'room'", async () => {
        const el = makeSelector();
        el.activeTab = "zone";
        await mount(el);
        pressKey(el, "ArrowRight");
        expect(el.activeTab).toBe("room");
    });

    it("ArrowLeft wraps from 'room' to 'zone'", async () => {
        const el = makeSelector();
        el.activeTab = "room";
        await mount(el);
        pressKey(el, "ArrowLeft");
        expect(el.activeTab).toBe("zone");
    });

    it("ArrowLeft moves from 'zone' to 'all'", async () => {
        const el = makeSelector();
        el.activeTab = "zone";
        await mount(el);
        pressKey(el, "ArrowLeft");
        expect(el.activeTab).toBe("all");
    });

    it("Home selects 'room' regardless of the current tab", async () => {
        const el = makeSelector();
        el.activeTab = "zone";
        await mount(el);
        pressKey(el, "Home");
        expect(el.activeTab).toBe("room");
    });

    it("End selects 'zone' regardless of the current tab", async () => {
        const el = makeSelector();
        el.activeTab = "room";
        await mount(el);
        pressKey(el, "End");
        expect(el.activeTab).toBe("zone");
    });

    it("preventDefault is called for handled keys", async () => {
        const el = makeSelector();
        await mount(el);
        const ev = pressKey(el, "ArrowRight");
        expect(ev.defaultPrevented).toBe(true);
    });

    it("an unhandled key changes nothing and does not preventDefault", async () => {
        const el = makeSelector();
        el.activeTab = "room";
        await mount(el);
        const handler = vi.fn();
        el.addEventListener("tab-changed", handler);
        const ev = pressKey(el, "a");
        expect(el.activeTab).toBe("room");
        expect(handler).not.toHaveBeenCalled();
        expect(ev.defaultPrevented).toBe(false);
    });

    it("roving tabindex: only the active tab has tabindex 0, others -1", async () => {
        const el = makeSelector();
        el.activeTab = "all";
        await mount(el);
        expect(tabs(el).map((t) => t.getAttribute("tabindex"))).toEqual(["-1", "0", "-1"]);
    });

    it("roving tabindex updates after keyboard navigation", async () => {
        const el = makeSelector();
        el.activeTab = "room";
        await mount(el);
        pressKey(el, "ArrowRight");
        await el.updateComplete;
        expect(tabs(el).map((t) => t.getAttribute("tabindex"))).toEqual(["-1", "0", "-1"]);
    });

    it("aria-selected follows the active tab after keyboard navigation", async () => {
        const el = makeSelector();
        el.activeTab = "room";
        await mount(el);
        pressKey(el, "End");
        await el.updateComplete;
        expect(tabs(el).map((t) => t.getAttribute("aria-selected"))).toEqual(["false", "false", "true"]);
    });
});
