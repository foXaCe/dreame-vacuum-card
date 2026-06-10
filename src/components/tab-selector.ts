import { LitElement, html, css, TemplateResult, CSSResultGroup } from "lit";
import { customElement, property } from "lit/decorators.js";

import { localize } from "../localize/localize";

@customElement("dreame-tab-selector")
export class DreameTabSelector extends LitElement {
    @property({ type: String })
    public activeTab = "room";

    @property({ type: String })
    public language = "";

    static get styles(): CSSResultGroup {
        return css`
            :host {
                display: block;
            }
            /* Segmented control façon iOS : track arrondi, segment actif en pilule surélevée. */
            .tabs {
                display: flex;
                gap: 4px;
                margin: 10px 14px 4px;
                padding: 3px;
                background: color-mix(in srgb, var(--primary-text-color, #000) 6%, transparent);
                border: 0.5px solid var(--dvc-hairline, transparent);
                border-radius: 14px;
            }
            .tab {
                flex: 1;
                padding: 7px 4px;
                text-align: center;
                cursor: pointer;
                background: transparent;
                border: none;
                border-radius: 11px;
                color: var(--secondary-text-color);
                font-size: var(--dvc-tab-font-size, 14px);
                font-weight: 510;
                letter-spacing: -0.01em;
                font-family: inherit;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: var(--dvc-tab-gap, 4px);
                -webkit-tap-highlight-color: transparent;
                transition:
                    color var(--dvc-dur-tap, 180ms) var(--dvc-ease-out, ease),
                    background-color var(--dvc-dur-tap, 180ms) var(--dvc-ease-out, ease),
                    box-shadow var(--dvc-dur-tap, 180ms) var(--dvc-ease-out, ease),
                    transform var(--dvc-dur-tap, 180ms) var(--dvc-ease-out, ease);
            }
            @media (hover: hover) {
                .tab:not(.active):hover {
                    color: var(--primary-text-color);
                }
            }
            .tab:active {
                transform: scale(0.96);
            }
            .tab.active {
                color: var(--primary-text-color);
                background: var(--dvc-glass-tint-strong, var(--card-background-color, #fff));
                box-shadow: var(--dvc-shadow-1);
                font-weight: 600;
            }
            .tab.active ha-icon {
                color: var(--primary-color);
            }
            .tab ha-icon {
                --mdc-icon-size: var(--dvc-tab-icon-size, 20px);
            }
        `;
    }

    protected render(): TemplateResult {
        return html`
            <div class="tabs" part="tabs" role="tablist">
                <button
                    class="tab ${this.activeTab === "room" ? "active" : ""}"
                    part="tab tab-room${this.activeTab === "room" ? " tab-active" : ""}"
                    role="tab"
                    aria-selected=${this.activeTab === "room"}
                    @click=${(): void => this._selectTab("room")}
                >
                    <ha-icon icon="mdi:floor-plan"></ha-icon>
                    ${localize("dreame_ui.tab.room", this.language)}
                </button>
                <button
                    class="tab ${this.activeTab === "all" ? "active" : ""}"
                    part="tab tab-all${this.activeTab === "all" ? " tab-active" : ""}"
                    role="tab"
                    aria-selected=${this.activeTab === "all"}
                    @click=${(): void => this._selectTab("all")}
                >
                    <ha-icon icon="mdi:home"></ha-icon>
                    ${localize("dreame_ui.tab.all", this.language)}
                </button>
                <button
                    class="tab ${this.activeTab === "zone" ? "active" : ""}"
                    part="tab tab-zone${this.activeTab === "zone" ? " tab-active" : ""}"
                    role="tab"
                    aria-selected=${this.activeTab === "zone"}
                    @click=${(): void => this._selectTab("zone")}
                >
                    <ha-icon icon="mdi:select-drag"></ha-icon>
                    ${localize("dreame_ui.tab.zone", this.language)}
                </button>
            </div>
        `;
    }

    private _selectTab(tab: string): void {
        if (this.activeTab !== tab) {
            this.activeTab = tab;
            this.dispatchEvent(
                new CustomEvent("tab-changed", {
                    detail: { tab },
                    bubbles: true,
                    composed: true,
                })
            );
        }
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "dreame-tab-selector": DreameTabSelector;
    }
}
