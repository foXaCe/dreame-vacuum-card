import { ActionHandlerEvent, handleAction, HomeAssistant } from "../ha";

import { ActionableObjectConfig, ActionHandlerFunction, ReplacedKey, VariablesStorage } from "../types/types";
import { ServiceCallSchema } from "../model/map_mode/service-call-schema";
import { TemplatableItemValue } from "../model/map_mode/templatable-value";
import { getFilledTemplate } from "../template-utils";
// Import de type uniquement : casse le cycle d'import carte <-> utils au runtime.
import type { XiaomiVacuumMapCard } from "../dreame-vacuum-card";

export function createActionWithConfigHandler(
    node: XiaomiVacuumMapCard,
    config: ActionableObjectConfig | undefined,
    action?: string
): ActionHandlerFunction {
    if (action) {
        return (): void => handleActionWithConfig(node, config, action);
    }
    return (ev?: ActionHandlerEvent): void => handleActionWithConfig(node, config, ev?.detail?.action ?? "tap");
}

export function handleActionWithConfig(
    node: XiaomiVacuumMapCard,
    config: ActionableObjectConfig | undefined,
    action: string
): void {
    if (node.hass && config && action) {
        const currentPreset = node._getCurrentPreset();
        const currentMode = node._getCurrentMode();
        let itemVariables: VariablesStorage = {};
        itemVariables[TemplatableItemValue.VACUUM_ENTITY_ID] = currentPreset.entity;
        const cfg = config as Record<string, ReplacedKey>;
        if (config.hasOwnProperty("attribute")) {
            itemVariables[TemplatableItemValue.ATTRIBUTE] = cfg["attribute"];
        }
        if (config.hasOwnProperty("variables")) {
            itemVariables = { ...itemVariables, ...config.variables };
        }
        const entity_id = config.hasOwnProperty("entity") ? (cfg["entity"] as string) : currentPreset.entity;
        const { selection, variables } = node._getSelection(currentMode);
        const defaultVariables = ServiceCallSchema.getDefaultVariables(entity_id, selection, node.repeats);
        const filled = getFilledTemplate(
            config as Record<string, unknown>,
            defaultVariables,
            itemVariables,
            node.internalVariables,
            currentMode?.variables ?? {},
            variables
        );
        handleAction(node, node.hass as unknown as HomeAssistant, filled as ActionableObjectConfig, action);
    }
}
