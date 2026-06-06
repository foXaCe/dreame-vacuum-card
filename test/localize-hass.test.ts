import { describe, it, expect } from "vitest";

import { formatDuration, millisecondsToDuration, UNIT_TO_MILLISECOND_CONVERT } from "../src/localize/hass/duration";
import { formatDate } from "../src/localize/hass/format_date";
import { formatTime } from "../src/localize/hass/format_time";
import {
    formatDateTime,
    formatDateTimeWithSeconds,
} from "../src/localize/hass/format_date_time";
import { useAmPm } from "../src/localize/hass/use_am_pm";
import { computeStateDisplay } from "../src/localize/hass/compute_state_display";
import { computeAttributeValueDisplay } from "../src/localize/hass/compute_attribute_display";
import { formatAttributeValue } from "../src/localize/hass/entity_attributes";
import { UNAVAILABLE, UNKNOWN, OFF, UNAVAILABLE_STATES, OFF_STATES } from "../src/localize/hass/entity";
import checkValidDate from "../src/localize/hass/check_valid_date";
import { isDate } from "../src/localize/hass/is_date";
import { isTimestamp } from "../src/localize/hass/is_timestamp";
import { round } from "../src/localize/hass/round";
import { capitalizeFirstLetter } from "../src/localize/hass/capitalize_first_letter";
import { blankBeforePercent } from "../src/localize/hass/blank_before_percent";
import { NumberFormat, TimeFormat, FirstWeekday } from "../src/localize/hass/translation";
import type { FrontendLocaleData } from "../src/localize/hass/translation";
import type { FrontendLocaleDataFixed, HomeAssistantFixed } from "../src/types/fixes";
import type { HassEntity } from "home-assistant-js-websocket";

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

// `FrontendLocaleDataFixed` is structurally identical to `FrontendLocaleData`
// for the fields used by the date/time formatters, so we reuse the same shape.
const mkLocaleFixed = (overrides: Partial<FrontendLocaleData> = {}): FrontendLocaleDataFixed =>
    mkLocale(overrides) as unknown as FrontendLocaleDataFixed;

// Simple stub for the HA LocalizeFunc: returns "" by default (= "unknown key"),
// so the callers fall back to their default behaviour, unless a map is provided.
const mkLocalize =
    (map: Record<string, string> = {}) =>
    (key: string): string =>
        map[key] ?? "";

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

// A fixed wall-clock instant built from LOCAL components, making all formatter
// output timezone-independent (the formatters render in the local timezone).
const AUG_9 = new Date(2021, 7, 9, 20, 23, 15);

// -----------------------------------------------------------------------------
// duration.ts
// -----------------------------------------------------------------------------

describe("UNIT_TO_MILLISECOND_CONVERT", () => {
    it("maps each unit to its millisecond factor", () => {
        expect(UNIT_TO_MILLISECOND_CONVERT.ms).toBe(1);
        expect(UNIT_TO_MILLISECOND_CONVERT.s).toBe(1000);
        expect(UNIT_TO_MILLISECOND_CONVERT.min).toBe(60000);
        expect(UNIT_TO_MILLISECOND_CONVERT.h).toBe(3600000);
        expect(UNIT_TO_MILLISECOND_CONVERT.d).toBe(86400000);
    });
});

describe("formatDuration", () => {
    it("formats minutes that roll over into h:mm:ss", () => {
        expect(formatDuration("90", "min")).toBe("1:30:00");
    });

    it("formats fractional hours into h:mm:ss", () => {
        expect(formatDuration("1.5", "h")).toBe("1:30:00");
    });

    it("formats whole days into h:mm:ss (24h+)", () => {
        expect(formatDuration("1.25", "d")).toBe("30:00:00");
    });

    it("formats seconds-only values without padding", () => {
        expect(formatDuration("30", "s")).toBe("30");
    });

    it("formats sub-second millisecond input as s.mmm", () => {
        expect(formatDuration("1500", "ms")).toBe("1.500");
    });

    it("returns '0' for a zero duration (millisecondsToDuration is null)", () => {
        expect(formatDuration("0", "s")).toBe("0");
    });

    it("returns '0' for an unknown unit (NaN -> null -> '0')", () => {
        // UNIT_TO_MILLISECOND_CONVERT[unknown] is undefined -> NaN -> null -> "0"
        expect(formatDuration("5", "weeks")).toBe("0");
    });
});

