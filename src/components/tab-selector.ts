import { LitElement, html, css, TemplateResult, CSSResultGroup } from "lit";
import { property } from "lit/decorators.js";
import { safeCustomElement } from "../utils/define-element";

import { localize } from "../localize/localize";
import { CardTab } from "../model/map_mode/card-tabs";

/** Icône de chaque onglet. */
const TAB_ICONS: Record<CardTab, string> = {
    room: "mdi:floor-plan",
    all: "mdi:home",
    zone: "mdi:select-drag",
    spot: "mdi:map-marker-radius",
};

@safeCustomElement("dreame-tab-selector")
export class DreameTabSelector extends LitElement {
    @property({ type: String })
    public activeTab = "room";

    @property({ type: String })
    public language = "";

    /** Onglets affichés, dans l'ordre (« Point » n'existe que si la carte sait le servir). */
    @property({ attribute: false })
    public tabs: CardTab[] = ["room", "all", "zone"];

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
                /* N segments : largeur = (track - 2×3px padding - (N-1)×4px gaps) / N ;
                   le pas de glissement = sa propre largeur + le gap. */
                width: calc((100% - 6px - (var(--dvc-tab-count, 3) - 1) * 4px) / var(--dvc-tab-count, 3));
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

    protected render(): TemplateResult {
        const tabIndex = Math.max(0, this.tabs.indexOf(this.activeTab as CardTab));
        return html`
            <div
                class="tabs"
                part="tabs"
                role="tablist"
                style="--dvc-tab-index: ${tabIndex}; --dvc-tab-count: ${this.tabs.length}"
                @keydown=${this._handleTablistKeydown}
            >
                <div class="tab-indicator" aria-hidden="true"></div>
                ${this.tabs.map((tab) => {
                    const active = this.activeTab === tab;
                    return html`
                        <button
                            class="tab ${active ? "active" : ""}"
                            part="tab tab-${tab}${active ? " tab-active" : ""}"
                            role="tab"
                            aria-selected=${active}
                            tabindex=${active ? "0" : "-1"}
                            @click=${(): void => this._selectTab(tab)}
                        >
                            <ha-icon icon=${TAB_ICONS[tab]}></ha-icon>
                            ${localize(`dreame_ui.tab.${tab}`, this.language)}
                        </button>
                    `;
                })}
            </div>
        `;
    }

    /** Pattern WAI-ARIA tabs : flèches gauche/droite (avec wrap) + Home/End. */
    private _handleTablistKeydown(ev: KeyboardEvent): void {
        const order = this.tabs;
        const current = order.indexOf(this.activeTab as CardTab);
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
