import { LitElement, html, css, TemplateResult, CSSResultGroup, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";

import { HomeAssistantFixed } from "../types/fixes";
import { localize } from "../localize/localize";
import { computeStateDisplay } from "../localize/hass/compute_state_display";
import { ACTIVE_VACUUM_STATES } from "../const";

@customElement("dreame-status-header")
export class StatusHeader extends LitElement {
    @property({ attribute: false })
    public hass!: HomeAssistantFixed;

    @property({ attribute: false })
    public entityId!: string;

    @property({ type: Boolean })
    public showTitle = false;

    private _siblingCache = new Map<string, string | undefined>();
    private _siblingCacheEntityId: string | undefined = undefined;

    private _resolveSibling(translationKey: string, suffix: string): string | undefined {
        const cacheKey = `${translationKey}|${suffix}`;
        if (this._siblingCacheEntityId === this.entityId && this._siblingCache.has(cacheKey)) {
            return this._siblingCache.get(cacheKey);
        }

        if (this._siblingCacheEntityId !== this.entityId) {
            this._siblingCache.clear();
            this._siblingCacheEntityId = this.entityId;
        }

        const deviceId = this.hass.entities?.[this.entityId]?.device_id;
        if (!deviceId) {
            this._siblingCache.set(cacheKey, undefined);
            return undefined;
        }

        let found: string | undefined;
        for (const [eid, entry] of Object.entries(this.hass.entities)) {
            if (entry.device_id !== deviceId || !eid.startsWith("sensor.")) continue;
            if (entry.translation_key === translationKey || eid.endsWith(suffix)) {
                found = eid;
                break;
            }
        }
        this._siblingCache.set(cacheKey, found);
        return found;
    }

    protected render(): TemplateResult | typeof nothing {
        if (!this.hass || !this.entityId) {
            return nothing;
        }

        const stateObj = this.hass.states[this.entityId];
        if (!stateObj) {
            return nothing;
        }

        const friendlyName = stateObj.attributes.friendly_name ?? this.entityId;
        const lang = this.hass.locale?.language;

        const readSensor = (translationKey: string, suffix: string): number | undefined => {
            const eid = this._resolveSibling(translationKey, suffix);
            if (eid) {
                const s = this.hass.states[eid];
                if (s) {
                    const val = Number(s.state);
                    if (!isNaN(val)) return val;
                }
            }
            return undefined;
        };

        // Status: read from dedicated _state sensor, display HA-translated value
        const stateSensorId = this._resolveSibling("state", "_state");
        let statusDisplay: string;
        if (stateSensorId && this.hass.states[stateSensorId]) {
            const stateSensor = this.hass.states[stateSensorId];
            statusDisplay = computeStateDisplay(this.hass.localize, stateSensor, this.hass.locale, this.hass.entities);
        } else {
            statusDisplay = stateObj.state;
        }

        const cleanedArea: number | undefined =
            stateObj.attributes.cleaned_area ?? readSensor("cleaned_area", "_cleaned_area");
        const cleaningTime: number | undefined =
            stateObj.attributes.cleaning_time ?? readSensor("cleaning_time", "_cleaning_time");
        const batteryLevel: number | undefined =
            stateObj.attributes.battery_level ?? readSensor("battery_level", "_battery_level");

        let batteryIcon = stateObj.attributes.battery_icon ?? "mdi:battery";
        if (stateObj.attributes.battery_level === undefined) {
            const bid = this._resolveSibling("battery_level", "_battery_level");
            if (bid) {
                batteryIcon = this.hass.states[bid]?.attributes?.icon ?? "mdi:battery";
            }
        }

        const isActive = ACTIVE_VACUUM_STATES.includes(stateObj.state);

        return html`
            <div class="header-section" part="header">
                ${this.showTitle ? html`<div class="device-name">${friendlyName}</div>` : ""}
                <div class="status" aria-live="polite">
                    ${isActive ? html`<span class="live-dot" aria-hidden="true"></span>` : nothing}${statusDisplay}
                </div>
            </div>
            <div class="stats-bar" part="stats">
                ${cleanedArea !== undefined
                    ? html`
                          <div class="stat">
                              <ha-icon icon="mdi:ruler-square"></ha-icon>
                              <span class="stat-value">${cleanedArea}</span>
                              <span class="stat-unit">${localize("unit.meter_squared_shortcut", lang)}</span>
                          </div>
                      `
                    : nothing}
                ${cleaningTime !== undefined
                    ? html`
                          <div class="stat">
                              <ha-icon icon="mdi:timer-outline"></ha-icon>
                              <span class="stat-value">${cleaningTime}</span>
                              <span class="stat-unit">${localize("unit.minute_shortcut", lang)}</span>
                          </div>
                      `
                    : nothing}
                ${batteryLevel !== undefined
                    ? html`
                          <div class="stat">
                              <ha-icon icon="${batteryIcon}"></ha-icon>
                              <span class="stat-value">${batteryLevel}</span>
                              <span class="stat-unit">%</span>
                          </div>
                      `
                    : nothing}
            </div>
        `;
    }

    static get styles(): CSSResultGroup {
        return css`
            :host {
                display: block;
                text-align: center;
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                z-index: 5;
                pointer-events: none;
            }

            .header-section {
                padding: var(--dvc-header-section-padding, 12px 16px 8px);
                background: linear-gradient(
                    to bottom,
                    var(--card-background-color, rgba(255, 255, 255, 0.85)) 0%,
                    var(--card-background-color, rgba(255, 255, 255, 0.6)) 60%,
                    transparent 100%
                );
            }

            .device-name {
                font-size: var(--dvc-header-name-size, 18px);
                font-weight: 600;
                letter-spacing: -0.02em;
                color: var(--primary-text-color);
                text-wrap: pretty;
            }

            .status {
                font-size: var(--dvc-header-status-size, 14px);
                font-weight: 510;
                letter-spacing: -0.01em;
                color: var(--secondary-text-color);
                margin-top: 2px;
            }

            /* Pastille "live" : le robot travaille (pulsation douce, type indicateur d'appel). */
            .live-dot {
                display: inline-block;
                width: 7px;
                height: 7px;
                margin-right: 6px;
                vertical-align: 1px;
                border-radius: 50%;
                background: var(--success-color, #34c759);
                box-shadow: 0 0 6px color-mix(in oklab, var(--success-color, #34c759) 60%, transparent);
                animation: dvc-live-pulse 2s ease-in-out infinite;
                animation-play-state: var(--dvc-anim-state, running);
            }

            @keyframes dvc-live-pulse {
                0%,
                100% {
                    opacity: 1;
                }
                50% {
                    opacity: 0.45;
                }
            }

            @media (prefers-reduced-motion: reduce) {
                .live-dot {
                    animation: none;
                }
            }

            .stats-bar {
                display: flex;
                justify-content: center;
                gap: var(--dvc-stats-gap, 24px);
                padding: var(--dvc-stats-padding, 8px 16px);
                background: var(
                    --dvc-glass-tint,
                    color-mix(in oklab, var(--card-background-color, #fff) 70%, transparent)
                );
                backdrop-filter: var(--dvc-glass-blur, blur(8px));
                -webkit-backdrop-filter: var(--dvc-glass-blur, blur(8px));
                border-top: 0.5px solid var(--dvc-hairline, transparent);
            }

            .stat {
                display: flex;
                align-items: center;
                gap: var(--dvc-stat-gap, 6px);
                font-size: var(--dvc-stat-font-size, 13px);
                color: var(--secondary-text-color);
            }

            .stat ha-icon {
                --mdc-icon-size: var(--dvc-stat-icon-size, 18px);
                opacity: 0.8;
            }

            .stat-value {
                font-weight: 590;
                letter-spacing: -0.01em;
                font-variant-numeric: tabular-nums;
                color: var(--primary-text-color);
            }

            .stat-unit {
                color: var(--secondary-text-color);
                opacity: 0.8;
            }
        `;
    }
}
