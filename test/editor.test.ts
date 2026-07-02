import { describe, it, expect, beforeEach, vi } from "vitest";
import type { HomeAssistantFixed } from "../src/types/fixes";
import type { XiaomiVacuumMapCardConfig } from "../src/types/types";

// Importing the module registers the custom element as a side effect.
import { XiaomiVacuumMapCardEditor } from "../src/editor";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeHass(overrides: Partial<HomeAssistantFixed> = {}): HomeAssistantFixed {
    return {
        states: {},
        entities: {},
        locale: { language: "en" },
        localize: () => "",
        ...overrides,
    } as unknown as HomeAssistantFixed;
}

/** Appends the element to the body and waits for the first Lit render. */
async function mount<T extends HTMLElement & { updateComplete: Promise<unknown> }>(el: T): Promise<T> {
    document.body.appendChild(el);
    await el.updateComplete;
    return el;
}

function makeEditor(): XiaomiVacuumMapCardEditor {
    return document.createElement("dreame-vacuum-card-editor") as XiaomiVacuumMapCardEditor;
}

function haForm(el: XiaomiVacuumMapCardEditor): HTMLElement {
    return el.shadowRoot!.querySelector("ha-form") as HTMLElement;
}

/** Config minimale valide, telle que produite par le wizard / setConfig. */
function baseConfig(overrides: Partial<XiaomiVacuumMapCardConfig> = {}): XiaomiVacuumMapCardConfig {
    return {
        type: "custom:dreame-vacuum-card",
        entity: "vacuum.robot",
        map_source: { camera: "camera.robot" },
        ...overrides,
    } as XiaomiVacuumMapCardConfig;
}

beforeEach(() => {
    document.body.innerHTML = "";
});

// ===========================================================================
// dreame-vacuum-card-editor
// ===========================================================================