describe("millisecondsToDuration", () => {
    it("returns h:mm:ss when hours are present (leftPad on m/s)", () => {
        expect(millisecondsToDuration(3661000)).toBe("1:01:01");
    });

    it("returns m:ss when only minutes/seconds are present", () => {
        expect(millisecondsToDuration(65000)).toBe("1:05");
    });

    it("returns plain seconds when under a minute and no millis", () => {
        expect(millisecondsToDuration(45000)).toBe("45");
    });

    it("returns s.mmm when only milliseconds remain", () => {
        // leftPad(ms, 3): 250 -> "250"
        expect(millisecondsToDuration(250)).toBe("0.250");
    });

    it("pads milliseconds to 3 digits", () => {
        // 1050ms -> 1s + 50ms -> "1.050"
        expect(millisecondsToDuration(1050)).toBe("1.050");
    });

    it("returns null for a zero duration", () => {
        expect(millisecondsToDuration(0)).toBeNull();
    });
});

// -----------------------------------------------------------------------------
// format_date.ts / format_time.ts / format_date_time.ts / use_am_pm.ts
// -----------------------------------------------------------------------------

describe("formatDate", () => {
    it("renders 'Month D, YYYY' for English", () => {
        expect(formatDate(AUG_9, mkLocaleFixed({ language: "en" }))).toBe("August 9, 2021");
    });

    it("renders 'D month YYYY' for French", () => {
        expect(formatDate(AUG_9, mkLocaleFixed({ language: "fr" }))).toBe("9 août 2021");
    });
});

describe("formatTime", () => {
    it("renders 24h time for English without AM/PM", () => {
        expect(formatTime(AUG_9, mkLocaleFixed({ language: "en", time_format: TimeFormat.twenty_four }))).toBe(
            "20:23"
        );
    });

    it("renders 12h time with PM for English am_pm", () => {
        expect(formatTime(AUG_9, mkLocaleFixed({ language: "en", time_format: TimeFormat.am_pm }))).toBe("8:23 PM");
    });
});

describe("formatDateTime", () => {
    it("renders date + 24h time for English", () => {
        const out = formatDateTime(AUG_9, mkLocaleFixed({ language: "en", time_format: TimeFormat.twenty_four }));
        // ICU may use "at" or "," as the date/time separator depending on version.
        expect(out).toContain("August 9, 2021");
        expect(out).toContain("20:23");
        expect(out).not.toContain("PM");
    });

    it("renders date + 12h time with PM for English am_pm", () => {
        const out = formatDateTime(AUG_9, mkLocaleFixed({ language: "en", time_format: TimeFormat.am_pm }));
        expect(out).toContain("August 9, 2021");
        expect(out).toContain("8:23");
        expect(out).toContain("PM");
    });
});

describe("formatDateTimeWithSeconds", () => {
    it("includes the seconds component in 24h English", () => {
        const out = formatDateTimeWithSeconds(
            AUG_9,
            mkLocaleFixed({ language: "en", time_format: TimeFormat.twenty_four })
        );
        expect(out).toContain("August 9, 2021");
        expect(out).toContain("20:23:15");
    });

    it("includes the seconds component in 12h English with PM", () => {
        const out = formatDateTimeWithSeconds(
            AUG_9,
            mkLocaleFixed({ language: "en", time_format: TimeFormat.am_pm })
        );
        expect(out).toContain("8:23:15");
        expect(out).toContain("PM");
    });
});

describe("useAmPm", () => {
    it("returns true for the explicit am_pm time format", () => {
        expect(useAmPm(mkLocaleFixed({ time_format: TimeFormat.am_pm }))).toBe(true);
    });

    it("returns false for the explicit twenty_four time format", () => {
        expect(useAmPm(mkLocaleFixed({ time_format: TimeFormat.twenty_four }))).toBe(false);
    });

    it("infers from the language for TimeFormat.language", () => {
        // For a 24h-locale language ("fr"), the probe string contains no AM/PM marker.
        expect(useAmPm(mkLocaleFixed({ language: "fr", time_format: TimeFormat.language }))).toBe(false);
        // For "en-US" the system probe yields an AM/PM-style clock.
        expect(useAmPm(mkLocaleFixed({ language: "en-US", time_format: TimeFormat.language }))).toBe(true);
    });

    it("infers from the system locale for TimeFormat.system (boolean result)", () => {
        // Uses the runtime default locale; we only assert it returns a boolean.
        expect(typeof useAmPm(mkLocaleFixed({ time_format: TimeFormat.system }))).toBe("boolean");
    });
});

