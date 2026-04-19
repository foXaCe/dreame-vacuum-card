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
                height: 4px;
                background: var(--secondary-background-color, rgba(255, 255, 255, 0.1));
                border-radius: 2px;
                overflow: hidden;
            }

            .progress-fill {
                height: 100%;
                background: #3b82f6;
                border-radius: 2px;
                transition: width 1s ease;
            }

            .progress-text {
                font-size: var(--dvc-progress-font-size, 12px);
                font-weight: 600;
                color: var(--secondary-text-color, rgba(255, 255, 255, 0.6));
                min-width: 32px;
                text-align: right;
            }
        `;
    }
}
