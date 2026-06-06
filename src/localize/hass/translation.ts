// home-assistant/frontend/src/data/translation.ts

export enum NumberFormat {
    language = "language",
    system = "system",
    comma_decimal = "comma_decimal",
    decimal_comma = "decimal_comma",
    space_comma = "space_comma",
    none = "none",
}

export enum TimeFormat {
    language = "language",
    system = "system",
    am_pm = "12",
    twenty_four = "24",
}

export enum FirstWeekday {
    language = "language",
    monday = "monday",
    tuesday = "tuesday",
    wednesday = "wednesday",
    thursday = "thursday",
    friday = "friday",
    saturday = "saturday",
    sunday = "sunday",
}

export interface FrontendLocaleData {
    language: string;
    number_format: NumberFormat;
    time_format: TimeFormat;
    first_weekday: FirstWeekday;
}

declare global {
    interface FrontendUserData {
        language: FrontendLocaleData;
    }
}

export type TranslationCategory =
    | "title"
    | "state"
    | "entity"
    | "entity_component"
    | "config"
    | "config_panel"
    | "options"
    | "device_automation"
    | "mfa_setup"
    | "system_health"
    | "device_class"
    | "application_credentials"
    | "issues"
    | "selector";
