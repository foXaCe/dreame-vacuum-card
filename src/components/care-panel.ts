import { LitElement, html, css, TemplateResult, CSSResultGroup, nothing, PropertyValues } from "lit";
import { property, state } from "lit/decorators.js";
import { safeCustomElement } from "../utils/define-element";

import { HomeAssistantFixed } from "../types/fixes";
import { localize } from "../localize/localize";
import { computeStateDisplay } from "../localize/hass/compute_state_display";
import { shouldUpdateForEntities } from "../utils/ha-change-detection";
import {
    CareAlert,
    CareConsumable,
    CareState,
    CareThresholds,
    DEFAULT_CARE_THRESHOLDS,
    buildCareState,
    careWatchedEntities,
    resolveDeviceEntities,
    visibleAlerts,
} from "../model/care/care-model";

/** Report d'une alerte (« plus tard ») : 24 h, mémorisé par navigateur. */
const SNOOZE_MS = 24 * 3600 * 1000;
const SNOOZE_STORAGE_KEY = "dreame-vacuum-card-care-snooze";
/** Délai pendant lequel un bouton « Réinitialiser » attend sa confirmation. */
const CONFIRM_MS = 4000;

export function loadSnoozed(): Record<string, number> {
    try {
        const raw = JSON.parse(localStorage.getItem(SNOOZE_STORAGE_KEY) || "{}");
        return raw && typeof raw === "object" ? (raw as Record<string, number>) : {};
    } catch {
        return {};
    }
}

function saveSnoozed(snoozed: Record<string, number>): void {
    try {
        const now = Date.now();
        const live = Object.fromEntries(Object.entries(snoozed).filter(([, until]) => until > now));
        localStorage.setItem(SNOOZE_STORAGE_KEY, JSON.stringify(live));
    } catch {
        // Stockage indisponible (navigation privée…) : le report ne survit pas au rechargement.
    }
}

/**
 * Page « Station & entretien » : état de la station et ses actions (vider, laver,
 * sécher), réservoirs, consommables avec réinitialisation, alertes reportables.
 * Toute la lecture d'état est dans `model/care/care-model.ts` ; ici, l'affichage
 * et les appuis sur les boutons de l'intégration.
 */
@safeCustomElement("dreame-care-panel")
export class CarePanel extends LitElement {
    @property({ attribute: false })
    public hass!: HomeAssistantFixed;

    @property({ attribute: false })
    public entityId!: string;

    @property({ attribute: false })
    public thresholds: CareThresholds = DEFAULT_CARE_THRESHOLDS;

    @state() private _open = false;
    @state() private _snoozed: Record<string, number> = loadSnoozed();
    /** Bouton de réinitialisation armé (attend la confirmation). */
    @state() private _armed?: string;
    private _armTimer?: number;

    private _entities: Record<string, string> = {};
    private _entitiesFor?: string;
    private _entitiesRegistry?: unknown;

    private _deviceEntities(): Record<string, string> {
        if (this._entitiesFor !== this.entityId || this._entitiesRegistry !== this.hass.entities) {
            this._entities = resolveDeviceEntities(this.hass, this.entityId);
            this._entitiesFor = this.entityId;
            this._entitiesRegistry = this.hass.entities;
        }
        return this._entities;
    }

    public disconnectedCallback(): void {
        super.disconnectedCallback();
        clearTimeout(this._armTimer);
    }

    protected shouldUpdate(changedProps: PropertyValues): boolean {
        if (!this.hass || !this.entityId) return false;
        return shouldUpdateForEntities(
            changedProps,
            this.hass,
            careWatchedEntities(this.entityId, this._deviceEntities())
        );
    }

    private _t(key: string, search = "", replace = ""): string {
        const k = `dreame_ui.care.${key}`;
        return localize(search ? [k, search, replace] : k, this.hass?.locale?.language);
    }

    private _consumableName(key: string): string {
        const name = this._t(`consumable.${key}`);
        return name.startsWith("dreame_ui.") ? key.replace(/_/g, " ") : name;
    }

    private _stateText(entity: string | undefined): string {
        const s = entity ? this.hass.states[entity] : undefined;
        return s ? computeStateDisplay(this.hass.localize, s, this.hass.locale, this.hass.entities) : "";
    }

