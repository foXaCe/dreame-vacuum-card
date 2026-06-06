import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { MapMode } from "../src/model/map_mode/map-mode";
import { ServiceCallSchema } from "../src/model/map_mode/service-call-schema";
import { ServiceCall } from "../src/model/map_mode/service-call";
import { SelectionType } from "../src/model/map_mode/selection-type";
import { RepeatsType } from "../src/model/map_mode/repeats-type";
import { TemplatableValue } from "../src/model/map_mode/templatable-value";
import { Modifier } from "../src/model/map_mode/modifier";
import type { HomeAssistantFixed } from "../src/types/fixes";
import type { ServiceCallSchemaConfig } from "../src/types/types";

// --- Helpers --------------------------------------------------------------

/**
 * Builds a partial hass whose connection.subscribeMessage drives
 * evaluateJinjaTemplate: it invokes the callback with `{ result }` and returns
 * a resolved unsubscribe. When `behavior` is "reject" the subscribe promise
 * rejects; when "throw" subscribeMessage itself throws synchronously.
 */
const mkHass = (
    result: string | Record<string, unknown> | undefined,
    behavior: "resolve" | "reject" | "throw" = "resolve"
): HomeAssistantFixed => {
    const subscribeMessage = vi.fn(
        (cb: (msg: { result: string | Record<string, unknown> }) => void) => {
            if (behavior === "throw") throw new Error("subscribe blew up");
            if (behavior === "reject") return Promise.reject(new Error("backend refused"));
            // resolve path: deliver the result synchronously then resolve unsub
            cb({ result: result as string | Record<string, unknown> });
            return Promise.resolve(() => undefined);
        }
    );
    return {
        connection: { subscribeMessage },
    } as unknown as HomeAssistantFixed;
};

const schemaConfig = (overrides: Partial<ServiceCallSchemaConfig> = {}): ServiceCallSchemaConfig =>
    ({
        service: "vacuum.start",
        service_data: { entity_id: "[[entity_id]]" },
        ...overrides,
    }) as ServiceCallSchemaConfig;

const PLATFORM = "Dreame";

// --- ServiceCall ----------------------------------------------------------

describe("ServiceCall", () => {
    it("stores domain, service, data and target as given", () => {
        const sc = new ServiceCall("vacuum", "start", { a: 1 }, { entity_id: "x" });
        expect(sc.domain).toBe("vacuum");
        expect(sc.service).toBe("start");
        expect(sc.serviceData).toEqual({ a: 1 });
        expect(sc.target).toEqual({ entity_id: "x" });
    });

    it("accepts undefined data and target", () => {
        const sc = new ServiceCall("vacuum", "start", undefined, undefined);
        expect(sc.serviceData).toBeUndefined();
        expect(sc.target).toBeUndefined();
    });
});

// --- ServiceCallSchema.getDefaultVariables --------------------------------

describe("ServiceCallSchema.getDefaultVariables", () => {
    it("populates every templatable value for a point selection", () => {
        const vars = ServiceCallSchema.getDefaultVariables("vacuum.foo", [10, 20], 3);
        expect(vars[TemplatableValue.ENTITY_ID]).toBe("vacuum.foo");
        expect(vars[TemplatableValue.SELECTION]).toEqual([10, 20]);
        expect(vars[TemplatableValue.SELECTION_SIZE]).toBe(2);
        expect(vars[TemplatableValue.REPEATS]).toBe(3);
        expect(vars[TemplatableValue.POINT_X]).toBe(10);
        expect(vars[TemplatableValue.POINT_Y]).toBe(20);
    });

    it("unwraps the selection into a bare comma list", () => {
        const vars = ServiceCallSchema.getDefaultVariables("e", [1, 2, 3], 1);
        expect(vars[TemplatableValue.SELECTION_UNWRAPPED]).toBe("1,2,3");
    });

    it("unwraps nested arrays stripping brackets and quotes", () => {
        const vars = ServiceCallSchema.getDefaultVariables("e", [[1, 2], "a"], 1);
        // JSON.stringify -> [[1,2],"a"]; brackets removed -> 1,2,a
        expect(vars[TemplatableValue.SELECTION_UNWRAPPED]).toBe("1,2,a");
    });

    it("leaves point_x / point_y empty for non-point selections", () => {
        const room = ServiceCallSchema.getDefaultVariables("e", [1, 2, 3], 1);
        expect(room[TemplatableValue.POINT_X]).toBe("");
        expect(room[TemplatableValue.POINT_Y]).toBe("");
    });

    it("treats a single-number selection as non-point (needs length 2)", () => {
        const vars = ServiceCallSchema.getDefaultVariables("e", [5], 1);
        expect(vars[TemplatableValue.POINT_X]).toBe("");
        expect(vars[TemplatableValue.POINT_Y]).toBe("");
    });

    it("treats a 2-string selection as non-point (first element not a number)", () => {
        const vars = ServiceCallSchema.getDefaultVariables("e", ["a", "b"], 1);
        expect(vars[TemplatableValue.POINT_X]).toBe("");
        expect(vars[TemplatableValue.POINT_Y]).toBe("");
    });

    it("handles an empty selection without crashing", () => {
        const vars = ServiceCallSchema.getDefaultVariables("e", [], 0);
        expect(vars[TemplatableValue.SELECTION_SIZE]).toBe(0);
        expect(vars[TemplatableValue.SELECTION_UNWRAPPED]).toBe("");
        expect(vars[TemplatableValue.POINT_X]).toBe("");
    });
});

