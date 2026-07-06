import { describe, it, expect } from "vitest";
import { isHaVersionAtLeast, deleteFromArray, conditional, unwrapAngleDeg } from "../src/utils";
import type { HomeAssistantFixed } from "../src/types/fixes";

const mkHass = (version: string | undefined): HomeAssistantFixed =>
    ({
        config: version === undefined ? undefined : { version },
    }) as unknown as HomeAssistantFixed;

describe("isHaVersionAtLeast", () => {
    it("returns true when current is newer", () => {
        expect(isHaVersionAtLeast(mkHass("2024.10.3"), "2024.5")).toBe(true);
        expect(isHaVersionAtLeast(mkHass("2025.1.0"), "2024.10")).toBe(true);
    });

    it("returns true when current equals threshold", () => {
        expect(isHaVersionAtLeast(mkHass("2024.10.0"), "2024.10")).toBe(true);
    });

    it("returns false when current is older", () => {
        expect(isHaVersionAtLeast(mkHass("2024.4.5"), "2024.5")).toBe(false);
        expect(isHaVersionAtLeast(mkHass("2023.12.9"), "2024.1")).toBe(false);
    });

    it("returns false on missing or malformed version", () => {
        expect(isHaVersionAtLeast(undefined, "2024.5")).toBe(false);
        expect(isHaVersionAtLeast(mkHass(undefined), "2024.5")).toBe(false);
        expect(isHaVersionAtLeast(mkHass("not-a-version"), "2024.5")).toBe(false);
    });
});

describe("deleteFromArray", () => {
    it("removes the entry and returns its index", () => {
        const arr = ["a", "b", "c"];
        expect(deleteFromArray(arr, "b")).toBe(1);
        expect(arr).toEqual(["a", "c"]);
    });

    it("returns -1 and leaves the array untouched if entry missing", () => {
        const arr = [1, 2, 3];
        expect(deleteFromArray(arr, 42)).toBe(-1);
        expect(arr).toEqual([1, 2, 3]);
    });
});

describe("conditional", () => {
    it("calls the producer when condition is true", () => {
        let called = false;
        conditional(true, () => {
            called = true;
            return "ok";
        });
        expect(called).toBe(true);
    });

    it("returns null without calling when condition is false", () => {
        let called = false;
        const out = conditional(false, () => {
            called = true;
            return "ok";
        });
        expect(out).toBe(null);
        expect(called).toBe(false);
    });
});

describe("unwrapAngleDeg", () => {
    it("returns the value unchanged on the first sample (no previous angle)", () => {
        expect(unwrapAngleDeg(undefined, 90)).toBe(90);
    });

    it("unwraps a crossing of +180 -> -175 as a short +7 delta, not -353", () => {
        expect(unwrapAngleDeg(178, -175)).toBe(185);
    });

    it("unwraps a crossing of -180 -> 175 as a short -7 delta, in the opposite direction", () => {
        expect(unwrapAngleDeg(-178, 175)).toBe(-185);
    });

    it("keeps the continuous value beyond a single turn (720 -> value equivalent to 10 mod 360)", () => {
        expect(unwrapAngleDeg(720, 10)).toBe(730);
    });

    it("treats a non-finite previous angle like a first sample", () => {
        expect(unwrapAngleDeg(NaN, 42)).toBe(42);
    });

    it("resolves an exact 180deg flip to the canonical -180 delta (boundary of the wrap range)", () => {
        // 0 -> 180 is a half-turn either way; the wrap formula canonicalizes it to -180
        // (delta range is (-180, 180], so a diff of exactly 180 maps to -180, not +180).
        expect(unwrapAngleDeg(0, 180)).toBe(-180);
    });
});
