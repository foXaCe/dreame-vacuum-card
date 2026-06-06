import { describe, it, expect } from "vitest";
import { PlatformGenerator } from "../src/model/generators/platform-generator";
import {
    VacuumState,
    ACTIVE_VACUUM_STATES,
    ACTIVELY_CLEANING_STATES,
    RESTING_VACUUM_STATES,
    DISCONNECTION_TIME,
} from "../src/const";

const DREAME = "Dreame";

describe("PlatformGenerator.getPlatformName", () => {
    it("returns Dreame when platform is undefined", () => {
        expect(PlatformGenerator.getPlatformName(undefined)).toBe(DREAME);
    });

    it("returns Dreame for empty string (falsy)", () => {
        expect(PlatformGenerator.getPlatformName("")).toBe(DREAME);
    });

    it("maps legacy name 'Tasshack/dreame-vacuum' to Dreame", () => {
        expect(PlatformGenerator.getPlatformName("Tasshack/dreame-vacuum")).toBe(DREAME);
    });

    it("maps legacy name 'tasshackDreameVacuum' to Dreame", () => {
        expect(PlatformGenerator.getPlatformName("tasshackDreameVacuum")).toBe(DREAME);
    });

    it("returns the canonical name 'Dreame' unchanged", () => {
        expect(PlatformGenerator.getPlatformName(DREAME)).toBe(DREAME);
    });

    it("leaves a custom/unknown name unchanged", () => {
        expect(PlatformGenerator.getPlatformName("MyCustomPlatform")).toBe("MyCustomPlatform");
    });

    it("is case sensitive: a differently cased legacy name is not mapped", () => {
        expect(PlatformGenerator.getPlatformName("tasshack/dreame-vacuum")).toBe("tasshack/dreame-vacuum");
    });
});

describe("PlatformGenerator.getPlatforms", () => {
    it("returns the list of registered platform keys", () => {
        const platforms = PlatformGenerator.getPlatforms();
        expect(Array.isArray(platforms)).toBe(true);
        expect(platforms).toEqual([DREAME]);
    });
});

describe("PlatformGenerator.getPlatformsWithDefaultCalibration", () => {
    it("returns the platforms shipping a default calibration", () => {
        expect(PlatformGenerator.getPlatformsWithDefaultCalibration()).toEqual([DREAME]);
    });
});

describe("PlatformGenerator.getCalibration", () => {
    it("returns undefined for Dreame (template has no calibration_points)", () => {
        expect(PlatformGenerator.getCalibration(DREAME)).toBeUndefined();
    });

    it("returns undefined when platform is undefined (falls back to Dreame)", () => {
        expect(PlatformGenerator.getCalibration(undefined)).toBeUndefined();
    });

    it("returns undefined for unknown platform (falls back to Dreame template)", () => {
        expect(PlatformGenerator.getCalibration("nope")).toBeUndefined();
    });

    it("resolves legacy names through getPlatformName and returns undefined", () => {
        expect(PlatformGenerator.getCalibration("tasshackDreameVacuum")).toBeUndefined();
    });
});

describe("PlatformGenerator.getVariables", () => {
    it("returns undefined for Dreame (template has no internal_variables)", () => {
        expect(PlatformGenerator.getVariables(DREAME)).toBeUndefined();
    });

    it("returns undefined when platform is undefined", () => {
        expect(PlatformGenerator.getVariables(undefined)).toBeUndefined();
    });

    it("returns undefined for unknown platform (falls back to Dreame template)", () => {
        expect(PlatformGenerator.getVariables("whatever")).toBeUndefined();
    });
});

describe("PlatformGenerator.isValidModeTemplate", () => {
    it("returns true for an existing template name", () => {
        expect(PlatformGenerator.isValidModeTemplate(DREAME, "vacuum_clean_zone")).toBe(true);
        expect(PlatformGenerator.isValidModeTemplate(DREAME, "vacuum_clean_segment")).toBe(true);
        expect(PlatformGenerator.isValidModeTemplate(DREAME, "vacuum_goto")).toBe(true);
        expect(PlatformGenerator.isValidModeTemplate(DREAME, "vacuum_follow_path")).toBe(true);
    });

    it("returns false for a non-existing template name", () => {
        expect(PlatformGenerator.isValidModeTemplate(DREAME, "does_not_exist")).toBe(false);
    });

    it("returns false when template is undefined", () => {
        expect(PlatformGenerator.isValidModeTemplate(DREAME, undefined)).toBe(false);
    });

    it("returns false when template is omitted", () => {
        expect(PlatformGenerator.isValidModeTemplate(DREAME)).toBe(false);
    });

    it("falls back to Dreame template for an unknown platform", () => {
        // unknown platform resolves to the Dreame template internally
        expect(PlatformGenerator.isValidModeTemplate("unknown-platform", "vacuum_clean_zone")).toBe(true);
        expect(PlatformGenerator.isValidModeTemplate("unknown-platform", "missing")).toBe(false);
    });

    it("returns false for empty-string template name", () => {
        expect(PlatformGenerator.isValidModeTemplate(DREAME, "")).toBe(false);
    });
});