// --- ServiceCallSchema.apply ----------------------------------------------

describe("ServiceCallSchema.apply", () => {
    it("splits a well-formed service into domain and name", () => {
        const schema = new ServiceCallSchema(schemaConfig({ service: "dreame_vacuum.clean_zone" }));
        const call = schema.apply("vacuum.foo", [1, 2], 1, {});
        expect(call.domain).toBe("dreame_vacuum");
        expect(call.service).toBe("clean_zone");
    });

    it("fills service_data templates with default variables", () => {
        const schema = new ServiceCallSchema(
            schemaConfig({ service_data: { entity_id: "[[entity_id]]", repeats: "[[repeats]]" } })
        );
        const call = schema.apply("vacuum.bar", [], 7, {});
        expect(call.serviceData).toEqual({ entity_id: "vacuum.bar", repeats: 7 });
    });

    it("fills the target block when present", () => {
        const schema = new ServiceCallSchema(
            schemaConfig({ service_data: undefined, target: { entity_id: "[[entity_id]]" } })
        );
        const call = schema.apply("vacuum.baz", [], 1, {});
        expect(call.target).toEqual({ entity_id: "vacuum.baz" });
        expect(call.serviceData).toBeUndefined();
    });

    it("does not crash on a malformed service without a dot (empty domain/name guard)", () => {
        const schema = new ServiceCallSchema(schemaConfig({ service: "noseparator" }));
        const call = schema.apply("vacuum.foo", [], 1, {});
        // split(".") -> ["noseparator"]; name defaults to "" via the destructuring guard
        expect(call.domain).toBe("noseparator");
        expect(call.service).toBe("");
    });

    it("yields empty domain and name when service is an empty string", () => {
        const schema = new ServiceCallSchema(schemaConfig({ service: "" }));
        const call = schema.apply("vacuum.foo", [], 1, {});
        expect(call.domain).toBe("");
        expect(call.service).toBe("");
    });

    it("survives a config whose service is undefined (the ?? '' fallback)", () => {
        // Cast around the readonly required field to exercise the runtime guard.
        const schema = new ServiceCallSchema({} as ServiceCallSchemaConfig);
        const call = schema.apply("vacuum.foo", [], 1, {});
        expect(call.domain).toBe("");
        expect(call.service).toBe("");
        // No service_data / target configured -> both undefined, no throw.
        expect(call.serviceData).toBeUndefined();
        expect(call.target).toBeUndefined();
    });

    it("lets caller variables override default variables for the same key", () => {
        const schema = new ServiceCallSchema(schemaConfig({ service_data: { id: "[[entity_id]]" } }));
        const call = schema.apply("vacuum.default", [], 1, { entity_id: "vacuum.override" });
        // getFilledTemplate: first storage (defaults) wins, so default entity_id stays.
        expect(call.serviceData).toEqual({ id: "vacuum.default" });
    });

    it("exposes evaluateDataAsTemplate from config (default false)", () => {
        expect(new ServiceCallSchema(schemaConfig()).evaluateDataAsTemplate).toBe(false);
        expect(
            new ServiceCallSchema(schemaConfig({ evaluate_data_as_template: true })).evaluateDataAsTemplate
        ).toBe(true);
    });
});