    private _press(entity: string): void {
        this.hass.callService("button", "press", { entity_id: entity });
    }

    private _reset(entity: string): void {
        if (this._armed !== entity) {
            this._armed = entity;
            clearTimeout(this._armTimer);
            this._armTimer = window.setTimeout(() => (this._armed = undefined), CONFIRM_MS);
            return;
        }
        clearTimeout(this._armTimer);
        this._armed = undefined;
        this._press(entity);
    }

    private _snooze(alert: CareAlert): void {
        this._snoozed = { ...this._snoozed, [alert.id]: Date.now() + SNOOZE_MS };
        saveSnoozed(this._snoozed);
    }

    private _alertTitle(al: CareAlert, care: CareState): string {
        if (al.kind === "consumable") {
            const c = care.consumables.find((x) => x.key === al.key);
            return this._t("alert.consumable", "{name}", this._consumableName(al.key)).replace(
                "{pct}",
                String(c?.pct ?? "")
            );
        }
        if (al.kind === "tank") return `${this._t(`tank.${al.key}`)} : ${this._stateText(al.entity)}`;
        return this._stateText(al.entity);
    }

    private _renderAlerts(care: CareState): TemplateResult | typeof nothing {
        const alerts = visibleAlerts(care.alerts, this._snoozed, Date.now());
        if (!alerts.length) return nothing;
        return html`<section class="alerts" aria-label=${this._t("alerts")}>
            ${alerts.map(
                (al) =>
                    html`<div class="alert ${al.level}">
                        <ha-icon .icon=${al.icon}></ha-icon>
                        <span class="grow">${this._alertTitle(al, care)}</span>
                        ${
                            al.actionEntity
                                ? html`<button
                                      class="chip ${this._armed === al.actionEntity ? "armed" : ""}"
                                      @click=${() =>
                                          al.kind === "consumable"
                                              ? this._reset(al.actionEntity!)
                                              : this._press(al.actionEntity!)}
                                  >
                                      ${
                                          al.kind === "consumable"
                                              ? this._armed === al.actionEntity
                                                  ? this._t("confirm")
                                                  : this._t("reset")
                                              : this._t("clear")
                                      }
                                  </button>`
                                : nothing
                        }
                        <button class="chip ghost" @click=${() => this._snooze(al)} title=${this._t("snooze_hint")}>
                            ${this._t("snooze")}
                        </button>
                    </div>`
            )}
        </section>`;
    }

    private _renderDock(care: CareState): TemplateResult {
        const d = care.dock;
        const status = d.washingPaused
            ? this._t("dock.washing_paused")
            : d.washing
              ? this._t("dock.washing")
              : d.drying
                ? this._t("dock.drying")
                : d.emptying
                  ? this._t("dock.emptying")
                  : this._t("dock.ready");
        return html`<section class="dock">
            <div class="head">
                <h3>${this._t("dock.title")}</h3>
                <span class="muted">${status}</span>
            </div>
            ${
                d.dryingProgress !== undefined
                    ? html`<div
                          class="bar"
                          role="progressbar"
                          aria-valuenow=${d.dryingProgress}
                          aria-valuemin="0"
                          aria-valuemax="100"
                      >
                          <i style="width:${d.dryingProgress}%"></i>
                      </div>`
                    : nothing
            }
            ${
                care.tanks.length
                    ? html`<div class="tanks">
                          ${care.tanks.map(
                              (t) =>
                                  html`<div class="tank ${t.ok ? "" : "warn"}">
                                      <ha-icon .icon=${t.icon}></ha-icon>
                                      <span class="muted">${this._t(`tank.${t.key}`)}</span>
                                      <b>${t.ok ? this._t("ok") : this._stateText(t.entity)}</b>
                                  </div>`
                          )}
                      </div>`
                    : nothing
            }
            ${
                care.actions.length
                    ? html`<div class="tiles">
                          ${care.actions.map(
                              (a) =>
                                  html`<button
                                      class="tile ${a.busy ? "busy" : ""}"
                                      ?disabled=${a.busy}
                                      @click=${() => this._press(a.entity)}
                                  >
                                      <ha-icon
                                          .icon=${
                                              a.kind === "empty"
                                                  ? "mdi:delete-empty-outline"
                                                  : a.kind === "wash"
                                                    ? "mdi:water-sync"
                                                    : "mdi:heat-wave"
                                          }
                                      ></ha-icon>
                                      <span>${this._t(`action.${a.kind}${a.busy ? "_busy" : ""}`)}</span>
                                  </button>`
                          )}
                      </div>`
                    : nothing
            }
        </section>`;
    }

