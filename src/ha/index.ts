/**
 * Local re-implementation of the small Home Assistant helpers we used to
 * import from `custom-card-helpers`. The upstream package is barely
 * maintained and lags behind HA's frontend evolutions, so we vendor the
 * minimal surface we actually use.
 *
 * Adapted from home-assistant/frontend (Apache-2.0 / MIT depending on file)
 * and home-assistant/custom-card-helpers (MIT).
 */

import type { Connection } from "home-assistant-js-websocket";
import type { HassEntity } from "home-assistant-js-websocket";

// ---------- Enums ----------

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

// ---------- Action types ----------

export interface ToggleActionConfig {
    action: "toggle";
}

export interface CallServiceActionConfig {
    action: "call-service";
    service: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    service_data?: Record<string, any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data?: Record<string, any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    target?: Record<string, any>;
}

export interface NavigateActionConfig {
    action: "navigate";
    navigation_path: string;
}

export interface UrlActionConfig {
    action: "url";
    url_path: string;
}

export interface MoreInfoActionConfig {
    action: "more-info";
}

export interface NoActionConfig {
    action: "none";
}

export interface CustomActionConfig {
    action: "fire-dom-event";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}

export type ActionConfig =
    | ToggleActionConfig
    | CallServiceActionConfig
    | NavigateActionConfig
    | UrlActionConfig
    | MoreInfoActionConfig
    | NoActionConfig
    | CustomActionConfig;

export interface ActionHandlerOptions {
    hasHold?: boolean;
    hasDoubleClick?: boolean;
    disabled?: boolean;
}

export interface ActionHandlerDetail {
    action: "tap" | "hold" | "double_tap";
}

export type ActionHandlerEvent = HASSDomEvent<ActionHandlerDetail>;

export interface HASSDomEvent<T> extends Event {
    detail: T;
}

// ---------- Lovelace ----------

export interface LovelaceCardConfig {
    type: string;
    [key: string]: unknown;
}

export interface LovelaceCard extends HTMLElement {
    hass?: HomeAssistant;
    isPanel?: boolean;
    editMode?: boolean;
    getCardSize(): number | Promise<number>;
    setConfig(config: LovelaceCardConfig): void;
}

export interface LovelaceCardEditor extends HTMLElement {
    hass?: HomeAssistant;
    lovelace?: unknown;
    setConfig(config: LovelaceCardConfig): void;
}

// ---------- HomeAssistant minimal interface ----------

export type HapticType = "success" | "warning" | "failure" | "light" | "medium" | "heavy" | "selection";

export interface HomeAssistant {
    states: { [entity_id: string]: HassEntity };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    config: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    services: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    user?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    locale: any;
    language: string;
    callService(
        domain: string,
        service: string,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        serviceData?: Record<string, any>,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        target?: Record<string, any>
    ): Promise<unknown>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    callWS<T>(msg: Record<string, any>): Promise<T>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    localize(key: string, ...args: any[]): string;
    connection: Connection;
}

// ---------- fireEvent ----------

export interface FireEventOptions {
    bubbles?: boolean;
    cancelable?: boolean;
    composed?: boolean;
}

export const fireEvent = <Detail = unknown>(
    node: HTMLElement | Window,
    type: string,
    detail?: Detail,
    options: FireEventOptions = {}
): Event => {
    const event = new CustomEvent(type, {
        bubbles: options.bubbles ?? true,
        cancelable: !!options.cancelable,
        composed: options.composed ?? true,
        detail: detail as Detail,
    });
    node.dispatchEvent(event);
    return event;
};

// ---------- forwardHaptic ----------

export const forwardHaptic = (hapticType: HapticType): void => {
    fireEvent(window, "haptic", hapticType);
};

// ---------- hasAction ----------

export const hasAction = (config?: { action?: string }): boolean => !!config && config.action !== "none";

// ---------- computeStateDomain ----------

export const computeStateDomain = (stateObj: HassEntity): string =>
    stateObj.entity_id.substring(0, stateObj.entity_id.indexOf("."));

// ---------- handleAction ----------

interface ActionableConfig {
    entity?: string;
    camera_image?: string;
    tap_action?: ActionConfig;
    hold_action?: ActionConfig;
    double_tap_action?: ActionConfig;
}

const DEFAULT_ACTIONS: Record<string, ActionConfig> = {
    tap: { action: "more-info" },
    hold: { action: "none" },
    double_tap: { action: "none" },
};

export const handleAction = (
    node: HTMLElement,
    hass: HomeAssistant,
    config: ActionableConfig,
    action: string
): void => {
    let actionConfig: ActionConfig | undefined;
    if (action === "double_tap" && config.double_tap_action) {
        actionConfig = config.double_tap_action;
    } else if (action === "hold" && config.hold_action) {
        actionConfig = config.hold_action;
    } else if (action === "tap" && config.tap_action) {
        actionConfig = config.tap_action;
    } else {
        actionConfig = DEFAULT_ACTIONS[action];
    }
    if (!actionConfig || actionConfig.action === "none") return;

    switch (actionConfig.action) {
        case "more-info":
            fireEvent(node, "hass-more-info", {
                entityId: config.entity || config.camera_image,
            });
            break;
        case "navigate":
            history.pushState(null, "", (actionConfig as NavigateActionConfig).navigation_path);
            fireEvent(window, "location-changed", { replace: false });
            break;
        case "url": {
            const cfg = actionConfig as UrlActionConfig;
            if (cfg.url_path) window.open(cfg.url_path);
            break;
        }
        case "toggle":
            if (config.entity) {
                hass.callService("homeassistant", "toggle", undefined, { entity_id: config.entity });
                forwardHaptic("light");
            }
            break;
        case "call-service": {
            const cfg = actionConfig as CallServiceActionConfig;
            if (!cfg.service) return;
            const [domain, service] = cfg.service.split(".", 2);
            hass.callService(domain, service, cfg.service_data ?? cfg.data, cfg.target);
            forwardHaptic("light");
            break;
        }
        case "fire-dom-event":
            fireEvent(node, "ll-custom", actionConfig);
            break;
    }
};
