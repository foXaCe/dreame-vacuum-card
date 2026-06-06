// home-assistant/frontend/src/data/entity_attributes.ts

import checkValidDate from "./check_valid_date";
import { formatDate } from "./format_date";
import { formatDateTimeWithSeconds } from "./format_date_time";
import { formatNumber } from "./format_number";
import { isDate } from "./is_date";
import { isTimestamp } from "./is_timestamp";
import { HomeAssistantFixed } from "../../types/fixes";
import { computeAttributeValueDisplay } from "./compute_attribute_display";
import { HassEntity } from "home-assistant-js-websocket";

export function formatAttributeValue(hass: HomeAssistantFixed, stateObj: HassEntity, attribute: string): string {
    const value = stateObj.attributes[attribute];

    if (value === null) {
        return "—";
    }

    // YAML handling
    if (
        (Array.isArray(value) && value.some((val) => val instanceof Object)) ||
        (!Array.isArray(value) && value instanceof Object)
    ) {
        return JSON.stringify(value);
    }

    if (typeof value === "number") {
        return formatNumber(value, hass.locale);
    }

    if (typeof value === "string" && isDate(value, true)) {
        // Timestamp handling
        if (isTimestamp(value)) {
            const date = new Date(value);
            if (checkValidDate(date)) {
                return formatDateTimeWithSeconds(date, hass.locale);
            }
        }

        // Value was not a timestamp, so only do date formatting
        const date = new Date(value);
        if (checkValidDate(date)) {
            return formatDate(date, hass.locale);
        }
    }

    return Array.isArray(value)
        ? value.join(", ")
        : computeAttributeValueDisplay(hass.localize, stateObj, hass.locale, hass.entities, attribute);
}