describe("PlatformGenerator.getModeTemplate", () => {
    it("returns the full config of an existing template", () => {
        const mode = PlatformGenerator.getModeTemplate(DREAME, "vacuum_clean_zone");
        expect(mode).toBeDefined();
        expect(mode.name).toBe("map_mode.vacuum_clean_zone");
        expect(mode.icon).toBe("mdi:select-drag");
        expect(mode.selection_type).toBe("MANUAL_RECTANGLE");
        expect(mode.repeats_type).toBe("EXTERNAL");
        expect(mode.max_repeats).toBe(3);
        expect(mode.max_selections).toBe(20);
        expect(mode.service_call_schema?.service).toBe("dreame_vacuum.vacuum_clean_zone");
    });

    it("returns the segment template config", () => {
        const mode = PlatformGenerator.getModeTemplate(DREAME, "vacuum_clean_segment");
        expect(mode.selection_type).toBe("ROOM");
        expect(mode.max_selections).toBe(60);
        expect(mode.service_call_schema?.service).toBe("dreame_vacuum.vacuum_clean_segment");
    });

    it("returns the goto template with NONE repeats", () => {
        const mode = PlatformGenerator.getModeTemplate(DREAME, "vacuum_goto");
        expect(mode.repeats_type).toBe("NONE");
        expect(mode.max_repeats).toBe(0);
        expect(mode.max_selections).toBe(1);
    });

    it("returns undefined for an unknown template name (no entry in templates map)", () => {
        // Real behaviour: lookup of a missing key yields undefined, no throw.
        expect(PlatformGenerator.getModeTemplate(DREAME, "no_such_template")).toBeUndefined();
    });

    it("resolves an unknown platform to the Dreame template", () => {
        const mode = PlatformGenerator.getModeTemplate("unknown", "vacuum_clean_point");
        expect(mode.selection_type).toBe("MANUAL_POINT");
        expect(mode.service_call_schema?.service).toBe("dreame_vacuum.vacuum_clean_spot");
    });
});

describe("PlatformGenerator.generateDefaultModes", () => {
    it("returns one mode per default template, each wrapping only the template name", () => {
        const modes = PlatformGenerator.generateDefaultModes(DREAME);
        expect(modes).toEqual([
            { template: "vacuum_clean_zone" },
            { template: "vacuum_clean_segment" },
            { template: "vacuum_clean_point" },
            { template: "vacuum_goto" },
        ]);
    });

    it("each returned default template is a valid template", () => {
        const modes = PlatformGenerator.generateDefaultModes(DREAME);
        for (const m of modes) {
            expect(PlatformGenerator.isValidModeTemplate(DREAME, m.template)).toBe(true);
        }
    });

    it("falls back to the Dreame defaults for an unknown platform", () => {
        expect(PlatformGenerator.generateDefaultModes("unknown")).toEqual([
            { template: "vacuum_clean_zone" },
            { template: "vacuum_clean_segment" },
            { template: "vacuum_clean_point" },
            { template: "vacuum_goto" },
        ]);
    });
});

describe("const: VacuumState exact values", () => {
    it("exposes the exact string state values", () => {
        expect(VacuumState.CLEANING).toBe("cleaning");
        expect(VacuumState.SEGMENT_CLEANING).toBe("segment_cleaning");
        expect(VacuumState.ZONED_CLEANING).toBe("zoned_cleaning");
        expect(VacuumState.SPOT_CLEANING).toBe("spot_cleaning");
        expect(VacuumState.RETURNING).toBe("returning");
        expect(VacuumState.PAUSED).toBe("paused");
        expect(VacuumState.DOCKED).toBe("docked");
        expect(VacuumState.IDLE).toBe("idle");
        expect(VacuumState.CHARGING).toBe("charging");
        expect(VacuumState.CHARGING_COMPLETED).toBe("charging_completed");
    });

    it("contains exactly the expected set of keys", () => {
        expect(Object.keys(VacuumState).sort()).toEqual(
            [
                "CHARGING",
                "CHARGING_COMPLETED",
                "CLEANING",
                "DOCKED",
                "IDLE",
                "PAUSED",
                "RETURNING",
                "SEGMENT_CLEANING",
                "SPOT_CLEANING",
                "ZONED_CLEANING",
            ].sort(),
        );
    });
});

describe("const: ACTIVE_VACUUM_STATES", () => {
    it("contains exactly the active/moving states in order", () => {
        expect(ACTIVE_VACUUM_STATES).toEqual([
            "cleaning",
            "segment_cleaning",
            "zoned_cleaning",
            "spot_cleaning",
            "returning",
        ]);
    });

    it("includes returning but excludes resting states", () => {
        expect(ACTIVE_VACUUM_STATES).toContain("returning");
        expect(ACTIVE_VACUUM_STATES).not.toContain("docked");
        expect(ACTIVE_VACUUM_STATES).not.toContain("paused");
        expect(ACTIVE_VACUUM_STATES).not.toContain("idle");
    });
});

describe("const: ACTIVELY_CLEANING_STATES", () => {
    it("contains exactly the actively-cleaning states in order", () => {
        expect(ACTIVELY_CLEANING_STATES).toEqual([
            "cleaning",
            "segment_cleaning",
            "zoned_cleaning",
            "paused",
        ]);
    });

    it("includes paused but excludes returning and spot_cleaning", () => {
        expect(ACTIVELY_CLEANING_STATES).toContain("paused");
        expect(ACTIVELY_CLEANING_STATES).not.toContain("returning");
        expect(ACTIVELY_CLEANING_STATES).not.toContain("spot_cleaning");
    });
});

describe("const: RESTING_VACUUM_STATES", () => {
    it("contains exactly the resting states in order", () => {
        expect(RESTING_VACUUM_STATES).toEqual([
            "docked",
            "idle",
            "charging",
            "charging_completed",
        ]);
    });

    it("does not overlap with the active states", () => {
        for (const s of RESTING_VACUUM_STATES) {
            expect(ACTIVE_VACUUM_STATES).not.toContain(s);
        }
    });
});

describe("const: DISCONNECTION_TIME", () => {
    it("is 360000 ms (6 minutes)", () => {
        expect(DISCONNECTION_TIME).toBe(360000);
        expect(DISCONNECTION_TIME).toBe(6 * 60 * 1000);
    });
});