// -----------------------------------------------------------------------------
// compute_state_display.ts (branches not covered by localize.test.ts)
// -----------------------------------------------------------------------------

describe("computeStateDisplay - duration device_class", () => {
    it("formats a numeric duration sensor via formatDuration", () => {
        const stateObj = mkStateObj({
            entity_id: "sensor.runtime",
            state: "90",
            attributes: {
                device_class: "duration",
                unit_of_measurement: "min",
            } as HassEntity["attributes"],
        });
        expect(computeStateDisplay(mkLocalize(), stateObj, mkLocale(), {})).toBe("1:30:00");
    });
});

describe("computeStateDisplay - monetary device_class", () => {
    it("formats a monetary value as a currency string", () => {
        const stateObj = mkStateObj({
            entity_id: "sensor.price",
            state: "12.5",
            attributes: {
                device_class: "monetary",
                unit_of_measurement: "USD",
            } as HassEntity["attributes"],
        });
        const out = computeStateDisplay(
            mkLocalize(),
            stateObj,
            mkLocale({ language: "en", number_format: NumberFormat.comma_decimal }),
            {}
        );
        expect(out).toBe("$12.50");
    });
});

describe("computeStateDisplay - counter / number / input_number", () => {
    it("formats a counter value without a unit", () => {
        const stateObj = mkStateObj({
            entity_id: "counter.visits",
            state: "7",
            attributes: {} as HassEntity["attributes"],
        });
        expect(
            computeStateDisplay(mkLocalize(), stateObj, mkLocale({ number_format: NumberFormat.comma_decimal }), {})
        ).toBe("7");
    });

    it("formats an input_number value", () => {
        const stateObj = mkStateObj({
            entity_id: "input_number.target",
            state: "3.5",
            attributes: {} as HassEntity["attributes"],
        });
        expect(
            computeStateDisplay(mkLocalize(), stateObj, mkLocale({ number_format: NumberFormat.comma_decimal }), {})
        ).toBe("3.5");
    });
});

describe("computeStateDisplay - humidifier", () => {
    it("shows the humidity when the humidifier is on", () => {
        const stateObj = mkStateObj({
            entity_id: "humidifier.bedroom",
            state: "on",
            attributes: { humidity: 55 } as HassEntity["attributes"],
        });
        expect(computeStateDisplay(mkLocalize(), stateObj, mkLocale(), {})).toBe("55 %");
    });

    it("falls through to translation/raw state when off", () => {
        const stateObj = mkStateObj({
            entity_id: "humidifier.bedroom",
            state: "off",
            attributes: { humidity: 55 } as HassEntity["attributes"],
        });
        // No translation -> raw state.
        expect(computeStateDisplay(mkLocalize(), stateObj, mkLocale(), {})).toBe("off");
    });
});

describe("computeStateDisplay - timestamp domains", () => {
    it("formats a button entity's state as a date-time", () => {
        const stateObj = mkStateObj({
            entity_id: "button.restart",
            state: "2021-08-09T20:23:00",
            attributes: {} as HassEntity["attributes"],
        });
        const out = computeStateDisplay(
            mkLocalize(),
            stateObj,
            mkLocale({ language: "en", time_format: TimeFormat.twenty_four }),
            {}
        );
        expect(out).toContain("August 9, 2021");
        expect(out).toContain("20:23");
    });

    it("formats a scene entity's state as a date-time", () => {
        const stateObj = mkStateObj({
            entity_id: "scene.movie",
            state: "2021-08-09T20:23:00",
            attributes: {} as HassEntity["attributes"],
        });
        const out = computeStateDisplay(
            mkLocalize(),
            stateObj,
            mkLocale({ language: "en", time_format: TimeFormat.twenty_four }),
            {}
        );
        expect(out).toContain("August 9, 2021");
    });

    it("formats a sensor with device_class timestamp as a date-time", () => {
        const stateObj = mkStateObj({
            entity_id: "sensor.last_seen",
            state: "2021-08-09T20:23:00",
            attributes: { device_class: "timestamp" } as HassEntity["attributes"],
        });
        const out = computeStateDisplay(
            mkLocalize(),
            stateObj,
            mkLocale({ language: "en", time_format: TimeFormat.twenty_four }),
            {}
        );
        expect(out).toContain("August 9, 2021");
        expect(out).toContain("20:23");
    });
});

