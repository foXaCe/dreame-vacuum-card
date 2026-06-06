import { describe, it, expect } from "vitest";
import { localize, localizeWithHass } from "../src/localize/localize";
import { computeDomain } from "../src/localize/hass/compute_domain";
import { blankBeforePercent } from "../src/localize/hass/blank_before_percent";
import {
    formatNumber,
    isNumericFromAttributes,
    numberFormatToLocale,
    getDefaultFormatOptions,
} from "../src/localize/hass/format_number";
import { round } from "../src/localize/hass/round";
import { isDate } from "../src/localize/hass/is_date";
import { isTimestamp } from "../src/localize/hass/is_timestamp";
import { capitalizeFirstLetter } from "../src/localize/hass/capitalize_first_letter";
import { computeStateDisplay } from "../src/localize/hass/compute_state_display";
import { NumberFormat, TimeFormat, FirstWeekday } from "../src/localize/hass/translation";
import type { FrontendLocaleData } from "../src/localize/hass/translation";
import type { HassEntity, HassEntityAttributeBase } from "home-assistant-js-websocket";
import type { HomeAssistantFixed } from "../src/types/fixes";

// -----------------------------------------------------------------------------
// helpers
// -----------------------------------------------------------------------------

const mkLocale = (overrides: Partial<FrontendLocaleData> = {}): FrontendLocaleData => ({
    language: "en",
    number_format: NumberFormat.language,
    time_format: TimeFormat.language,
    first_weekday: FirstWeekday.language,
    ...overrides,
});

// Simple stub for the HA LocalizeFunc: returns "" by default (i.e. "unknown key"),
// so computeStateDisplay falls back to the raw state, unless a specific map is given.
const mkLocalize =
    (map: Record<string, string> = {}) =>
    (key: string): string =>
        map[key] ?? "";

// -----------------------------------------------------------------------------
// localize / localizeWithHass
// -----------------------------------------------------------------------------

describe("localize", () => {
    it("resolves a nested key for the requested language", () => {
        expect(localize("common.version", "en")).toBe("Version");
        expect(localize("map_mode.invalid", "en")).toBe("Invalid template!");
        expect(localize("map_mode.invalid", "fr")).toBe("Template incorrect !");
    });

    it("resolves a French value when lang is fr", () => {
        expect(localize("common.description", "fr")).toBe(
            "Une carte qui vous permet de contrôler votre robot aspirateur"
        );
    });

    it("falls back to English when the key is missing in the requested language", () => {
        // map_mode.setup_zone exists in en ("Zone coordinates") but is absent from bg.
        expect(localize("map_mode.setup_zone", "bg")).toBe("Zone coordinates");
    });

    it("replaces the {0} placeholder via the tuple form [key, search, replace]", () => {
        expect(localize(["common.invalid_configuration", "{0}", "BOOM"], "en")).toBe(
            "Invalid configuration BOOM"
        );
        expect(localize(["common.invalid_configuration", "{0}", "BOOM"], "fr")).toBe(
            "Configuration invalide BOOM"
        );
    });

    it("does not replace when replace value is empty (guard search!=='' && replace!=='')", () => {
        expect(localize(["common.invalid_configuration", "{0}", ""], "en")).toBe(
            "Invalid configuration {0}"
        );
    });

    it("returns the provided fallback for an entirely unknown key", () => {
        expect(localize("does.not.exist.anywhere", "en", "MY_FALLBACK")).toBe("MY_FALLBACK");
    });

    it("returns the key itself when no fallback is given for an unknown key", () => {
        // fallback defaults to the string itself in localizeString.
        expect(localize("totally.unknown.key", "en")).toBe("totally.unknown.key");
    });

    it("falls back to English for an unknown language code", () => {
        // languages['xx'] is undefined -> evaluateForLanguage throws/returns undefined,
        // then re-evaluated against the default 'en'.
        expect(localize("common.version", "xx-unknown")).toBe("Version");
    });
});

describe("localizeWithHass", () => {
    it("prefers config.language over hass.locale.language", () => {
        const hass = { locale: { language: "en" } } as unknown as HomeAssistantFixed;
        const config = { language: "fr" } as never;
        expect(localizeWithHass("map_mode.invalid", hass, config)).toBe("Template incorrect !");
    });

    it("uses hass.locale.language when config has no language", () => {
        const hass = { locale: { language: "fr" } } as unknown as HomeAssistantFixed;
        expect(localizeWithHass("map_mode.invalid", hass, undefined)).toBe("Template incorrect !");
    });

    it("passes through the fallback for an unknown key", () => {
        const hass = { locale: { language: "en" } } as unknown as HomeAssistantFixed;
        expect(localizeWithHass("nope.nope", hass, undefined, "FB")).toBe("FB");
    });

    it("tolerates undefined hass and config", () => {
        // No throw; resolves via cached/localStorage language path, key still found.
        expect(localizeWithHass("common.version", undefined, undefined)).toBe("Version");
    });
});

