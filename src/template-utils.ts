/**
 * Template / variable substitution helpers.
 *
 * Kept in a dedicated module to break the import cycle between
 * `utils.ts` and `model/map_mode/*` — those modules consume template
 * primitives without pulling the rest of the utilities tree.
 */

import { KeyReplacer, ReplacedKey, VariablesStorage } from "./types/types";
import { HomeAssistantFixed } from "./types/fixes";
import { Modifier } from "./model/map_mode/modifier";

export function replaceInTarget(target: Record<string, unknown>, keyReplacer: KeyReplacer): void {
    for (const [key, value] of Object.entries(target)) {
        if (typeof value === "object" && value !== null) {
            replaceInTarget(value as Record<string, unknown>, keyReplacer);
        } else if (typeof value === "string") {
            target[key] = keyReplacer(value);
        }
    }
}

export function getReplacedValue(value: string, variables: VariablesStorage): ReplacedKey {
    const vars = Object.fromEntries(Object.entries(variables ?? {}).map(([k, v]) => [`[[${k}]]`, v]));
    const fullValueReplacer = (v: string): ReplacedKey | null => (v in vars ? vars[v] : null);
    return fullValueReplacer(value) ?? replaceInStr(value, vars, fullValueReplacer);
}

export function replaceInStr(
    value: string,
    variables: VariablesStorage,
    kr: (key: string) => ReplacedKey | null
): ReplacedKey {
    let output = value;
    Object.keys(variables).forEach((tv) => {
        let replaced = kr(tv);
        if (typeof replaced === "object") {
            replaced = JSON.stringify(replaced);
        }
        output = output.replaceAll(tv, `${replaced}`);
    });
    if (output.endsWith(Modifier.JSONIFY)) {
        return JSON.parse(output.replace(Modifier.JSONIFY, ""));
    }
    return output;
}

export function getFilledTemplate(
    template: Record<string, unknown>,
    ...variablesStorages: VariablesStorage[]
): ReplacedKey {
    const target = JSON.parse(JSON.stringify(template));
    let variables: VariablesStorage = {};
    for (const variablesStorage of variablesStorages) {
        variables = { ...variablesStorage, ...variables };
    }
    const keyReplacer = (v: string): ReplacedKey => getReplacedValue(v, variables);
    replaceInTarget(target, keyReplacer);
    return target;
}

export async function evaluateJinjaTemplate(
    hass: HomeAssistantFixed,
    template: string
): Promise<string | Record<string, unknown>> {
    return new Promise((resolve, reject) => {
        let settled = false;
        let unsubscribe: (() => void) | undefined;
        hass.connection
            .subscribeMessage(
                (msg: { result: string | Record<string, unknown> }) => {
                    if (settled) return;
                    settled = true;
                    resolve(msg.result);
                    unsubscribe?.();
                },
                { type: "render_template", template: template }
            )
            .then((unsub) => {
                if (settled) {
                    unsub();
                } else {
                    unsubscribe = unsub;
                }
            })
            .catch(reject);
    });
}
