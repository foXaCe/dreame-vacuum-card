import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { fireEvent, LovelaceCardEditor } from "./ha";

import { TranslatableString, XiaomiVacuumMapCardConfig } from "./types/types";
import { localizeWithHass } from "./localize/localize";
import { EDITOR_CUSTOM_ELEMENT_NAME } from "./const";
import { HomeAssistantFixed } from "./types/fixes";

const AVAILABLE_LANGUAGES = [
    { value: "", label: "Auto" },
    { value: "bg", label: "Bulgarian" },
    { value: "ca", label: "Catalan" },
    { value: "cs", label: "Czech" },
    { value: "da", label: "Danish" },
    { value: "de", label: "German" },
    { value: "el", label: "Greek" },
    { value: "en", label: "English" },
    { value: "es", label: "Spanish" },
    { value: "fi", label: "Finnish" },
    { value: "fr", label: "French" },
    { value: "he", label: "Hebrew" },
    { value: "hu", label: "Hungarian" },
    { value: "is", label: "Icelandic" },
    { value: "it", label: "Italian" },
    { value: "lv", label: "Latvian" },
    { value: "nl", label: "Dutch" },
    { value: "pl", label: "Polish" },
    { value: "pt", label: "Portuguese" },
    { value: "pt-BR", label: "Brazilian Portuguese" },
    { value: "ro", label: "Romanian" },
    { value: "ru", label: "Russian" },
    { value: "sk", label: "Slovak" },
    { value: "sv", label: "Swedish" },
    { value: "tr", label: "Turkish" },
    { value: "uk", label: "Ukrainian" },
    { value: "zh", label: "Chinese (Simplified)" },
    { value: "zh-Hant", label: "Chinese (Traditional)" },
];

/**
 * Schéma `ha-form` déclaratif. Avantages vs implémentation manuelle :
 * - validation et UI native par HA (selectors riches, themes, a11y)
 * - support automatique entity/area/device pickers
 * - sections collapsibles via `type: "expandable"`
 */
interface HaFormSchema {
    name: string;
    type?: string;
    required?: boolean;
    selector?: Record<string, unknown>;
    schema?: HaFormSchema[];
    title?: string;
    expanded?: boolean;
}

const buildSchema = (): HaFormSchema[] => [
    {
        name: "entity",
        required: true,
        selector: { entity: { domain: "vacuum" } },
    },
    {
        name: "map_source",
        type: "expandable",
        title: "Map source",
        expanded: true,
        schema: [
            {
                name: "camera",
                required: true,
                selector: { entity: { domain: ["camera", "image"] } },
            },
        ],
    },
    {
        name: "display",
        type: "expandable",
        title: "Display",
        schema: [
            { name: "show_title", selector: { boolean: {} } },
            {
                name: "language",
                selector: {
                    select: {
                        mode: "dropdown",
                        options: AVAILABLE_LANGUAGES.map((l) => ({ value: l.value, label: l.label })),
                    },
                },
            },
        ],
    },
    {
        name: "map_behavior",
        type: "expandable",
        title: "Map behavior",
        schema: [
            { name: "map_locked", selector: { boolean: {} } },
            { name: "two_finger_pan", selector: { boolean: {} } },
            { name: "clean_selection_on_start", selector: { boolean: {} } },
        ],
    },
];

@customElement(EDITOR_CUSTOM_ELEMENT_NAME)
export class XiaomiVacuumMapCardEditor extends LitElement implements Omit<LovelaceCardEditor, "hass"> {
    @property({ attribute: false }) public hass?: HomeAssistantFixed;
    @state() private _config?: XiaomiVacuumMapCardConfig;

    public setConfig(config: XiaomiVacuumMapCardConfig): void {
        this._config = config;
    }

    protected render(): TemplateResult | typeof Symbol {
        if (!this.hass || !this._config) {
            return html``;
        }

        // Valeurs aplaties pour ha-form : map_source.camera vit dans une sous-section.
        const data = {
            entity: this._config.entity ?? "",
            map_source: this._config.map_source ?? { camera: "" },
            display: {
                show_title: this._config.show_title ?? false,
                language: this._config.language ?? "",
            },
            map_behavior: {
                map_locked: this._config.map_locked ?? false,
                two_finger_pan: this._config.two_finger_pan ?? false,
                clean_selection_on_start: this._config.clean_selection_on_start ?? true,
            },
        };

        return html`
            <ha-form
                .hass=${this.hass}
                .data=${data}
                .schema=${buildSchema()}
                .computeLabel=${this._computeLabel}
                @value-changed=${this._valueChanged}
            ></ha-form>
            <div class="yaml-hint">${this._localize("editor.description.text")}</div>
        `;
    }

    private _computeLabel = (schema: HaFormSchema): string => {
        const key = `editor.label.${schema.name}`;
        return this._localize(key);
    };

    private _valueChanged = (ev: CustomEvent): void => {
        if (!this._config) return;
        const value = ev.detail.value as {
            entity?: string;
            map_source?: { camera?: string };
            display?: { show_title?: boolean; language?: string };
            map_behavior?: { map_locked?: boolean; two_finger_pan?: boolean; clean_selection_on_start?: boolean };
        };

        // `XiaomiVacuumMapCardConfig` est `readonly` côté typage : on construit l'objet
        // mutable, puis on cast à la fin. Évite des spreads multiples.
        const draft: Record<string, unknown> = {
            ...this._config,
            entity: value.entity ?? this._config.entity,
            map_source: value.map_source ?? this._config.map_source,
            show_title: value.display?.show_title,
            language: value.display?.language || undefined,
            map_locked: value.map_behavior?.map_locked,
            two_finger_pan: value.map_behavior?.two_finger_pan,
            clean_selection_on_start: value.map_behavior?.clean_selection_on_start,
        };

        // Auto-attache une calibration_source caméra si l'entité caméra a des `calibration_points`
        // et qu'aucune source n'est encore configurée — préserve le wizard "happy path" du legacy.
        const newCamera = (draft.map_source as { camera?: string } | undefined)?.camera;
        if (
            this.hass &&
            newCamera &&
            !draft.calibration_source &&
            "calibration_points" in (this.hass.states[newCamera]?.attributes ?? {})
        ) {
            draft.calibration_source = { camera: true };
        }

        this._config = draft as XiaomiVacuumMapCardConfig;
        fireEvent(this, "config-changed", { config: this._config });
    };

    private _localize(ts: TranslatableString): string {
        return localizeWithHass(ts, this.hass);
    }

    static get styles(): CSSResultGroup {
        return css`
            ha-form {
                display: block;
                padding: 8px 16px 0;
            }

            .yaml-hint {
                padding: 16px;
                font-size: 12px;
                color: var(--secondary-text-color);
                font-style: italic;
                text-align: center;
            }
        `;
    }
}