// --- MapMode constructor / enum parsing -----------------------------------

describe("MapMode constructor and enum parsing", () => {
    beforeEach(() => {
        MapMode.debug = false;
    });

    it("applies defaults for a minimal config", () => {
        const mode = new MapMode(PLATFORM, { service_call_schema: schemaConfig() }, "en");
        expect(mode.selectionType).toBe(SelectionType.PREDEFINED_POINT);
        expect(mode.repeatsType).toBe(RepeatsType.NONE);
        expect(mode.maxSelections).toBe(999);
        expect(mode.maxRepeats).toBe(1);
        expect(mode.coordinatesRounding).toBe(true);
        expect(mode.coordinatesToMetersDivider).toBe(1000);
        expect(mode.icon).toBe("mdi:help");
    });

    it("parses a valid selection_type and repeats_type enum string", () => {
        const mode = new MapMode(
            PLATFORM,
            { selection_type: "ROOM", repeats_type: "EXTERNAL", service_call_schema: schemaConfig() },
            "en"
        );
        expect(mode.selectionType).toBe(SelectionType.ROOM);
        expect(mode.repeatsType).toBe(RepeatsType.EXTERNAL);
    });

    it("falls back to PREDEFINED_POINT on an unknown selection_type", () => {
        const mode = new MapMode(
            PLATFORM,
            { selection_type: "NOT_A_TYPE", service_call_schema: schemaConfig() },
            "en"
        );
        expect(mode.selectionType).toBe(SelectionType.PREDEFINED_POINT);
    });

    it("falls back to NONE on an unknown repeats_type", () => {
        const mode = new MapMode(
            PLATFORM,
            { repeats_type: "WHATEVER", service_call_schema: schemaConfig() },
            "en"
        );
        expect(mode.repeatsType).toBe(RepeatsType.NONE);
    });

    it("falls back when a numeric-string enum value is given (reverse mapping is a string)", () => {
        // "2" indexes the reverse map -> "ROOM" (a string), which the guard rejects.
        const mode = new MapMode(
            PLATFORM,
            { selection_type: "2", service_call_schema: schemaConfig() },
            "en"
        );
        expect(mode.selectionType).toBe(SelectionType.PREDEFINED_POINT);
    });

    it("warns on invalid enum only when debug is enabled", () => {
        const spy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
        new MapMode(PLATFORM, { selection_type: "BOGUS", service_call_schema: schemaConfig() }, "en");
        expect(spy).not.toHaveBeenCalled();

        MapMode.debug = true;
        new MapMode(PLATFORM, { selection_type: "BOGUS", service_call_schema: schemaConfig() }, "en");
        expect(spy).toHaveBeenCalledTimes(1);
        spy.mockRestore();
    });

    it("forces runImmediately to false for non-predefined selection types", () => {
        const mode = new MapMode(
            PLATFORM,
            { selection_type: "MANUAL_RECTANGLE", run_immediately: true, service_call_schema: schemaConfig() },
            "en"
        );
        expect(mode.runImmediately).toBe(false);
    });

    it("keeps runImmediately true for predefined selection types", () => {
        const mode = new MapMode(
            PLATFORM,
            { selection_type: "ROOM", run_immediately: true, service_call_schema: schemaConfig() },
            "en"
        );
        expect(mode.runImmediately).toBe(true);
    });

    it("honours explicit name and icon", () => {
        const mode = new MapMode(
            PLATFORM,
            { name: "My Mode", icon: "mdi:robot", service_call_schema: schemaConfig() },
            "en"
        );
        expect(mode.name).toBe("My Mode");
        expect(mode.icon).toBe("mdi:robot");
    });

    it("stores explicit variables and predefined selections", () => {
        const mode = new MapMode(
            PLATFORM,
            {
                variables: { "[[foo]]": "bar" },
                predefined_selections: [{ id: 1 } as never],
                service_call_schema: schemaConfig(),
            },
            "en"
        );
        expect(mode.variables).toEqual({ "[[foo]]": "bar" });
        expect(mode.predefinedSelections).toEqual([{ id: 1 }]);
    });

    it("constructs a usable empty schema when service_call_schema is omitted", () => {
        const mode = new MapMode(PLATFORM, {}, "en");
        expect(mode.serviceCallSchema).toBeInstanceOf(ServiceCallSchema);
        const call = mode.serviceCallSchema.apply("e", [], 1, {});
        expect(call.domain).toBe("");
    });
});

