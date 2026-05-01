import { describe, it, expect } from "vitest";
import { isHaVersionAtLeast, deleteFromArray, conditional } from "../src/utils";
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