describe("computeStateDisplay - date / input_datetime / time domains", () => {
    it("formats a date-only explicit state via formatDate", () => {
        const stateObj = mkStateObj({
            entity_id: "input_datetime.birthday",
            state: "2021-08-09",
            attributes: {} as HassEntity["attributes"],
        });
        expect(computeStateDisplay(mkLocalize(), stateObj, mkLocale({ language: "en" }), {})).toBe(
            "August 9, 2021"
        );
    });

    it("formats a time-only explicit state via formatTime", () => {
        const stateObj = mkStateObj({
            entity_id: "time.alarm",
            state: "14:30:00",
            attributes: {} as HassEntity["attributes"],
        });
        expect(
            computeStateDisplay(
                mkLocalize(),
                stateObj,
                mkLocale({ language: "en", time_format: TimeFormat.twenty_four }),
                {}
            )
        ).toBe("14:30");
    });

    it("formats a combined date + time explicit state", () => {
        const stateObj = mkStateObj({
            entity_id: "input_datetime.event",
            state: "2021-08-09 14:30:00",
            attributes: {} as HassEntity["attributes"],
        });
        const out = computeStateDisplay(
            mkLocalize(),
            stateObj,
            mkLocale({ language: "en", time_format: TimeFormat.twenty_four }),
            {}
        );
        expect(out).toContain("August 9, 2021");
        expect(out).toContain("14:30");
    });

    it("returns the raw state when the date string has no recognizable shape", () => {
        const stateObj = mkStateObj({
            entity_id: "input_datetime.weird",
            state: "gibberish",
            attributes: {} as HassEntity["attributes"],
        });
        expect(computeStateDisplay(mkLocalize(), stateObj, mkLocale({ language: "en" }), {})).toBe("gibberish");
    });
});

describe("computeStateDisplay - translation lookups", () => {
    it("prefers the entity translation_key translation", () => {
        const loc = mkLocalize({
            "component.dreame.entity.vacuum.robot_status.state.mopping": "Mopping",
        });
        const stateObj = mkStateObj({
            entity_id: "vacuum.robot",
            state: "mopping",
            attributes: {} as HassEntity["attributes"],
        });
        const entities = {
            "vacuum.robot": {
                entity_id: "vacuum.robot",
                platform: "dreame",
                translation_key: "robot_status",
            },
        } as unknown as HomeAssistantFixed["entities"];
        expect(computeStateDisplay(loc, stateObj, mkLocale(), entities)).toBe("Mopping");
    });

    it("falls back to the device_class translation when no translation_key match", () => {
        const loc = mkLocalize({
            "component.binary_sensor.entity_component.door.state.on": "Open",
        });
        const stateObj = mkStateObj({
            entity_id: "binary_sensor.front",
            state: "on",
            attributes: { device_class: "door" } as HassEntity["attributes"],
        });
        expect(computeStateDisplay(loc, stateObj, mkLocale(), {})).toBe("Open");
    });

    it("falls back to the default component translation", () => {
        const loc = mkLocalize({
            "component.lock.entity_component._.state.locked": "Locked",
        });
        const stateObj = mkStateObj({
            entity_id: "lock.front",
            state: "locked",
            attributes: {} as HassEntity["attributes"],
        });
        expect(computeStateDisplay(loc, stateObj, mkLocale(), {})).toBe("Locked");
    });
});

// -----------------------------------------------------------------------------
// compute_attribute_display.ts
// -----------------------------------------------------------------------------