// -----------------------------------------------------------------------------
// computeDomain (regression: id sans point -> "")
// -----------------------------------------------------------------------------

describe("computeDomain", () => {
    it("returns the domain before the first dot", () => {
        expect(computeDomain("vacuum.living_room")).toBe("vacuum");
        expect(computeDomain("sensor.temperature")).toBe("sensor");
    });

    it("uses only the first dot when several are present", () => {
        expect(computeDomain("light.kitchen.ceiling")).toBe("light");
    });

    it("returns '' for an id without a dot (regression, not truncation)", () => {
        expect(computeDomain("noseparator")).toBe("");
        expect(computeDomain("x")).toBe("");
    });

    it("returns '' for an empty string", () => {
        expect(computeDomain("")).toBe("");
    });

    it("returns '' when the dot is the first character", () => {
        expect(computeDomain(".hidden")).toBe("");
    });
});

// -----------------------------------------------------------------------------
// blankBeforePercent (regression: cs -> space, cz removed)
// -----------------------------------------------------------------------------

describe("blankBeforePercent", () => {
    it("returns a space for Czech 'cs'", () => {
        expect(blankBeforePercent(mkLocale({ language: "cs" }))).toBe(" ");
    });

    it("returns a space for fr/de/fi/sk/sv", () => {
        for (const lang of ["fr", "de", "fi", "sk", "sv"]) {
            expect(blankBeforePercent(mkLocale({ language: lang }))).toBe(" ");
        }
    });

    it("does NOT match the legacy 'cz' code (returns default '')", () => {
        expect(blankBeforePercent(mkLocale({ language: "cz" }))).toBe("");
    });

    it("returns '' for English and other unlisted languages", () => {
        expect(blankBeforePercent(mkLocale({ language: "en" }))).toBe("");
        expect(blankBeforePercent(mkLocale({ language: "es" }))).toBe("");
        expect(blankBeforePercent(mkLocale({ language: "" }))).toBe("");
    });
});

// -----------------------------------------------------------------------------
// numberFormatToLocale
// -----------------------------------------------------------------------------

describe("numberFormatToLocale", () => {
    it("maps comma_decimal to en-US fallbacks", () => {
        expect(numberFormatToLocale(mkLocale({ number_format: NumberFormat.comma_decimal }))).toEqual([
            "en-US",
            "en",
        ]);
    });

    it("maps decimal_comma to de/es/it", () => {
        expect(numberFormatToLocale(mkLocale({ number_format: NumberFormat.decimal_comma }))).toEqual([
            "de",
            "es",
            "it",
        ]);
    });

    it("maps space_comma to fr/sv/cs", () => {
        expect(numberFormatToLocale(mkLocale({ number_format: NumberFormat.space_comma }))).toEqual([
            "fr",
            "sv",
            "cs",
        ]);
    });

    it("returns undefined for system format", () => {
        expect(numberFormatToLocale(mkLocale({ number_format: NumberFormat.system }))).toBeUndefined();
    });

    it("falls back to the locale language for 'language' / 'none' / other", () => {
        expect(numberFormatToLocale(mkLocale({ language: "fr", number_format: NumberFormat.language }))).toBe(
            "fr"
        );
        expect(numberFormatToLocale(mkLocale({ language: "pl", number_format: NumberFormat.none }))).toBe("pl");
    });
});

// -----------------------------------------------------------------------------
// isNumericFromAttributes
// -----------------------------------------------------------------------------

describe("isNumericFromAttributes", () => {
    it("is true when unit_of_measurement is set", () => {
        expect(isNumericFromAttributes({ unit_of_measurement: "°C" } as HassEntityAttributeBase)).toBe(true);
    });

    it("is true when state_class is set", () => {
        expect(isNumericFromAttributes({ state_class: "measurement" } as HassEntityAttributeBase)).toBe(true);
    });

    it("is false when neither is present", () => {
        expect(isNumericFromAttributes({} as HassEntityAttributeBase)).toBe(false);
    });

    it("is false when both are empty strings (falsy)", () => {
        expect(
            isNumericFromAttributes({ unit_of_measurement: "", state_class: "" } as HassEntityAttributeBase)
        ).toBe(false);
    });
});

// -----------------------------------------------------------------------------
// formatNumber
// -----------------------------------------------------------------------------

