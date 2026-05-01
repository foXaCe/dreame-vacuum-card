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
            .tabs {
                display: flex;
                border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
            }
            .tab {
                flex: 1;
                padding: var(--dvc-tab-padding, 10px 0);
                text-align: center;
                cursor: pointer;
                background: none;
                border: none;
                border-bottom: 2px solid transparent;
                color: var(--secondary-text-color);
                font-size: var(--dvc-tab-font-size, 14px);
                font-family: inherit;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: var(--dvc-tab-gap, 4px);
                transition: all 0.2s ease;
            }
            .tab:hover {
                background: var(--secondary-background-color, rgba(0, 0, 0, 0.05));
            }
            .tab.active {
                color: var(--primary-color);
                border-bottom-color: var(--primary-color);
                font-weight: 500;
            }
            .tab ha-icon {
                --mdc-icon-size: var(--dvc-tab-icon-size, 20px);
            }
        `;
    }

    protected render(): TemplateResult {
        return html`
            <div class="tabs" part="tabs">
                <button
                    class="tab ${this.activeTab === "room" ? "active" : ""}"
                    part="tab tab-room${this.activeTab === "room" ? " tab-active" : ""}"
                    @click=${(): void => this._selectTab("room")}
                >
                    <ha-icon icon="mdi:floor-plan"></ha-icon>
                    ${localize("dreame_ui.tab.room", this.language)}
                </button>
                <button
                    class="tab ${this.activeTab === "all" ? "active" : ""}"
                    part="tab tab-all${this.activeTab === "all" ? " tab-active" : ""}"
                    @click=${(): void => this._selectTab("all")}
                >
                    <ha-icon icon="mdi:home"></ha-icon>
                    ${localize("dreame_ui.tab.all", this.language)}
                </button>
                <button
                    class="tab ${this.activeTab === "zone" ? "active" : ""}"
                    part="tab tab-zone${this.activeTab === "zone" ? " tab-active" : ""}"
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