describe("computeAttributeValueDisplay", () => {
    const baseObj = mkStateObj({ entity_id: "sensor.test", attributes: {} as HassEntity["attributes"] });

    it("returns the localized unknown string for a null value", () => {
        const loc = mkLocalize({ "state.default.unknown": "Unknown" });
        expect(computeAttributeValueDisplay(loc, baseObj, mkLocaleFixed(), {}, "x", null)).toBe("Unknown");
    });

    it("formats a numeric value via formatNumber", () => {
        expect(
            computeAttributeValueDisplay(
                mkLocalize(),
                baseObj,
                mkLocaleFixed({ number_format: NumberFormat.comma_decimal }),
                {},
                "temp",
                1234.5
            )
        ).toBe("1,234.5");
    });

    it("formats a timestamp string with seconds", () => {
        const out = computeAttributeValueDisplay(
            mkLocalize(),
            baseObj,
            mkLocaleFixed({ language: "en", time_format: TimeFormat.twenty_four }),
            {},
            "ts",
            "2021-08-09T20:23:15"
        );
        expect(out).toContain("August 9, 2021");
        expect(out).toContain("20:23:15");
    });

    it("formats a bare date string via formatDate", () => {
        expect(
            computeAttributeValueDisplay(
                mkLocalize(),
                baseObj,
                mkLocaleFixed({ language: "en" }),
                {},
                "d",
                "2021-08-09"
            )
        ).toBe("August 9, 2021");
    });

    it("JSON-stringifies an object value", () => {
        expect(
            computeAttributeValueDisplay(mkLocalize(), baseObj, mkLocaleFixed(), {}, "obj", { a: 1, b: "x" })
        ).toBe('{"a":1,"b":"x"}');
    });

    it("joins an array of primitive values with translation lookups", () => {
        const out = computeAttributeValueDisplay(
            mkLocalize(),
            baseObj,
            mkLocaleFixed(),
            {},
            "modes",
            ["auto", "eco"]
        );
        expect(out).toBe("auto, eco");
    });

    it("uses the default component translation for a string value", () => {
        const loc = mkLocalize({
            "component.sensor.entity_component._.state_attributes.fan_mode.state.high": "High",
        });
        const stateObj = mkStateObj({ entity_id: "sensor.test", attributes: {} as HassEntity["attributes"] });
        expect(computeAttributeValueDisplay(loc, stateObj, mkLocaleFixed(), {}, "fan_mode", "high")).toBe("High");
    });

    it("returns the raw value when no translation is found", () => {
        const stateObj = mkStateObj({ entity_id: "sensor.test", attributes: {} as HassEntity["attributes"] });
        expect(computeAttributeValueDisplay(mkLocalize(), stateObj, mkLocaleFixed(), {}, "mode", "custom")).toBe(
            "custom"
        );
    });

    it("reads from stateObj.attributes when value arg is omitted", () => {
        const stateObj = mkStateObj({
            entity_id: "sensor.test",
            attributes: { brightness: 128 } as HassEntity["attributes"],
        });
        expect(
            computeAttributeValueDisplay(
                mkLocalize(),
                stateObj,
                mkLocaleFixed({ number_format: NumberFormat.comma_decimal }),
                {},
                "brightness"
            )
        ).toBe("128");
    });
});

// -----------------------------------------------------------------------------
// entity_attributes.ts (formatAttributeValue)
// -----------------------------------------------------------------------------

describe("formatAttributeValue", () => {
    const mkHass = (overrides: Partial<HomeAssistantFixed> = {}): HomeAssistantFixed =>
        ({
            locale: mkLocaleFixed({ language: "en", number_format: NumberFormat.comma_decimal }),
            entities: {},
            localize: mkLocalize(),
            ...overrides,
        }) as unknown as HomeAssistantFixed;

    it("returns an em dash for a null attribute", () => {
        const stateObj = mkStateObj({ attributes: { foo: null } as unknown as HassEntity["attributes"] });
        expect(formatAttributeValue(mkHass(), stateObj, "foo")).toBe("—");
    });

    it("JSON-stringifies an object attribute", () => {
        const stateObj = mkStateObj({
            attributes: { cfg: { a: 1 } } as unknown as HassEntity["attributes"],
        });
        expect(formatAttributeValue(mkHass(), stateObj, "cfg")).toBe('{"a":1}');
    });

    it("formats a numeric attribute via formatNumber", () => {
        const stateObj = mkStateObj({ attributes: { n: 1500 } as unknown as HassEntity["attributes"] });
        expect(formatAttributeValue(mkHass(), stateObj, "n")).toBe("1,500");
    });

    it("formats a timestamp string attribute with seconds", () => {
        const stateObj = mkStateObj({
            attributes: { ts: "2021-08-09T20:23:15" } as unknown as HassEntity["attributes"],
        });
        const out = formatAttributeValue(
            mkHass({
                locale: mkLocaleFixed({ language: "en", time_format: TimeFormat.twenty_four }),
            }),
            stateObj,
            "ts"
        );
        expect(out).toContain("August 9, 2021");
        expect(out).toContain("20:23:15");
    });

    it("joins an array of primitives with a comma", () => {
        const stateObj = mkStateObj({
            attributes: { list: ["a", "b", "c"] } as unknown as HassEntity["attributes"],
        });
        expect(formatAttributeValue(mkHass(), stateObj, "list")).toBe("a, b, c");
    });

    it("delegates a plain string attribute to computeAttributeValueDisplay", () => {
        const stateObj = mkStateObj({
            entity_id: "sensor.test",
            attributes: { mode: "custom" } as unknown as HassEntity["attributes"],
        });
        expect(formatAttributeValue(mkHass(), stateObj, "mode")).toBe("custom");
    });
});