describe("formatNumber", () => {
    it("formats a numeric value using locale grouping (en-US comma_decimal)", () => {
        const out = formatNumber(1234567.89, mkLocale({ number_format: NumberFormat.comma_decimal }));
        expect(out).toBe("1,234,567.89");
    });

    it("formats with French space_comma grouping", () => {
        // fr grouping uses a narrow no-break space ( ) in modern ICU.
        const out = formatNumber(1234.5, mkLocale({ language: "fr", number_format: NumberFormat.space_comma }));
        expect(out).toMatch(/^1[\s  ]234,5$/);
    });

    it("respects NumberFormat.none (en-US, no grouping)", () => {
        expect(formatNumber(1234567, mkLocale({ number_format: NumberFormat.none }))).toBe("1234567");
    });

    it("keeps trailing zeros of a numeric string when no fraction options given", () => {
        expect(formatNumber("1.50", mkLocale({ number_format: NumberFormat.comma_decimal }))).toBe("1.50");
    });

    it("returns a non-numeric string unchanged when no locale options", () => {
        expect(formatNumber("not a number")).toBe("not a number");
    });

    it("rounds a plain number when no locale and num is numeric", () => {
        // No localeOptions -> locale is undefined, so Intl uses the environment's default
        // locale, whose decimal separator may be '.' or ','. Just assert the rounded digits.
        const out = formatNumber(3.14159, undefined, { maximumFractionDigits: 2 });
        expect(out).toMatch(/^3[.,]14$/);
    });

    it("applies maximumFractionDigits option", () => {
        expect(
            formatNumber(3.14159, mkLocale({ number_format: NumberFormat.comma_decimal }), {
                maximumFractionDigits: 3,
            })
        ).toBe("3.142");
    });
});

describe("getDefaultFormatOptions", () => {
    it("defaults to maximumFractionDigits 2 for numbers", () => {
        expect(getDefaultFormatOptions(5)).toEqual({ maximumFractionDigits: 2 });
    });

    it("derives min/max fraction digits from a numeric string's decimals", () => {
        expect(getDefaultFormatOptions("1.230")).toEqual({
            maximumFractionDigits: 3,
            minimumFractionDigits: 3,
        });
    });

    it("treats integer strings as zero fraction digits", () => {
        expect(getDefaultFormatOptions("42")).toEqual({
            maximumFractionDigits: 0,
            minimumFractionDigits: 0,
        });
    });

    it("does not override explicitly provided options", () => {
        expect(getDefaultFormatOptions("1.5", { maximumFractionDigits: 1 })).toEqual({
            maximumFractionDigits: 1,
        });
    });
});

// -----------------------------------------------------------------------------
// round
// -----------------------------------------------------------------------------

describe("round", () => {
    it("rounds to 2 decimals by default", () => {
        expect(round(1.005)).toBe(1.0); // floating point: 1.005*100 -> 100.49.. -> 100
        expect(round(2.345)).toBe(2.35);
        expect(round(2.344)).toBe(2.34);
    });

    it("rounds to the given precision", () => {
        expect(round(3.14159, 3)).toBe(3.142);
        expect(round(3.14159, 0)).toBe(3);
    });

    it("handles negative numbers", () => {
        expect(round(-2.345, 2)).toBe(-2.35);
    });

    it("returns the same integer when already rounded", () => {
        expect(round(10, 2)).toBe(10);
    });
});

// -----------------------------------------------------------------------------
// isDate
// -----------------------------------------------------------------------------

describe("isDate", () => {
    it("accepts a strict YYYY-MM-DD date", () => {
        expect(isDate("2024-01-15")).toBe(true);
        expect(isDate("2024-12-31")).toBe(true);
    });

    it("rejects invalid month/day", () => {
        expect(isDate("2024-13-01")).toBe(false);
        expect(isDate("2024-00-10")).toBe(false);
        expect(isDate("2024-01-32")).toBe(false);
    });

    it("rejects strings with trailing chars by default", () => {
        expect(isDate("2024-01-15T10:00")).toBe(false);
    });

    it("accepts trailing chars when allowCharsAfterDate is true", () => {
        expect(isDate("2024-01-15T10:00", true)).toBe(true);
    });

    it("rejects non-date input", () => {
        expect(isDate("hello")).toBe(false);
        expect(isDate("")).toBe(false);
    });
});

// -----------------------------------------------------------------------------
// isTimestamp
// -----------------------------------------------------------------------------

describe("isTimestamp", () => {
    it("accepts a full ISO timestamp with T separator", () => {
        expect(isTimestamp("2024-01-15T10:30:00")).toBe(true);
        expect(isTimestamp("2024-01-15T10:30:00Z")).toBe(true);
        expect(isTimestamp("2024-01-15T10:30:00+02:00")).toBe(true);
    });

    it("accepts a timestamp with a blank separator", () => {
        expect(isTimestamp("2024-01-15 10:30:00")).toBe(true);
    });

    it("rejects a bare date (no time portion)", () => {
        expect(isTimestamp("2024-01-15")).toBe(false);
    });

    it("rejects a year-only or malformed value", () => {
        expect(isTimestamp("2024")).toBe(false);
        expect(isTimestamp("not-a-timestamp")).toBe(false);
        expect(isTimestamp("")).toBe(false);
    });
});

