import { describe, it, expect } from "vitest";
import { replaceInTarget, getReplacedValue, getFilledTemplate } from "../src/template-utils";

describe("replaceInTarget", () => {
    it("walks nested objects and applies the replacer to string leaves", () => {
        const target = {
            entity_id: "[[entity]]",
            data: { value: "[[v]]", nested: { deep: "[[deep]]" } },
            untouched: 42,
        };
        replaceInTarget(target, (s) => s.replace(/\[\[(\w+)\]\]/g, (_, k) => `<${k}>`));
        expect(target).toEqual({
            entity_id: "<entity>",
            data: { value: "<v>", nested: { deep: "<deep>" } },
            untouched: 42,
        });
    });
});

describe("getReplacedValue", () => {
    it("returns the variable directly when full-string match", () => {
        expect(getReplacedValue("[[entity_id]]", { entity_id: "vacuum.foo" })).toBe("vacuum.foo");
    });

    it("inlines variables found inside a longer string", () => {
        expect(getReplacedValue("hello [[name]]!", { name: "world" })).toBe("hello world!");
    });

    it("leaves the value unchanged when no variable matches", () => {
        expect(getReplacedValue("plain", { other: "x" })).toBe("plain");
    });
});

describe("getFilledTemplate", () => {
    it("merges multiple variable storages and replaces in a deep clone", () => {
        const tmpl = { entity_id: "[[entity]]", data: { x: "[[x]]" } };
        const out = getFilledTemplate(tmpl, { entity: "vacuum.foo" }, { x: 42 });
        // x est remplacé par sa valeur numérique brute (full-string match conserve le type).
        expect(out).toEqual({ entity_id: "vacuum.foo", data: { x: 42 } });
        // Le template original n'est pas muté.
        expect(tmpl).toEqual({ entity_id: "[[entity]]", data: { x: "[[x]]" } });
    });

    it("first storage wins over subsequent ones for the same key", () => {
        const out = getFilledTemplate({ k: "[[v]]" }, { v: "first" }, { v: "second" });
        expect(out).toEqual({ k: "first" });
    });
});
