import { LitElement, html, css, TemplateResult, CSSResultGroup, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";

import { HomeAssistantFixed } from "../types/fixes";

@customElement("dreame-cleaning-progress-bar")
export class CleaningProgressBar extends LitElement {
    @property({ attribute: false })
    public hass!: HomeAssistantFixed;

    @property({ type: String })
    public entityId!: string;

    private _progressEntityId: string | null | undefined = undefined;
    private _lastEntityId: string | undefined = undefined;

    private _findProgressEntity(): string | null {
        if (!this.hass || !this.entityId) return null;

        const deviceId = this.hass.entities?.[this.entityId]?.device_id;
        if (!deviceId) return null;

        for (const [eid, entry] of Object.entries(this.hass.entities)) {
            if (entry.device_id === deviceId && eid.startsWith("sensor.") && eid.endsWith("_cleaning_progress")) {
                return eid;
            }
        }

        return null;
    }

    protected render(): TemplateResult | typeof nothing {
        if (!this.hass || !this.entityId) return nothing;

        if (this._progressEntityId === undefined || this._lastEntityId !== this.entityId) {
            this._lastEntityId = this.entityId;
            this._progressEntityId = this._findProgressEntity();
        }

        if (!this._progressEntityId) return nothing;

        const progressState = this.hass.states[this._progressEntityId];
        if (!progressState) return nothing;

        const progress = Number(progressState.state);
        if (isNaN(progress) || progress <= 0) return nothing;

        return html`
            <div class="progress-container">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${Math.min(progress, 100)}%"></div>
                </div>
                <span class="progress-text">${Math.round(progress)}%</span>
            </div>
        `;
    }

    public static get styles(): CSSResultGroup {
        return css`
            :host {
                display: block;
                padding: var(--dvc-progress-host-padding, 0 16px 4px);
            }

            .progress-container {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .progress-bar {
                flex: 1;
                height: 6px;
                background: color-mix(in oklab, var(--primary-text-color, #000) 10%, transparent);
                border-radius: 980px;
                overflow: hidden;
            }

            .progress-fill {
                position: relative;
                overflow: hidden;
                height: 100%;
                border-radius: 980px;
                background: linear-gradient(
                    90deg,
                    color-mix(in oklab, var(--map-card-internal-primary-color, var(--primary-color, #0a84ff)) 78%, #fff),
                    var(--map-card-internal-primary-color, var(--primary-color, #0a84ff))
                );
                box-shadow: 0 0 8px
                    color-mix(
                        in srgb,
                        var(--map-card-internal-primary-color, var(--primary-color, #0a84ff)) 45%,
                        transparent
                    );
                transition: width 0.8s var(--dvc-ease, ease);
            }

            /* Reflet qui balaie doucement le remplissage (progression "vivante"). */
            .progress-fill::after {
                content: "";
                position: absolute;
                inset: 0;
                background: linear-gradient(105deg, transparent 20%, rgba(255, 255, 255, 0.35) 50%, transparent 80%);
                background-size: 200% 100%;
                animation: dvc-progress-shimmer 2.4s ease-in-out infinite;
                animation-play-state: var(--dvc-anim-state, running);
            }

            @keyframes dvc-progress-shimmer {
                0% {
                    background-position: 150% 0;
                }
                100% {
                    background-position: -50% 0;
                }
            }

            @media (prefers-reduced-motion: reduce) {
                .progress-fill::after {
                    animation: none;
                    background: none;
                }
            }

            .progress-text {
                font-size: var(--dvc-progress-font-size, 12px);
                font-weight: 590;
                letter-spacing: -0.01em;
                font-variant-numeric: tabular-nums;
                color: var(--primary-text-color);
                min-width: 36px;
                text-align: right;
            }
        `;
    }
}