// -----------------------------------------------------------------------------
// capitalizeFirstLetter
// -----------------------------------------------------------------------------

describe("capitalizeFirstLetter", () => {
    it("capitalizes the first character", () => {
        expect(capitalizeFirstLetter("hello")).toBe("Hello");
        expect(capitalizeFirstLetter("a")).toBe("A");
    });

    it("leaves an already-capitalized string unchanged", () => {
        expect(capitalizeFirstLetter("World")).toBe("World");
    });

    it("returns an empty string unchanged", () => {
        expect(capitalizeFirstLetter("")).toBe("");
    });

    it("does not alter non-letter first characters", () => {
        expect(capitalizeFirstLetter("123abc")).toBe("123abc");
    });
});

// -----------------------------------------------------------------------------
// computeStateDisplay
// -----------------------------------------------------------------------------

const mkStateObj = (overrides: Partial<HassEntity>): HassEntity =>
    ({
        entity_id: "sensor.test",
        state: "42",
        attributes: {},
        last_changed: "",
        last_updated: "",
        context: { id: "", parent_id: null, user_id: null },
        ...overrides,
    }) as HassEntity;

describe("computeStateDisplay", () => {
    it("localizes the unknown/unavailable default states", () => {
        const loc = mkLocalize({
            "state.default.unknown": "Unknown",
            "state.default.unavailable": "Unavailable",
        });
        const stateObj = mkStateObj({ entity_id: "sensor.x", state: "unknown" });
        expect(computeStateDisplay(loc, stateObj, mkLocale(), {})).toBe("Unknown");

        const stateObj2 = mkStateObj({ entity_id: "sensor.x", state: "unavailable" });
        expect(computeStateDisplay(loc, stateObj2, mkLocale(), {})).toBe("Unavailable");
    });

    it("formats a numeric sensor with its unit_of_measurement", () => {
        const stateObj = mkStateObj({
            entity_id: "sensor.temp",
            state: "21.5",
            attributes: { unit_of_measurement: "°C" } as HassEntity["attributes"],
        });
        expect(
            computeStateDisplay(mkLocalize(), stateObj, mkLocale({ number_format: NumberFormat.comma_decimal }), {})
        ).toBe("21.5 °C");
    });

    it("uses a localized space before '%' for languages that need it (cs)", () => {
        const stateObj = mkStateObj({
            entity_id: "sensor.batt",
            state: "80",
            attributes: { unit_of_measurement: "%" } as HassEntity["attributes"],
        });
        const out = computeStateDisplay(
            mkLocalize(),
            stateObj,
            mkLocale({ language: "cs", number_format: NumberFormat.comma_decimal }),
            {}
        );
        expect(out).toBe("80 %");
    });

    it("uses no space before '%' for English", () => {
        const stateObj = mkStateObj({
            entity_id: "sensor.batt",
            state: "80",
            attributes: { unit_of_measurement: "%" } as HassEntity["attributes"],
        });
        const out = computeStateDisplay(
            mkLocalize(),
            stateObj,
            mkLocale({ language: "en", number_format: NumberFormat.comma_decimal }),
            {}
        );
        expect(out).toBe("80%");
    });

    it("formats a number-domain entity without a unit", () => {
        const stateObj = mkStateObj({
            entity_id: "number.threshold",
            state: "5",
            attributes: { step: 1 } as HassEntity["attributes"],
        });
        expect(
            computeStateDisplay(mkLocalize(), stateObj, mkLocale({ number_format: NumberFormat.comma_decimal }), {})
        ).toBe("5");
    });

    it("returns a device-class state translation when available", () => {
        const loc = mkLocalize({
            "component.vacuum.entity_component._.state.cleaning": "Cleaning",
        });
        const stateObj = mkStateObj({
            entity_id: "vacuum.robot",
            state: "cleaning",
            attributes: {} as HassEntity["attributes"],
        });
        expect(computeStateDisplay(loc, stateObj, mkLocale(), {})).toBe("Cleaning");
    });

    it("falls back to the raw state when no translation exists", () => {
        const stateObj = mkStateObj({
            entity_id: "vacuum.robot",
            state: "weird_state",
            attributes: {} as HassEntity["attributes"],
        });
        expect(computeStateDisplay(mkLocalize(), stateObj, mkLocale(), {})).toBe("weird_state");
    });

    it("honours the explicit state override argument", () => {
        const loc = mkLocalize({
            "component.vacuum.entity_component._.state.docked": "Docked",
        });
        const stateObj = mkStateObj({
            entity_id: "vacuum.robot",
            state: "cleaning",
            attributes: {} as HassEntity["attributes"],
        });
        expect(computeStateDisplay(loc, stateObj, mkLocale(), {}, "docked")).toBe("Docked");
    });
});
