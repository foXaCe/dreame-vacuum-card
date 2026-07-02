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
            /* Segmented control façon iOS : track arrondi, pilule active qui GLISSE
               d'un segment à l'autre (indicateur décoratif sous les boutons — la
               géométrie/hit-zone des onglets ne change pas). */
            .tabs {
                position: relative;
                display: flex;
                gap: 4px;
                margin: 10px 14px 4px;
                padding: 3px;
                background: color-mix(in oklab, var(--primary-text-color, #000) 6%, transparent);
                border: 0.5px solid var(--dvc-hairline, transparent);
                border-radius: 14px;
            }
            .tab-indicator {
                position: absolute;
                top: 3px;
                bottom: 3px;
                left: 3px;
                /* 3 segments : largeur = (track - 2×3px padding - 2×4px gaps) / 3 ;
                   le pas de glissement = sa propre largeur + le gap. */
                width: calc((100% - 6px - 8px) / 3);
                border-radius: 11px;
                background: var(--dvc-glass-tint-strong, var(--card-background-color, #fff));
                box-shadow: var(--dvc-shadow-1);
                transform: translateX(calc(var(--dvc-tab-index, 0) * (100% + 4px)));
                transition: transform 280ms var(--dvc-ease, cubic-bezier(0.32, 0.72, 0, 1));
                will-change: transform;
                pointer-events: none;
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
                position: relative;
                z-index: 1;
                transition:
                    color var(--dvc-dur-tap, 180ms) var(--dvc-ease-out, ease),
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
            .tab:focus-visible {
                outline: 2px solid var(--primary-color);
                outline-offset: 2px;
                border-radius: var(--dvc-radius-pill, 980px);
            }
            .tab.active {
                color: var(--primary-text-color);
                font-weight: 600;
            }
            .tab.active ha-icon {
                color: var(--primary-color);
            }
            .tab ha-icon {
                --mdc-icon-size: var(--dvc-tab-icon-size, 20px);
            }
            @media (prefers-reduced-motion: reduce) {
                .tab-indicator {
                    transition: none;
                }
            }
        `;
    }

    private static readonly _TAB_ORDER = ["room", "all", "zone"];

    protected render(): TemplateResult {
        const tabIndex = Math.max(0, DreameTabSelector._TAB_ORDER.indexOf(this.activeTab));
        return html`
            <div
                class="tabs"
                part="tabs"
                role="tablist"
                style="--dvc-tab-index: ${tabIndex}"
                @keydown=${this._handleTablistKeydown}
            >
                <div class="tab-indicator" aria-hidden="true"></div>
                <button
                    class="tab ${this.activeTab === "room" ? "active" : ""}"
                    part="tab tab-room${this.activeTab === "room" ? " tab-active" : ""}"
                    role="tab"
                    aria-selected=${this.activeTab === "room"}
                    tabindex=${this.activeTab === "room" ? "0" : "-1"}
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
                    tabindex=${this.activeTab === "all" ? "0" : "-1"}
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
                    tabindex=${this.activeTab === "zone" ? "0" : "-1"}
                    @click=${(): void => this._selectTab("zone")}
                >
                    <ha-icon icon="mdi:select-drag"></ha-icon>
                    ${localize("dreame_ui.tab.zone", this.language)}
                </button>
            </div>
        `;
    }

    /** Pattern WAI-ARIA tabs : flèches gauche/droite (avec wrap) + Home/End. */
    private _handleTablistKeydown(ev: KeyboardEvent): void {
        const order = DreameTabSelector._TAB_ORDER;
        const current = order.indexOf(this.activeTab);
        let next: number;
        switch (ev.key) {
            case "ArrowRight":
                next = (current + 1) % order.length;
                break;
            case "ArrowLeft":
                next = (current - 1 + order.length) % order.length;
                break;
            case "Home":
                next = 0;
                break;
            case "End":
                next = order.length - 1;
                break;
            default:
                return;
        }
        ev.preventDefault();
        this._selectTab(order[next]);
        // Déplace le focus sur l'onglet nouvellement actif (roving focus).
        this.updateComplete.then(() => {
            (this.shadowRoot?.querySelectorAll<HTMLButtonElement>(".tab") ?? [])[next]?.focus();
        });
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