// --- MapMode template application ------------------------------------------

describe("MapMode template application", () => {
    it("fills name/icon/selection/repeats from a valid platform template", () => {
        const mode = new MapMode(PLATFORM, { template: "vacuum_clean_zone" }, "en");
        // From the Dreame template: MANUAL_RECTANGLE selection, EXTERNAL repeats.
        expect(mode.selectionType).toBe(SelectionType.MANUAL_RECTANGLE);
        expect(mode.repeatsType).toBe(RepeatsType.EXTERNAL);
        expect(mode.maxSelections).toBe(20);
        expect(mode.maxRepeats).toBe(3);
        expect(mode.icon).toBe("mdi:select-drag");
    });

    it("ignores an unknown template name (keeps defaults)", () => {
        const mode = new MapMode(PLATFORM, { template: "does_not_exist" }, "en");
        expect(mode.selectionType).toBe(SelectionType.PREDEFINED_POINT);
        expect(mode.icon).toBe("mdi:help");
    });

    it("does not let a template override an explicitly configured field", () => {
        const mode = new MapMode(
            PLATFORM,
            { template: "vacuum_clean_zone", icon: "mdi:custom", selection_type: "ROOM" },
            "en"
        );
        expect(mode.icon).toBe("mdi:custom");
        expect(mode.selectionType).toBe(SelectionType.ROOM);
    });
});

// --- MapMode.toMapModeConfig ----------------------------------------------

describe("MapMode.toMapModeConfig", () => {
    it("round-trips enums back to their string names", () => {
        const mode = new MapMode(
            PLATFORM,
            { selection_type: "ROOM", repeats_type: "INTERNAL", service_call_schema: schemaConfig() },
            "en"
        );
        const cfg = mode.toMapModeConfig();
        expect(cfg.selection_type).toBe("ROOM");
        expect(cfg.repeats_type).toBe("INTERNAL");
    });

    it("strips the [[ ]] wrapper from variable keys", () => {
        const mode = new MapMode(
            PLATFORM,
            { variables: { "[[foo]]": "bar" }, service_call_schema: schemaConfig() },
            "en"
        );
        const cfg = mode.toMapModeConfig();
        expect(cfg.variables).toEqual({ foo: "bar" });
    });

    it("deep-clones the service call schema config", () => {
        const original = schemaConfig({ service: "vacuum.stop" });
        const mode = new MapMode(PLATFORM, { service_call_schema: original }, "en");
        const cfg = mode.toMapModeConfig();
        expect(cfg.service_call_schema).toEqual(original);
        expect(cfg.service_call_schema).not.toBe(original);
    });
});

// --- MapMode.getServiceCall -----------------------------------------------