// -----------------------------------------------------------------------------
// entity.ts (constants)
// -----------------------------------------------------------------------------

describe("entity constants", () => {
    it("exposes the canonical state strings", () => {
        expect(UNAVAILABLE).toBe("unavailable");
        expect(UNKNOWN).toBe("unknown");
        expect(OFF).toBe("off");
    });

    it("groups unavailable states", () => {
        expect(UNAVAILABLE_STATES).toEqual(["unavailable", "unknown"]);
    });

    it("groups off states (incl. off)", () => {
        expect(OFF_STATES).toEqual(["unavailable", "unknown", "off"]);
    });
});

// -----------------------------------------------------------------------------
// check_valid_date.ts
// -----------------------------------------------------------------------------

describe("checkValidDate", () => {
    it("returns true for a valid Date", () => {
        expect(checkValidDate(new Date(2021, 0, 1))).toBe(true);
    });

    it("returns false for an Invalid Date", () => {
        expect(checkValidDate(new Date("not-a-date"))).toBe(false);
    });

    it("returns false when no date is provided", () => {
        expect(checkValidDate()).toBe(false);
    });
});

// -----------------------------------------------------------------------------
// is_date.ts (edge cases not in localize.test.ts)
// -----------------------------------------------------------------------------

describe("isDate (additional edge cases)", () => {
    it("accepts boundary day 31 and rejects day 00", () => {
        expect(isDate("2021-01-31")).toBe(true);
        expect(isDate("2021-01-00")).toBe(false);
    });

    it("rejects a leading-space or partial-year value", () => {
        expect(isDate(" 2021-01-01")).toBe(false);
        expect(isDate("21-01-01")).toBe(false);
    });

    it("ignores trailing junk only when allowCharsAfterDate is true", () => {
        expect(isDate("2021-01-01 garbage")).toBe(false);
        expect(isDate("2021-01-01 garbage", true)).toBe(true);
    });
});

// -----------------------------------------------------------------------------
// is_timestamp.ts (edge cases not in localize.test.ts)
// -----------------------------------------------------------------------------

describe("isTimestamp (additional edge cases)", () => {
    it("accepts hour:minute without seconds", () => {
        expect(isTimestamp("2021-08-09T20:23")).toBe(true);
    });

    it("accepts fractional seconds and Z", () => {
        expect(isTimestamp("2021-08-09T20:23:15.123Z")).toBe(true);
    });

    it("rejects an out-of-range hour", () => {
        expect(isTimestamp("2021-08-09T25:00:00")).toBe(false);
    });
});

// -----------------------------------------------------------------------------
// round.ts (additional edge cases not in localize.test.ts)
// -----------------------------------------------------------------------------

describe("round (additional edge cases)", () => {
    it("rounds with precision 0", () => {
        expect(round(2.6, 0)).toBe(3);
        expect(round(2.4, 0)).toBe(2);
    });

    it("rounds with a higher precision", () => {
        expect(round(1.23456, 4)).toBe(1.2346);
    });

    it("leaves zero untouched", () => {
        expect(round(0)).toBe(0);
    });
});

// -----------------------------------------------------------------------------
// capitalize_first_letter.ts (additional edge cases)
// -----------------------------------------------------------------------------

describe("capitalizeFirstLetter (additional edge cases)", () => {
    it("capitalizes a single accented character", () => {
        expect(capitalizeFirstLetter("élan")).toBe("Élan");
    });

    it("preserves the rest of the string casing", () => {
        expect(capitalizeFirstLetter("mIXeD")).toBe("MIXeD");
    });
});

// -----------------------------------------------------------------------------
// blank_before_percent.ts (exhaustive language coverage)
// -----------------------------------------------------------------------------

describe("blankBeforePercent (exhaustive)", () => {
    it("returns a space for every language in the spacing list", () => {
        for (const lang of ["cs", "de", "fi", "fr", "sk", "sv"]) {
            expect(blankBeforePercent(mkLocale({ language: lang }))).toBe(" ");
        }
    });

    it("returns no space for languages outside the list", () => {
        for (const lang of ["en", "es", "it", "pl", "nl", "pt", "ru", "ja", "cz", ""]) {
            expect(blankBeforePercent(mkLocale({ language: lang }))).toBe("");
        }
    });
});