describe("dreame-vacuum-card-editor", () => {
    it("is registered as a custom element", () => {
        expect(customElements.get("dreame-vacuum-card-editor")).toBe(XiaomiVacuumMapCardEditor);
    });

    it("setConfig stores the config", () => {
        const el = makeEditor();
        const config = baseConfig();
        el.setConfig(config);
        // _config est privé côté typage seulement ; on vérifie l'effet observable via render.
        expect((el as unknown as { _config?: unknown })._config).toBe(config);
    });

    it("renders nothing without hass (config set)", async () => {
        const el = makeEditor();
        el.setConfig(baseConfig());
        await mount(el);
        expect(el.shadowRoot?.querySelector("ha-form")).toBeNull();
    });

    it("renders nothing without config (hass set)", async () => {
        const el = makeEditor();
        el.hass = makeHass();
        await mount(el);
        expect(el.shadowRoot?.querySelector("ha-form")).toBeNull();
    });

    it("renders ha-form and the yaml hint once hass and config are both set", async () => {
        const el = makeEditor();
        el.hass = makeHass();
        el.setConfig(baseConfig());
        await mount(el);
        expect(el.shadowRoot?.querySelector("ha-form")).not.toBeNull();
        expect(el.shadowRoot?.querySelector(".yaml-hint")).not.toBeNull();
    });

    // -- data aplati passé à ha-form -----------------------------------------

    describe("data flattening for ha-form", () => {
        it("flattens entity, map_source, display and map_behavior with defaults", async () => {
            const el = makeEditor();
            el.hass = makeHass();
            el.setConfig(baseConfig());
            await mount(el);
            const data = (haForm(el) as unknown as { data: Record<string, unknown> }).data;
            expect(data.entity).toBe("vacuum.robot");
            expect(data.map_source).toEqual({ camera: "camera.robot" });
            expect(data.display).toEqual({
                show_title: false,
                appearance: "premium",
                language: "",
            });
            expect(data.map_behavior).toEqual({
                map_locked: false,
                two_finger_pan: false,
                clean_selection_on_start: true,
                robot_overlay: false,
            });
        });

        it("defaults display.appearance to 'premium' when absent from config", async () => {
            const el = makeEditor();
            el.hass = makeHass();
            el.setConfig(baseConfig());
            await mount(el);
            const data = (haForm(el) as unknown as { data: { display: { appearance: string } } }).data;
            expect(data.display.appearance).toBe("premium");
        });

        it("reflects display.appearance 'minimal' when set in config", async () => {
            const el = makeEditor();
            el.hass = makeHass();
            el.setConfig(baseConfig({ appearance: "minimal" }));
            await mount(el);
            const data = (haForm(el) as unknown as { data: { display: { appearance: string } } }).data;
            expect(data.display.appearance).toBe("minimal");
        });

        it("reflects display.language when set", async () => {
            const el = makeEditor();
            el.hass = makeHass();
            el.setConfig(baseConfig({ language: "fr" }));
            await mount(el);
            const data = (haForm(el) as unknown as { data: { display: { language: string } } }).data;
            expect(data.display.language).toBe("fr");
        });

        it("reflects map_behavior.* values set in config", async () => {
            const el = makeEditor();
            el.hass = makeHass();
            el.setConfig(
                baseConfig({
                    map_locked: true,
                    two_finger_pan: true,
                    clean_selection_on_start: false,
                    robot_overlay: true,
                })
            );
            await mount(el);
            const data = (
                haForm(el) as unknown as {
                    data: {
                        map_behavior: {
                            map_locked: boolean;
                            two_finger_pan: boolean;
                            clean_selection_on_start: boolean;
                            robot_overlay: boolean;
                        };
                    };
                }
            ).data;
            expect(data.map_behavior).toEqual({
                map_locked: true,
                two_finger_pan: true,
                clean_selection_on_start: false,
                robot_overlay: true,
            });
        });
    });

    // -- _valueChanged --------------------------------------------------------

    describe("_valueChanged", () => {
        function emitValueChanged(el: XiaomiVacuumMapCardEditor, value: Record<string, unknown>): void {
            haForm(el).dispatchEvent(new CustomEvent("value-changed", { detail: { value } }));
        }

        it("maps display.appearance 'minimal' to config.appearance === 'minimal'", async () => {
            const el = makeEditor();
            el.hass = makeHass();
            el.setConfig(baseConfig());
            await mount(el);
            const handler = vi.fn();
            el.addEventListener("config-changed", handler);
            emitValueChanged(el, {
                entity: "vacuum.robot",
                map_source: { camera: "camera.robot" },
                display: { show_title: false, appearance: "minimal", language: "" },
                map_behavior: {},
            });
            const ev = handler.mock.calls[0][0] as CustomEvent;
            expect(ev.detail.config.appearance).toBe("minimal");
        });

        it("maps display.appearance 'premium' to config.appearance === undefined (only stores the deviation)", async () => {
            const el = makeEditor();
            el.hass = makeHass();
            el.setConfig(baseConfig());
            await mount(el);
            const handler = vi.fn();
            el.addEventListener("config-changed", handler);
            emitValueChanged(el, {
                entity: "vacuum.robot",
                map_source: { camera: "camera.robot" },
                display: { show_title: false, appearance: "premium", language: "" },
                map_behavior: {},
            });
            const ev = handler.mock.calls[0][0] as CustomEvent;
            expect(ev.detail.config.appearance).toBeUndefined();
            expect("appearance" in ev.detail.config).toBe(true);
        });

        it("maps an empty language string to undefined", async () => {
            const el = makeEditor();
            el.hass = makeHass();
            el.setConfig(baseConfig({ language: "fr" }));
            await mount(el);
            const handler = vi.fn();
            el.addEventListener("config-changed", handler);
            emitValueChanged(el, {
                entity: "vacuum.robot",
                map_source: { camera: "camera.robot" },
                display: { show_title: false, appearance: "premium", language: "" },
                map_behavior: {},
            });
            const ev = handler.mock.calls[0][0] as CustomEvent;
            expect(ev.detail.config.language).toBeUndefined();
        });

        it("preserves keys not managed by the editor (grid_options, vacuum_platform...)", async () => {
            const el = makeEditor();
            el.hass = makeHass();
            el.setConfig(
                baseConfig({
                    grid_options: { columns: 6 },
                    vacuum_platform: "Dreame",
                } as never)
            );
            await mount(el);
            const handler = vi.fn();
            el.addEventListener("config-changed", handler);
            emitValueChanged(el, {
                entity: "vacuum.robot",
                map_source: { camera: "camera.robot" },
                display: { show_title: false, appearance: "premium", language: "" },
                map_behavior: {},
            });
            const ev = handler.mock.calls[0][0] as CustomEvent;
            expect(ev.detail.config.grid_options).toEqual({ columns: 6 });
            expect(ev.detail.config.vacuum_platform).toBe("Dreame");
        });

        it("auto-attaches calibration_source: {camera: true} when the new camera exposes calibration_points and none is set", async () => {
            const el = makeEditor();
            el.hass = makeHass({
                states: {
                    "camera.new": {
                        entity_id: "camera.new",
                        state: "idle",
                        attributes: { calibration_points: [{}, {}, {}] },
                    } as never,
                },
            });
            el.setConfig(baseConfig());
            await mount(el);
            const handler = vi.fn();
            el.addEventListener("config-changed", handler);
            emitValueChanged(el, {
                entity: "vacuum.robot",
                map_source: { camera: "camera.new" },
                display: { show_title: false, appearance: "premium", language: "" },
                map_behavior: {},
            });
            const ev = handler.mock.calls[0][0] as CustomEvent;
            expect(ev.detail.config.calibration_source).toEqual({ camera: true });
        });

        it("does not overwrite an existing calibration_source", async () => {
            const el = makeEditor();
            el.hass = makeHass({
                states: {
                    "camera.new": {
                        entity_id: "camera.new",
                        state: "idle",
                        attributes: { calibration_points: [{}, {}, {}] },
                    } as never,
                },
            });
            el.setConfig(baseConfig({ calibration_source: { identity: true } }));
            await mount(el);
            const handler = vi.fn();
            el.addEventListener("config-changed", handler);
            emitValueChanged(el, {
                entity: "vacuum.robot",
                map_source: { camera: "camera.new" },
                display: { show_title: false, appearance: "premium", language: "" },
                map_behavior: {},
            });
            const ev = handler.mock.calls[0][0] as CustomEvent;
            expect(ev.detail.config.calibration_source).toEqual({ identity: true });
        });

        it("does not attach calibration_source when the new camera has no calibration_points", async () => {
            const el = makeEditor();
            el.hass = makeHass({
                states: {
                    "camera.plain": { entity_id: "camera.plain", state: "idle", attributes: {} } as never,
                },
            });
            el.setConfig(baseConfig());
            await mount(el);
            const handler = vi.fn();
            el.addEventListener("config-changed", handler);
            emitValueChanged(el, {
                entity: "vacuum.robot",
                map_source: { camera: "camera.plain" },
                display: { show_title: false, appearance: "premium", language: "" },
                map_behavior: {},
            });
            const ev = handler.mock.calls[0][0] as CustomEvent;
            expect(ev.detail.config.calibration_source).toBeUndefined();
        });

        it("fires config-changed with bubbles: true and composed: true", async () => {
            const el = makeEditor();
            el.hass = makeHass();
            el.setConfig(baseConfig());
            await mount(el);
            const handler = vi.fn();
            el.addEventListener("config-changed", handler);
            emitValueChanged(el, {
                entity: "vacuum.robot",
                map_source: { camera: "camera.robot" },
                display: { show_title: false, appearance: "premium", language: "" },
                map_behavior: {},
            });
            const ev = handler.mock.calls[0][0] as CustomEvent;
            expect(ev.bubbles).toBe(true);
            expect(ev.composed).toBe(true);
        });

        it("does nothing when there is no config yet", async () => {
            const el = makeEditor();
            el.hass = makeHass();
            await mount(el);
            const handler = vi.fn();
            el.addEventListener("config-changed", handler);
            // Pas de ha-form dans le DOM (pas de config) : on invoque directement le
            // handler privé pour couvrir le early-return `if (!this._config) return;`.
            (el as unknown as { _valueChanged: (ev: CustomEvent) => void })._valueChanged(
                new CustomEvent("value-changed", { detail: { value: {} } })
            );
            expect(handler).not.toHaveBeenCalled();
        });
    });

    // -- buildSchema ------------------------------------------------------

    describe("schema", () => {
        it("the display section exposes an appearance select with premium and minimal options", async () => {
            const el = makeEditor();
            el.hass = makeHass();
            el.setConfig(baseConfig());
            await mount(el);
            const schema = (
                haForm(el) as unknown as {
                    schema: Array<{ name: string; schema?: Array<{ name: string; selector?: Record<string, unknown> }> }>;
                }
            ).schema;
            const display = schema.find((s) => s.name === "display");
            expect(display).toBeDefined();
            const appearance = display!.schema!.find((s) => s.name === "appearance");
            expect(appearance).toBeDefined();
            const options = (
                appearance!.selector as { select: { options: Array<{ value: string }> } }
            ).select.options.map((o) => o.value);
            expect(options).toEqual(["premium", "minimal"]);
        });
    });

    it("computeLabel resolves an editor.label.<name> translation", async () => {
        const el = makeEditor();
        el.hass = makeHass();
        el.setConfig(baseConfig());
        await mount(el);
        const computeLabel = (haForm(el) as unknown as { computeLabel: (s: { name: string }) => string })
            .computeLabel;
        expect(computeLabel({ name: "show_title" })).toBe("Show title");
    });
});
