import * as tasshackDreameVacuumTemplate from "./platform_templates/Tasshack_dreame-vacuum.json";
import { CalibrationPoint, MapModeConfig, PlatformTemplate, VariablesStorage } from "../../types/types";

export class PlatformGenerator {
    public static TASSHACK_DREAME_VACUUM_PLATFORM = "Dreame";

    private static TEMPLATES = new Map<string, PlatformTemplate>([
        [PlatformGenerator.TASSHACK_DREAME_VACUUM_PLATFORM, tasshackDreameVacuumTemplate as PlatformTemplate],
    ]);

    public static getPlatformsWithDefaultCalibration(): string[] {
        return [PlatformGenerator.TASSHACK_DREAME_VACUUM_PLATFORM];
    }

    public static getPlatforms(): string[] {
        return Array.from(PlatformGenerator.TEMPLATES.keys());
    }

    public static getPlatformName(platform: string | undefined): string {
        if (!platform) {
            return PlatformGenerator.TASSHACK_DREAME_VACUUM_PLATFORM;
        }
        // Support legacy platform names
        if (platform === "Tasshack/dreame-vacuum" || platform === "tasshackDreameVacuum") {
            return PlatformGenerator.TASSHACK_DREAME_VACUUM_PLATFORM;
        }
        return platform;
    }

    public static isValidModeTemplate(platform: string, template?: string): boolean {
        return (
            template !== undefined &&
            Object.keys(this.getPlatformTemplate(platform).map_modes.templates).includes(template)
        );
    }

    public static getModeTemplate(platform: string, template: string): MapModeConfig {
        return this.getPlatformTemplate(platform).map_modes.templates[template];
    }

    public static generateDefaultModes(platform: string): MapModeConfig[] {
        return this.getPlatformTemplate(platform).map_modes.default_templates.map((dt) => ({ template: dt }));
    }

    public static getCalibration(platform: string | undefined): CalibrationPoint[] | undefined {
        return this.getPlatformTemplate(PlatformGenerator.getPlatformName(platform)).calibration_points;
    }

    public static getVariables(platform: string | undefined): VariablesStorage | undefined {
        return this.getPlatformTemplate(PlatformGenerator.getPlatformName(platform)).internal_variables;
    }

    private static getPlatformTemplate(platform: string): PlatformTemplate {
        return (
            this.TEMPLATES.get(platform) ??
            this.TEMPLATES.get(this.TASSHACK_DREAME_VACUUM_PLATFORM) ??
            (tasshackDreameVacuumTemplate as PlatformTemplate)
        );
    }
}