    private _renderConsumable(c: CareConsumable): TemplateResult {
        const armed = this._armed === c.resetEntity;
        return html`<li class=${c.level}>
            <ha-icon .icon=${c.icon}></ha-icon>
            <div class="grow">
                <div class="row">
                    <span>${this._consumableName(c.key)}</span>
                    <span class="muted"
                        >${c.pct}
                        %${c.timeLeft !== undefined ? html` · ${c.timeLeft} ${c.timeUnit ?? ""}` : nothing}</span
                    >
                </div>
                <div class="bar"><i style="width:${c.pct}%"></i></div>
            </div>
            ${
                c.resetEntity
                    ? armed
                        ? html`<button class="chip armed" @click=${() => this._reset(c.resetEntity!)}>
                              ${this._t("confirm")}
                          </button>`
                        : html`<button
                              class="icon-btn"
                              aria-label="${this._t("reset")} — ${this._consumableName(c.key)}"
                              title=${this._t("reset")}
                              @click=${() => this._reset(c.resetEntity!)}
                          >
                              <ha-icon .icon=${"mdi:restore"}></ha-icon>
                          </button>`
                    : nothing
            }
        </li>`;
    }

    protected render(): TemplateResult | typeof nothing {
        if (!this.hass || !this.entityId || !this.hass.states[this.entityId]) return nothing;
        const care = buildCareState(this.hass, this.entityId, this._deviceEntities(), this.thresholds);
        if (!care.consumables.length && !care.actions.length && !care.tanks.length && !care.alerts.length) {
            return nothing;
        }
        const alerts = visibleAlerts(care.alerts, this._snoozed, Date.now());
        const level = alerts.some((a) => a.level === "crit") ? "crit" : alerts.length ? "warn" : "";
        return html`
            <button class="toggle" aria-expanded=${this._open} @click=${() => (this._open = !this._open)}>
                <ha-icon .icon=${"mdi:home-heart"}></ha-icon>
                <span class="grow">${this._t("open")}</span>
                ${
                    alerts.length
                        ? html`<span class="badge ${level}" aria-label=${this._t("alerts")}>${alerts.length}</span>`
                        : nothing
                }
                <ha-icon class="chevron ${this._open ? "open" : ""}" .icon=${"mdi:chevron-down"}></ha-icon>
            </button>
            ${this._open ? this._renderContent(care) : nothing}
        `;
    }

    private _renderContent(care: CareState): TemplateResult {
        return html`<div class="content">
            ${this._renderAlerts(care)} ${this._renderDock(care)}
            ${
                care.consumables.length
                    ? html`<section>
                          <h3>${this._t("consumables")}</h3>
                          <ul class="parts">
                              ${care.consumables.map((c) => this._renderConsumable(c))}
                          </ul>
                      </section>`
                    : nothing
            }
        </div>`;
    }

