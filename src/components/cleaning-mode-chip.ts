import { LitElement, html, css, TemplateResult, CSSResultGroup, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";

import { HomeAssistantFixed } from "../types/fixes";
import { localize } from "../localize/localize";
import { computeStateDisplay } from "../localize/hass/compute_state_display";

@customElement("dreame-cleaning-mode-chip")
export class CleaningModeChip extends LitElement {
    @property({ attribute: false })
    public hass!: HomeAssistantFixed;

    @property({ attribute: false })
    public entityId!: string;

    private _cachedModeEntityId: string | null | undefined = undefined;
    private _cachedModeEntityKey: string | undefined = undefined;

    private _getCleaningModeEntity(): string | undefined {
        if (!this.hass || !this.entityId) return undefined;

        if (this._cachedModeEntityId !== undefined && this._cachedModeEntityKey === this.entityId) {
            return this._cachedModeEntityId ?? undefined;
        }

        this._cachedModeEntityKey = this.entityId;
        const deviceId = this.hass.entities[this.entityId]?.device_id;
        if (!deviceId) {
            this._cachedModeEntityId = null;
            return undefined;
        }
        const found = Object.keys(this.hass.states).find((eid) => {
            const entry = this.hass!.entities[eid];
            return entry?.device_id === deviceId && eid.startsWith("select.") && eid.includes("cleaning_mode");
        });
        this._cachedModeEntityId = found ?? null;
        return found;
    }

    private _getModeIcons(mode: string): string[] {
        const lower = mode.toLowerCase();
        if (lower.includes("sweep") && lower.includes("mop")) {
            return ["mdi:robot-vacuum", "mdi:water-outline"];
        }
        if (lower.includes("sweep")) {
            return ["mdi:robot-vacuum"];
        }
        if (lower.includes("mop")) {
            return ["mdi:water-outline"];
        }
        return ["mdi:robot-vacuum"];
    }

    private _handleClick(): void {
        const selectEntityId = this._getCleaningModeEntity();
        if (!selectEntityId || !this.hass) return;

        const stateObj = this.hass.states[selectEntityId];
        if (!stateObj) return;

        const options: string[] | undefined = stateObj.attributes.options;
        if (!options || options.length === 0) return;

        const currentIndex = options.indexOf(stateObj.state);
        const nextIndex = (currentIndex + 1) % options.length;
        const nextOption = options[nextIndex];

        this.hass.callService("select", "select_option", {
            entity_id: selectEntityId,
            option: nextOption,
        });
    }

    protected render(): TemplateResult | typeof nothing {
        if (!this.hass || !this.entityId) {
            return nothing;
        }

        const selectEntityId = this._getCleaningModeEntity();
        if (!selectEntityId) {
            return nothing;
        }

        const stateObj = this.hass.states[selectEntityId];
        if (!stateObj) {
            return nothing;
        }

        const currentMode = stateObj.state;
        const lang = this.hass.locale?.language;
        const translatedMode = computeStateDisplay(this.hass.localize, stateObj, this.hass.locale, this.hass.entities);
        const modeLabel = localize("tile.cleaning_mode.label", lang);
        const options: string[] | undefined = stateObj.attributes.options;
        const icons = this._getModeIcons(currentMode);

        const displayLabel = `${modeLabel}: ${translatedMode}`;

        return html`
            <div
                class="mode-chip"
                @click="${this._handleClick}"
                title="${options
                    ? localize(["dreame_ui.mode.cycle_tooltip", "{0}", `${options.length}`], this.hass.locale?.language)
                    : ""}"
            >
                <div class="mode-icons">
                    ${icons.map((icon) => html`<ha-icon class="mode-icon" icon="${icon}"></ha-icon>`)}
                </div>
                <span class="mode-label">${displayLabel}</span>
                <ha-icon class="mode-arrow" icon="mdi:chevron-right"></ha-icon>
            </div>
        `;
    }

    static get styles(): CSSResultGroup {
        return css`
            :host {
                display: block;
                padding: var(--dvc-chip-host-padding, 4px 16px);
            }

            .mode-chip {
                display: flex;
                align-items: center;
                gap: var(--dvc-chip-gap, 8px);
                background: var(--secondary-background-color, rgba(0, 0, 0, 0.1));
                border-radius: 20px;
                padding: var(--dvc-chip-padding, 10px 16px);
                cursor: pointer;
                transition: background 0.2s;
            }

            .mode-chip:hover {
                background: var(--primary-background-color, rgba(0, 0, 0, 0.15));
            }

            .mode-icons {
                display: flex;
                align-items: center;
                gap: 2px;
            }

            .mode-icon {
                color: var(--primary-color);
                --mdc-icon-size: 20px;
            }

            .mode-label {
                flex: 1;
                font-size: var(--dvc-chip-font-size, 14px);
                color: var(--primary-text-color);
            }

            .mode-arrow {
                color: var(--secondary-text-color);
                --mdc-icon-size: 18px;
            }
        `;
    }
}
