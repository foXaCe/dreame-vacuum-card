/* eslint-disable @typescript-eslint/no-explicit-any */
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { fireEvent, LovelaceCardEditor } from "custom-card-helpers";

import { TranslatableString, XiaomiVacuumMapCardConfig } from "./types/types";
import { localizeWithHass } from "./localize/localize";
import { PlatformGenerator } from "./model/generators/platform-generator";
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

@customElement(EDITOR_CUSTOM_ELEMENT_NAME)
export class XiaomiVacuumMapCardEditor extends LitElement implements Omit<LovelaceCardEditor, "hass"> {
    @property({ attribute: false }) public hass?: HomeAssistantFixed;
    @state() private _config?: XiaomiVacuumMapCardConfig;
    @state() private _helpers?: any;
    private _initialized = false;

    get _showTitle(): boolean {
        return this._config?.show_title ?? false;
    }

    get _entity(): string {
        return this._config?.entity || "";
    }

    get _camera(): string {
        return this._config?.map_source?.camera || "";
    }

    get _mapLocked(): boolean {
        return this._config?.map_locked ?? false;
    }

    get _twoFingerPan(): boolean {
        return this._config?.two_finger_pan ?? false;
    }

    get _cleanSelectionOnStart(): boolean {
        return this._config?.clean_selection_on_start ?? true;
    }

    get _language(): string {
        return this._config?.language || "";
    }

    public setConfig(config: XiaomiVacuumMapCardConfig): void {
        this._config = config;
        this.loadCardHelpers();
    }

    protected shouldUpdate(): boolean {
        if (!this._initialized) {
            this._initialize();
        }
        return true;
    }

    protected render(): TemplateResult | void {
        if (!this.hass || !this._helpers) {
            return html``;
        }

        this._helpers.importMoreInfoControl("climate");

        const entityIds = Object.keys(this.hass.states);
        const cameras = entityIds.filter((e) => ["camera", "image"].includes(e.substring(0, e.indexOf("."))));
        const vacuums = entityIds.filter((e) => e.substring(0, e.indexOf(".")) === "vacuum");

        return html`
            <div class="card-config">
                <div class="values">
                    <ha-select
                        naturalMenuWidth
                        fixedMenuPosition
                        label="${this._localize("editor.label.entity")}"
                        @selected="${this._valueChanged}"
                        @closed="${(ev) => ev.stopPropagation()}"
                        .configValue="${"entity"}"
                        .value="${this._entity}"
                    >
                        ${vacuums.map((entity) => {
                            return html` <mwc-list-item .value="${entity}">${entity}</mwc-list-item> `;
                        })}
                    </ha-select>
                </div>
                <div class="values">
                    <ha-select
                        naturalMenuWidth
                        fixedMenuPosition
                        label="${this._localize("editor.label.camera")}"
                        @selected="${this._cameraChanged}"
                        @closed="${(ev) => ev.stopPropagation()}"
                        .configValue="${"camera"}"
                        .value="${this._camera}"
                    >
                        ${cameras.map((entity) => {
                            return html` <mwc-list-item .value="${entity}">${entity}</mwc-list-item> `;
                        })}
                    </ha-select>
                </div>

                <ha-expansion-panel .header="${this._localize("editor.section.display")}" outlined>
                    <div class="expansion-content">
                        <div class="values">
                            <ha-formfield .label="${this._localize("editor.label.show_title")}">
                                <ha-switch
                                    .checked="${this._showTitle}"
                                    .configValue="${"show_title"}"
                                    @change="${this._valueChanged}"
                                ></ha-switch>
                            </ha-formfield>
                        </div>
                        <div class="values">
                            <ha-select
                                naturalMenuWidth
                                fixedMenuPosition
                                label="${this._localize("editor.label.language")}"
                                @selected="${this._valueChanged}"
                                @closed="${(ev) => ev.stopPropagation()}"
                                .configValue="${"language"}"
                                .value="${this._language}"
                            >
                                ${AVAILABLE_LANGUAGES.map(
                                    (lang) => html`
                                        <mwc-list-item .value="${lang.value}">${lang.label}</mwc-list-item>
                                    `
                                )}
                            </ha-select>
                        </div>
                    </div>
                </ha-expansion-panel>

                <ha-expansion-panel .header="${this._localize("editor.section.map_behavior")}" outlined>
                    <div class="expansion-content">
                        <div class="values">
                            <ha-formfield .label="${this._localize("editor.label.map_locked")}">
                                <ha-switch
                                    .checked="${this._mapLocked}"
                                    .configValue="${"map_locked"}"
                                    @change="${this._valueChanged}"
                                ></ha-switch>
                            </ha-formfield>
                        </div>
                        <div class="values">
                            <ha-formfield .label="${this._localize("editor.label.two_finger_pan")}">
                                <ha-switch
                                    .checked="${this._twoFingerPan}"
                                    .configValue="${"two_finger_pan"}"
                                    @change="${this._valueChanged}"
                                ></ha-switch>
                            </ha-formfield>
                        </div>
                        <div class="values">
                            <ha-formfield .label="${this._localize("editor.label.clean_selection_on_start")}">
                                <ha-switch
                                    .checked="${this._cleanSelectionOnStart}"
                                    .configValue="${"clean_selection_on_start"}"
                                    @change="${this._valueChanged}"
                                ></ha-switch>
                            </ha-formfield>
                        </div>
                    </div>
                </ha-expansion-panel>

                <div class="yaml-hint">${this._localize("editor.description.text")}</div>
            </div>
        `;
    }

    private _initialize(): void {
        if (this.hass === undefined) return;
        if (this._config === undefined) return;
        if (this._helpers === undefined) return;
        this._initialized = true;
    }

    private async loadCardHelpers(): Promise<void> {
        this._helpers = await (window as any).loadCardHelpers();
    }

    private _cameraChanged(ev): void {
        if (!this._config || !this.hass) {
            return;
        }
        const value = ev.target.value;
        if (this._camera === value) return;
        const tmpConfig = { ...this._config };
        tmpConfig["map_source"] = { camera: value };
        if (
            !PlatformGenerator.getCalibration(this._config.vacuum_platform) &&
            !tmpConfig["calibration_source"] &&
            "calibration_points" in this.hass.states[value].attributes
        ) {
            tmpConfig["calibration_source"] = { camera: true };
        }
        this._config = tmpConfig;
        fireEvent(this, "config-changed", { config: this._config });
    }

    private _valueChanged(ev): void {
        if (!this._config || !this.hass) {
            return;
        }
        const target = ev.target;
        if (this[`_${target.configValue}`] === target.value) {
            return;
        }
        if (!target.configValue) {
            return;
        } else {
            this._config = {
                ...this._config,
                [target.configValue]: target.checked !== undefined ? target.checked : target.value,
            };
        }
        fireEvent(this, "config-changed", { config: this._config });
    }

    private _localize(ts: TranslatableString): string {
        return localizeWithHass(ts, this.hass);
    }

    static get styles(): CSSResultGroup {
        return css`
            .card-config {
                padding-bottom: 15px;
            }

            .values {
                padding-left: 16px;
                padding-right: 16px;
                margin: 8px 0;
                display: grid;
            }

            ha-expansion-panel {
                margin: 8px 0;
            }

            .expansion-content {
                padding: 0 0 8px;
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