    public static get styles(): CSSResultGroup {
        return css`
            :host {
                display: block;
                padding: 4px 16px 16px;
                color: var(--primary-text-color);
            }
            .toggle {
                display: flex;
                align-items: center;
                gap: 10px;
                width: 100%;
                min-height: 44px;
                padding: 8px 12px;
                border: none;
                border-radius: 14px;
                background: var(--secondary-background-color);
                color: inherit;
                font: inherit;
                font-size: 14px;
                font-weight: 590;
                text-align: start;
                cursor: pointer;
            }
            .toggle:focus-visible {
                outline: 2px solid var(--primary-color);
                outline-offset: 2px;
            }
            .chevron {
                transition: transform var(--dvc-dur-tap, 180ms) var(--dvc-ease-out, ease);
            }
            .chevron.open {
                transform: rotate(180deg);
            }
            .badge {
                min-width: 22px;
                height: 22px;
                padding: 0 6px;
                border-radius: 11px;
                display: inline-grid;
                place-items: center;
                font-size: 12px;
                font-weight: 700;
                color: #fff;
                background: var(--warning-color, #ff9800);
            }
            .badge.crit {
                background: var(--error-color, #f44336);
            }
            .content {
                padding-top: 14px;
            }
            section + section {
                margin-top: 16px;
            }
            h3 {
                margin: 0 0 8px;
                font-size: 15px;
                font-weight: 600;
            }
            .head {
                display: flex;
                align-items: baseline;
                justify-content: space-between;
                gap: 8px;
            }
            .muted {
                color: var(--secondary-text-color);
                font-size: 13px;
            }
            .grow {
                flex: 1;
                min-width: 0;
            }
            ha-icon {
                --mdc-icon-size: 20px;
                color: var(--secondary-text-color);
                flex: none;
            }
            .bar {
                height: 6px;
                border-radius: 3px;
                background: color-mix(in srgb, var(--secondary-text-color) 18%, transparent);
                overflow: hidden;
                margin-top: 6px;
            }
            .bar i {
                display: block;
                height: 100%;
                border-radius: inherit;
                background: var(--success-color, #4caf50);
            }
            .warn .bar i {
                background: var(--warning-color, #ff9800);
            }
            .crit .bar i {
                background: var(--error-color, #f44336);
            }
            .alerts {
                display: flex;
                flex-direction: column;
                gap: 8px;
                margin-bottom: 16px;
            }
            .alert {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 10px 12px;
                border-radius: 12px;
                font-size: 14px;
                background: color-mix(in srgb, var(--warning-color, #ff9800) 14%, transparent);
            }
            .alert.crit {
                background: color-mix(in srgb, var(--error-color, #f44336) 14%, transparent);
            }
            .alert.warn ha-icon {
                color: var(--warning-color, #ff9800);
            }
            .alert.crit ha-icon {
                color: var(--error-color, #f44336);
            }
            .tanks {
                display: grid;
                grid-template-columns: repeat(2, minmax(0, 1fr));
                gap: 8px;
                margin: 10px 0;
            }
            .tank {
                display: grid;
                grid-template-columns: auto 1fr;
                column-gap: 8px;
                align-items: center;
                padding: 8px 10px;
                border-radius: 12px;
                background: var(--secondary-background-color);
            }
            .tank ha-icon {
                grid-row: span 2;
            }
            .tank b {
                font-size: 14px;
                font-weight: 600;
            }
            .tank.warn ha-icon,
            .tank.warn b {
                color: var(--warning-color, #ff9800);
            }
            .tiles {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(96px, 1fr));
                gap: 8px;
                margin-top: 10px;
            }
            .tile {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 6px;
                min-height: 64px;
                padding: 10px;
                border: none;
                border-radius: 14px;
                background: var(--secondary-background-color);
                color: inherit;
                font: inherit;
                font-size: 13px;
                cursor: pointer;
            }
            .tile ha-icon {
                color: var(--primary-color);
            }
            .tile.busy {
                cursor: default;
                opacity: 0.7;
            }
            .tile:focus-visible,
            .chip:focus-visible {
                outline: 2px solid var(--primary-color);
                outline-offset: 2px;
            }
            .parts {
                list-style: none;
                margin: 0;
                padding: 0;
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            .parts li {
                display: flex;
                align-items: center;
                gap: 12px;
                font-size: 14px;
            }
            .row {
                display: flex;
                justify-content: space-between;
                gap: 8px;
            }
            .icon-btn {
                flex: none;
                display: grid;
                place-items: center;
                width: 36px;
                height: 36px;
                border: none;
                border-radius: 50%;
                background: transparent;
                cursor: pointer;
            }
            .icon-btn:hover {
                background: var(--secondary-background-color);
            }
            .icon-btn:focus-visible {
                outline: 2px solid var(--primary-color);
                outline-offset: 2px;
            }
            .chip {
                flex: none;
                border: 1px solid var(--divider-color);
                border-radius: 999px;
                padding: 6px 12px;
                background: transparent;
                color: var(--primary-text-color);
                font: inherit;
                font-size: 13px;
                cursor: pointer;
                min-height: 32px;
            }
            .chip.armed {
                border-color: var(--error-color, #f44336);
                color: var(--error-color, #f44336);
            }
            .chip.ghost {
                border-color: transparent;
                color: var(--secondary-text-color);
            }
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "dreame-care-panel": CarePanel;
    }
}