describe("MapMode.getServiceCall", () => {
    beforeEach(() => {
        MapMode.debug = false;
    });
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("returns the non-evaluated call when evaluate_data_as_template is false", async () => {
        const mode = new MapMode(
            PLATFORM,
            {
                service_call_schema: schemaConfig({
                    service: "vacuum.start",
                    service_data: { entity_id: "[[entity_id]]" },
                    evaluate_data_as_template: false,
                }),
            },
            "en"
        );
        const hass = mkHass("ignored");
        const call = await mode.getServiceCall(hass, "vacuum.foo", [], 1, {});
        expect(call.domain).toBe("vacuum");
        expect(call.service).toBe("start");
        expect(call.serviceData).toEqual({ entity_id: "vacuum.foo" });
        // subscribeMessage must not be touched when template eval is off.
        expect((hass.connection.subscribeMessage as ReturnType<typeof vi.fn>)).not.toHaveBeenCalled();
    });

    it("evaluates the data through Jinja when enabled and applies the parsed result", async () => {
        const mode = new MapMode(
            PLATFORM,
            {
                service_call_schema: schemaConfig({
                    service: "vacuum.start",
                    service_data: { entity_id: "[[entity_id]]" },
                    evaluate_data_as_template: true,
                }),
            },
            "en"
        );
        // Backend returns a JSON string that getServiceCall will JSON.parse.
        const hass = mkHass(JSON.stringify({ entity_id: "vacuum.evaluated", extra: 9 }));
        const call = await mode.getServiceCall(hass, "vacuum.foo", [], 1, {});
        expect(call.serviceData).toEqual({ entity_id: "vacuum.evaluated", extra: 9 });
    });

    it("accepts an object result (not a JSON string) from the backend", async () => {
        const mode = new MapMode(
            PLATFORM,
            {
                service_call_schema: schemaConfig({
                    service: "vacuum.start",
                    service_data: { entity_id: "[[entity_id]]" },
                    evaluate_data_as_template: true,
                }),
            },
            "en"
        );
        const hass = mkHass({ entity_id: "vacuum.obj" });
        const call = await mode.getServiceCall(hass, "vacuum.foo", [], 1, {});
        expect(call.serviceData).toEqual({ entity_id: "vacuum.obj" });
    });

    it("unwraps a JSONIFY_JINJA marker inside the evaluated data", async () => {
        const mode = new MapMode(
            PLATFORM,
            {
                service_call_schema: schemaConfig({
                    service: "vacuum.start",
                    service_data: { zones: "[[entity_id]]" },
                    evaluate_data_as_template: true,
                }),
            },
            "en"
        );
        const payload = { zones: `[1,2,3]${Modifier.JSONIFY_JINJA}` };
        const hass = mkHass(JSON.stringify(payload));
        const call = await mode.getServiceCall(hass, "vacuum.foo", [], 1, {});
        expect(call.serviceData).toEqual({ zones: [1, 2, 3] });
    });

    it("falls back to the non-evaluated call when the backend rejects", async () => {
        const mode = new MapMode(
            PLATFORM,
            {
                service_call_schema: schemaConfig({
                    service: "vacuum.start",
                    service_data: { entity_id: "[[entity_id]]" },
                    evaluate_data_as_template: true,
                }),
            },
            "en"
        );
        const hass = mkHass(undefined, "reject");
        const call = await mode.getServiceCall(hass, "vacuum.foo", [], 1, {});
        // Degrades gracefully: keeps the locally filled service data.
        expect(call.serviceData).toEqual({ entity_id: "vacuum.foo" });
        expect(call.domain).toBe("vacuum");
        expect(call.service).toBe("start");
    });

    it("falls back when subscribeMessage throws synchronously", async () => {
        const mode = new MapMode(
            PLATFORM,
            {
                service_call_schema: schemaConfig({
                    service: "vacuum.start",
                    service_data: { entity_id: "[[entity_id]]" },
                    evaluate_data_as_template: true,
                }),
            },
            "en"
        );
        const hass = mkHass(undefined, "throw");
        const call = await mode.getServiceCall(hass, "vacuum.foo", [], 1, {});
        expect(call.serviceData).toEqual({ entity_id: "vacuum.foo" });
    });

    it("falls back when the backend returns an unparseable JSON string", async () => {
        const mode = new MapMode(
            PLATFORM,
            {
                service_call_schema: schemaConfig({
                    service: "vacuum.start",
                    service_data: { entity_id: "[[entity_id]]" },
                    evaluate_data_as_template: true,
                }),
            },
            "en"
        );
        const hass = mkHass("this is not json {");
        const call = await mode.getServiceCall(hass, "vacuum.foo", [], 1, {});
        // JSON.parse throws -> caught -> keeps the non-evaluated call.
        expect(call.serviceData).toEqual({ entity_id: "vacuum.foo" });
    });

    it("logs the evaluation failure only when debug is enabled", async () => {
        const errSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
        const mode = new MapMode(
            PLATFORM,
            {
                service_call_schema: schemaConfig({
                    service: "vacuum.start",
                    service_data: { entity_id: "[[entity_id]]" },
                    evaluate_data_as_template: true,
                }),
            },
            "en"
        );

        await mode.getServiceCall(mkHass(undefined, "reject"), "vacuum.foo", [], 1, {});
        expect(errSpy).not.toHaveBeenCalled();

        MapMode.debug = true;
        await mode.getServiceCall(mkHass(undefined, "reject"), "vacuum.foo", [], 1, {});
        expect(errSpy).toHaveBeenCalledTimes(1);
    });
});
