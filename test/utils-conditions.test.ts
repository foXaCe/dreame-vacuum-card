import { describe, it, expect, vi, afterEach } from "vitest";

import { isConditionMet, areConditionsMet } from "../src/utils/conditions";
import {
    hasConfigOrAnyEntityChanged,
    checkIfEntitiesChanged,
    isHaVersionAtLeast,
} from "../src/utils/ha-change-detection";
import { deleteFromArray, conditional, delay } from "../src/utils/misc";
import type { HomeAssistantFixed } from "../src/types/fixes";
import type { ConditionConfig, VariablesStorage } from "../src/types/types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const mkHass = (states: Record<string, unknown>): HomeAssistantFixed =>
    ({
        states,
    }) as unknown as HomeAssistantFixed;

const mkHassVersion = (version: string | undefined): HomeAssistantFixed =>
    ({
        config: version === undefined ? undefined : { version },
    }) as unknown as HomeAssistantFixed;

// PropertyValues is essentially a Map<PropertyKey, unknown>; a plain Map works.
const mkChanged = (entries: Array<[string, unknown]> = []): Map<string, unknown> => new Map(entries);

// ---------------------------------------------------------------------------
// isConditionMet
// ---------------------------------------------------------------------------

describe("isConditionMet", () => {
    const internalVars: VariablesStorage = { mode: "auto", count: 3, empty: "" };

    it("matches via internal_variable when value equals", () => {
        const cond: ConditionConfig = { internal_variable: "mode", value: "auto" };
        expect(isConditionMet(cond, internalVars, mkHass({}))).toBe(true);
    });

    it("does not match via internal_variable when value differs", () => {
        const cond: ConditionConfig = { internal_variable: "mode", value: "manual" };
        expect(isConditionMet(cond, internalVars, mkHass({}))).toBe(false);
    });

    it("coerces internal_variable numbers to string for comparison", () => {
        const cond: ConditionConfig = { internal_variable: "count", value: "3" };
        expect(isConditionMet(cond, internalVars, mkHass({}))).toBe(true);
    });

    it("matches via entity state", () => {
        const hass = mkHass({ "vacuum.robot": { state: "cleaning", attributes: {} } });
        const cond: ConditionConfig = { entity: "vacuum.robot", value: "cleaning" };
        expect(isConditionMet(cond, {}, hass)).toBe(true);
    });

    it("does not match via entity state when value differs", () => {
        const hass = mkHass({ "vacuum.robot": { state: "docked", attributes: {} } });
        const cond: ConditionConfig = { entity: "vacuum.robot", value: "cleaning" };
        expect(isConditionMet(cond, {}, hass)).toBe(false);
    });

    it("matches via entity attribute", () => {
        const hass = mkHass({
            "vacuum.robot": { state: "cleaning", attributes: { battery_level: 80 } },
        });
        const cond: ConditionConfig = { entity: "vacuum.robot", attribute: "battery_level", value: "80" };
        expect(isConditionMet(cond, {}, hass)).toBe(true);
    });

    it("does not match via entity attribute when value differs", () => {
        const hass = mkHass({
            "vacuum.robot": { state: "cleaning", attributes: { battery_level: 80 } },
        });
        const cond: ConditionConfig = { entity: "vacuum.robot", attribute: "battery_level", value: "50" };
        expect(isConditionMet(cond, {}, hass)).toBe(false);
    });

    it("returns false when the entity is absent", () => {
        const hass = mkHass({});
        const cond: ConditionConfig = { entity: "vacuum.missing", value: "cleaning" };
        expect(isConditionMet(cond, {}, hass)).toBe(false);
    });

    it("matches value_not when current value differs from value_not", () => {
        const hass = mkHass({ "vacuum.robot": { state: "docked", attributes: {} } });
        const cond: ConditionConfig = { entity: "vacuum.robot", value_not: "cleaning" };
        expect(isConditionMet(cond, {}, hass)).toBe(true);
    });

    it("does not match value_not when current value equals value_not", () => {
        const hass = mkHass({ "vacuum.robot": { state: "cleaning", attributes: {} } });
        const cond: ConditionConfig = { entity: "vacuum.robot", value_not: "cleaning" };
        expect(isConditionMet(cond, {}, hass)).toBe(false);
    });

    it("value_not via internal_variable", () => {
        const cond: ConditionConfig = { internal_variable: "mode", value_not: "manual" };
        expect(isConditionMet(cond, internalVars, mkHass({}))).toBe(true);
    });

    it("returns false when neither value nor value_not is provided", () => {
        const cond: ConditionConfig = { internal_variable: "mode" };
        expect(isConditionMet(cond, internalVars, mkHass({}))).toBe(false);
    });

    it("returns false on an empty condition object", () => {
        expect(isConditionMet({} as ConditionConfig, {}, mkHass({}))).toBe(false);
    });

    it("internal_variable takes precedence over entity", () => {
        const hass = mkHass({ "vacuum.robot": { state: "cleaning", attributes: {} } });
        const cond: ConditionConfig = {
            internal_variable: "mode",
            entity: "vacuum.robot",
            value: "auto",
        };
        // internal_variable "mode" === "auto" wins over entity state "cleaning"
        expect(isConditionMet(cond, internalVars, hass)).toBe(true);
    });

    it("falls back to entity when internal_variable name is not in storage", () => {
        const hass = mkHass({ "vacuum.robot": { state: "cleaning", attributes: {} } });
        const cond: ConditionConfig = {
            internal_variable: "unknown_var",
            entity: "vacuum.robot",
            value: "cleaning",
        };
        expect(isConditionMet(cond, internalVars, hass)).toBe(true);
    });

    it("value_not against the default empty currentValue (no source resolved) matches", () => {
        // No internal_variable match, no entity -> currentValue stays "".
        const cond: ConditionConfig = { value_not: "cleaning" };
        expect(isConditionMet(cond, {}, mkHass({}))).toBe(true);
    });

    it("value_not equal to the default empty currentValue does not match", () => {
        const cond: ConditionConfig = { value_not: "" };
        // condition.value_not "" is falsy, so the value_not branch is never entered -> false.
        expect(isConditionMet(cond, {}, mkHass({}))).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// areConditionsMet
// ---------------------------------------------------------------------------

describe("areConditionsMet", () => {
    const hass = mkHass({ "vacuum.robot": { state: "cleaning", attributes: { fan: "high" } } });

    it("returns true when all conditions are met", () => {
        const config = {
            conditions: [
                { entity: "vacuum.robot", value: "cleaning" },
                { entity: "vacuum.robot", attribute: "fan", value: "high" },
            ],
        };
        expect(areConditionsMet(config, {}, hass)).toBe(true);
    });

    it("returns false when one condition fails", () => {
        const config = {
            conditions: [
                { entity: "vacuum.robot", value: "cleaning" },
                { entity: "vacuum.robot", attribute: "fan", value: "low" },
            ],
        };
        expect(areConditionsMet(config, {}, hass)).toBe(false);
    });

    it("returns true (vacuously) when conditions array is empty", () => {
        expect(areConditionsMet({ conditions: [] }, {}, hass)).toBe(true);
    });

    it("returns true (vacuously) when conditions is undefined", () => {
        expect(areConditionsMet({}, {}, hass)).toBe(true);
    });
});

// ---------------------------------------------------------------------------
// hasConfigOrAnyEntityChanged
// ---------------------------------------------------------------------------

describe("hasConfigOrAnyEntityChanged", () => {
    it("returns true when config changed", () => {
        const changed = mkChanged([["config", {}]]);
        expect(hasConfigOrAnyEntityChanged([], changed, false, mkHass({}))).toBe(true);
    });

    it("returns true when forceUpdate is set", () => {
        const changed = mkChanged([["_hass", mkHass({})]]);
        expect(hasConfigOrAnyEntityChanged([], changed, true, mkHass({}))).toBe(true);
    });

    it("returns true when oldHass is absent (no _hass key in changedProps)", () => {
        // changedProps.get("_hass") -> undefined -> oldHass falsy -> entitiesChanged true.
        const changed = mkChanged();
        expect(hasConfigOrAnyEntityChanged(["vacuum.robot"], changed, false, mkHass({}))).toBe(true);
    });

    it("returns true when a watched entity state reference changed", () => {
        const oldState = { state: "docked" };
        const newState = { state: "cleaning" };
        const oldHass = mkHass({ "vacuum.robot": oldState });
        const newHass = mkHass({ "vacuum.robot": newState });
        const changed = mkChanged([["_hass", oldHass]]);
        expect(hasConfigOrAnyEntityChanged(["vacuum.robot"], changed, false, newHass)).toBe(true);
    });

    it("returns false when watched entity reference is identical and only _hass changed", () => {
        const sharedState = { state: "cleaning" };
        const oldHass = mkHass({ "vacuum.robot": sharedState });
        const newHass = mkHass({ "vacuum.robot": sharedState });
        const changed = mkChanged([["_hass", oldHass]]);
        expect(hasConfigOrAnyEntityChanged(["vacuum.robot"], changed, false, newHass)).toBe(false);
    });

    it("returns true when an unrelated prop (besides _hass) changed", () => {
        const sharedState = { state: "cleaning" };
        const oldHass = mkHass({ "vacuum.robot": sharedState });
        const newHass = mkHass({ "vacuum.robot": sharedState });
        const changed = mkChanged([
            ["_hass", oldHass],
            ["someOtherProp", 1],
        ]);
        expect(hasConfigOrAnyEntityChanged(["vacuum.robot"], changed, false, newHass)).toBe(true);
    });

    it("returns true when the only changed key is not _hass", () => {
        const sharedState = { state: "cleaning" };
        const oldHass = mkHass({ "vacuum.robot": sharedState });
        // _hass is NOT in changedProps, so oldHass is undefined -> entitiesChanged short-circuits true.
        // Use a watched entity that resolves identically by passing _hass too would change semantics,
        // so here we verify the changedKeys path with an unwatched-entities list.
        const changed = mkChanged([["_hass", oldHass], ["foo", 2]]);
        expect(hasConfigOrAnyEntityChanged([], changed, false, mkHass({ "vacuum.robot": sharedState }))).toBe(
            true,
        );
    });

    it("returns false when no watched entities, only _hass changed, and entities identical", () => {
        const oldHass = mkHass({});
        const changed = mkChanged([["_hass", oldHass]]);
        expect(hasConfigOrAnyEntityChanged([], changed, false, mkHass({}))).toBe(false);
    });

    it("treats undefined hass as a missing entity (reference differs from oldHass entity)", () => {
        const oldHass = mkHass({ "vacuum.robot": { state: "cleaning" } });
        const changed = mkChanged([["_hass", oldHass]]);
        // hass undefined -> hass?.states[entity] is undefined !== oldHass state -> changed.
        expect(hasConfigOrAnyEntityChanged(["vacuum.robot"], changed, false, undefined)).toBe(true);
    });
});

// ---------------------------------------------------------------------------
// checkIfEntitiesChanged
// ---------------------------------------------------------------------------

describe("checkIfEntitiesChanged", () => {
    it("returns true when a watched entity reference changed", () => {
        const oldHass = mkHass({ "vacuum.robot": { state: "docked" } });
        const newHass = mkHass({ "vacuum.robot": { state: "cleaning" } });
        expect(checkIfEntitiesChanged(["vacuum.robot"], oldHass, newHass)).toBe(true);
    });

    it("returns false when watched entity references are identical", () => {
        const shared = { state: "cleaning" };
        const oldHass = mkHass({ "vacuum.robot": shared });
        const newHass = mkHass({ "vacuum.robot": shared });
        expect(checkIfEntitiesChanged(["vacuum.robot"], oldHass, newHass)).toBe(false);
    });

    it("returns false for an empty entities list", () => {
        const oldHass = mkHass({ "vacuum.robot": { state: "docked" } });
        const newHass = mkHass({ "vacuum.robot": { state: "cleaning" } });
        expect(checkIfEntitiesChanged([], oldHass, newHass)).toBe(false);
    });

    it("returns true when an entity is added in newHass", () => {
        const oldHass = mkHass({});
        const newHass = mkHass({ "vacuum.robot": { state: "cleaning" } });
        expect(checkIfEntitiesChanged(["vacuum.robot"], oldHass, newHass)).toBe(true);
    });

    it("returns false when entity is undefined in both", () => {
        const oldHass = mkHass({});
        const newHass = mkHass({});
        expect(checkIfEntitiesChanged(["vacuum.missing"], oldHass, newHass)).toBe(false);
    });

    it("detects change among multiple watched entities", () => {
        const sharedA = { state: "on" };
        const oldHass = mkHass({ "a.x": sharedA, "b.y": { state: "1" } });
        const newHass = mkHass({ "a.x": sharedA, "b.y": { state: "2" } });
        expect(checkIfEntitiesChanged(["a.x", "b.y"], oldHass, newHass)).toBe(true);
    });
});

// ---------------------------------------------------------------------------
// isHaVersionAtLeast (covered in utils.test too; re-verify edge cases here)
// ---------------------------------------------------------------------------

describe("isHaVersionAtLeast", () => {
    it("true when newer major or minor", () => {
        expect(isHaVersionAtLeast(mkHassVersion("2025.1.0"), "2024.10")).toBe(true);
        expect(isHaVersionAtLeast(mkHassVersion("2024.10.3"), "2024.5")).toBe(true);
    });

    it("true on exact equality of major.minor", () => {
        expect(isHaVersionAtLeast(mkHassVersion("2024.10.0"), "2024.10")).toBe(true);
    });

    it("false when older", () => {
        expect(isHaVersionAtLeast(mkHassVersion("2024.4.5"), "2024.5")).toBe(false);
    });

    it("false when hass undefined or version missing/malformed", () => {
        expect(isHaVersionAtLeast(undefined, "2024.5")).toBe(false);
        expect(isHaVersionAtLeast(mkHassVersion(undefined), "2024.5")).toBe(false);
        expect(isHaVersionAtLeast(mkHassVersion("not-a-version"), "2024.5")).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// deleteFromArray
// ---------------------------------------------------------------------------

describe("deleteFromArray", () => {
    it("removes the entry and returns its index", () => {
        const arr = ["a", "b", "c"];
        expect(deleteFromArray(arr, "b")).toBe(1);
        expect(arr).toEqual(["a", "c"]);
    });

    it("returns -1 and leaves array untouched when entry missing", () => {
        const arr = [1, 2, 3];
        expect(deleteFromArray(arr, 99)).toBe(-1);
        expect(arr).toEqual([1, 2, 3]);
    });

    it("removes only the first occurrence", () => {
        const arr = ["x", "y", "x"];
        expect(deleteFromArray(arr, "x")).toBe(0);
        expect(arr).toEqual(["y", "x"]);
    });

    it("handles an empty array", () => {
        const arr: number[] = [];
        expect(deleteFromArray(arr, 1)).toBe(-1);
        expect(arr).toEqual([]);
    });
});

// ---------------------------------------------------------------------------
// conditional
// ---------------------------------------------------------------------------

describe("conditional", () => {
    it("invokes producer and returns its value when condition true", () => {
        const out = conditional(true, () => "value");
        expect(out).toBe("value");
    });

    it("returns null without invoking producer when condition false", () => {
        const producer = vi.fn(() => "value");
        expect(conditional(false, producer)).toBeNull();
        expect(producer).not.toHaveBeenCalled();
    });
});

// ---------------------------------------------------------------------------
// delay
// ---------------------------------------------------------------------------

describe("delay", () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it("resolves only after the given duration elapses", async () => {
        vi.useFakeTimers();
        const resolved = vi.fn();
        const promise = delay(1000).then(resolved);

        // Not yet resolved before the timer fires.
        await Promise.resolve();
        expect(resolved).not.toHaveBeenCalled();

        await vi.advanceTimersByTimeAsync(999);
        expect(resolved).not.toHaveBeenCalled();

        await vi.advanceTimersByTimeAsync(1);
        await promise;
        expect(resolved).toHaveBeenCalledTimes(1);
    });

    it("resolves with undefined", async () => {
        vi.useFakeTimers();
        const promise = delay(0);
        await vi.advanceTimersByTimeAsync(0);
        await expect(promise).resolves.toBeUndefined();
    });
});
