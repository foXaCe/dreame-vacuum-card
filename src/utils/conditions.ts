import { ConditionalObjectConfig, ConditionConfig, ReplacedKey, VariablesStorage } from "../types/types";
import { HomeAssistantFixed } from "../types/fixes";

export function isConditionMet(
    condition: ConditionConfig,
    internalVariables: VariablesStorage,
    hass: HomeAssistantFixed
): boolean {
    let currentValue: ReplacedKey = "";
    if (condition.internal_variable && condition.internal_variable in internalVariables) {
        currentValue = internalVariables[condition.internal_variable];
    } else if (condition.entity) {
        const entity = hass.states[condition.entity];
        if (!entity) return false;
        currentValue = condition.attribute ? entity.attributes[condition.attribute] : entity.state;
    }
    if (condition.value) {
        return String(currentValue) === String(condition.value);
    }
    if (condition.value_not) {
        return String(currentValue) !== String(condition.value_not);
    }
    return false;
}

export function areConditionsMet(
    config: ConditionalObjectConfig,
    internalVariables: VariablesStorage,
    hass: HomeAssistantFixed
): boolean {
    return (config.conditions ?? []).every((condition) => isConditionMet(condition, internalVariables, hass));
}
