import { LitElement, html, css, TemplateResult, CSSResultGroup, nothing, PropertyValues } from "lit";
import { property, state } from "lit/decorators.js";
import { safeCustomElement } from "../utils/define-element";

import { HomeAssistantFixed } from "../types/fixes";
import { localize } from "../localize/localize";
import { SettingsCategory, buildSettingsCategories, shortEntityName } from "../model/settings/settings-model";

/** Ligne d'entité native de HA (créée par `loadCardHelpers().createRowElement`). */
type EntityRow = HTMLElement & { hass?: HomeAssistantFixed };
interface CardHelpers {
    createRowElement(config: { entity: string; name?: string }): EntityRow;
}

declare global {
    interface Window {
        loadCardHelpers?: () => Promise<CardHelpers>;
    }
}

/**
 * Menu « Réglages » : les réglages du robot rangés par catégorie. Chaque réglage est
 * affiché par la ligne d'entité native de Home Assistant (interrupteur, liste, curseur,
 * heure, bouton), avec son comportement et ses traductions — rien n'est réimplémenté ici.
 */
@safeCustomElement("dreame-settings-panel")
export class SettingsPanel extends LitElement {
    @property({ attribute: false })
    public hass!: HomeAssistantFixed;

    @property({ attribute: false })
    public entityId!: string;

    @state() private _open = false;
    @state() private _category?: string;
    @state() private _helpers?: CardHelpers | null;

    private _rows = new Map<string, EntityRow>();
    private _categories: SettingsCategory[] = [];
    private _categoriesFor?: unknown;

    private _t(key: string): string {
        return localize(`dreame_ui.settings.${key}`, this.hass?.locale?.language);
    }

    private _getCategories(): SettingsCategory[] {
        // Recalcul quand le registre change (entités ajoutées / cachées) ou à l'ouverture
        // (une entité peut redevenir disponible).
        if (this._categoriesFor !== this.hass?.entities || !this._categories.length) {
            this._categories = buildSettingsCategories(this.hass, this.entityId);
            this._categoriesFor = this.hass?.entities;
        }
        return this._categories;
    }

    /** Un changement d'état ne concerne le panneau que s'il est ouvert sur une catégorie. */
    protected shouldUpdate(changedProps: PropertyValues): boolean {
        if (!this.hass || !this.entityId) return false;
        if (!(changedProps.size === 1 && changedProps.has("hass"))) return true;
        // Panneau fermé : seul le nombre de catégories peut changer l'en-tête.
        if (!this._open) return this._categoriesFor !== this.hass.entities;
        return true;
    }

    protected updated(): void {
        // Les lignes HA reçoivent le nouvel état elles-mêmes (elles filtrent leur entité).
        for (const row of this._rows.values()) row.hass = this.hass;
    }

    private async _ensureHelpers(): Promise<void> {
        if (this._helpers !== undefined) return;
        try {
            this._helpers = window.loadCardHelpers ? await window.loadCardHelpers() : null;
        } catch {
            this._helpers = null;
        }
    }

    private _toggle(): void {
        this._open = !this._open;
        if (this._open) void this._ensureHelpers();
    }

    private _toggleCategory(key: string): void {
        this._category = this._category === key ? undefined : key;
    }

    private _deviceName(): string | undefined {
        const deviceId = this.hass.entities?.[this.entityId]?.device_id;
        const devices = (this.hass as unknown as { devices?: Record<string, { name?: string; name_by_user?: string }> })
            .devices;
        const device = deviceId ? devices?.[deviceId] : undefined;
        return device?.name_by_user || device?.name || this.hass.states[this.entityId]?.attributes?.friendly_name;
    }

    private _row(entity: string): TemplateResult {
        if (this._helpers) {
            let row = this._rows.get(entity);
            if (!row) {
                row = this._helpers.createRowElement({
                    entity,
                    name: shortEntityName(this.hass, entity, this._deviceName()),
                });
                this._rows.set(entity, row);
            }
            row.hass = this.hass;
            return html`<div class="row">${row}</div>`;
        }
        // Hors Home Assistant (tests, aperçu) : nom et état, en lecture seule.
        return html`<div class="row fallback">
            <span>${shortEntityName(this.hass, entity, this._deviceName())}</span>
            <span class="muted">${this.hass.states[entity]?.state ?? ""}</span>
        </div>`;
    }

    protected render(): TemplateResult | typeof nothing {
        if (!this.hass || !this.entityId || !this.hass.states[this.entityId]) return nothing;
        const categories = this._getCategories();
        if (!categories.length) return nothing;
        return html`
            <button class="toggle" aria-expanded=${this._open} @click=${this._toggle}>
                <ha-icon .icon=${"mdi:tune-variant"}></ha-icon>
                <span class="grow">${this._t("title")}</span>
                <ha-icon class="chevron ${this._open ? "open" : ""}" .icon=${"mdi:chevron-down"}></ha-icon>
            </button>
            ${
                this._open
                    ? html`<div class="content">
                          ${categories.map((cat) => {
                              const open = this._category === cat.key;
                              return html`<section class="cat ${open ? "open" : ""}">
                                  <button
                                      class="cat-head"
                                      aria-expanded=${open}
                                      @click=${() => this._toggleCategory(cat.key)}
                                  >
                                      <ha-icon .icon=${cat.icon}></ha-icon>
                                      <span class="grow">${this._t(`category.${cat.key}`)}</span>
                                      <span class="muted">${cat.entities.length}</span>
                                      <ha-icon
                                          class="chevron ${open ? "open" : ""}"
                                          .icon=${"mdi:chevron-down"}
                                      ></ha-icon>
                                  </button>
                                  ${
                                      open
                                          ? html`<div class="rows">${cat.entities.map((e) => this._row(e))}</div>`
                                          : nothing
                                  }
                              </section>`;
                          })}
                      </div>`
                    : nothing
            }
        `;
    }

    public static get styles(): CSSResultGroup {
        return css`
            :host {
                display: block;
                padding: 0 16px 16px;
                color: var(--primary-text-color);
            }
            .toggle,
            .cat-head {
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
            .cat-head {
                background: transparent;
                font-weight: 500;
                border-radius: 10px;
            }
            .cat-head:hover {
                background: var(--secondary-background-color);
            }
            .toggle:focus-visible,
            .cat-head:focus-visible {
                outline: 2px solid var(--primary-color);
                outline-offset: 2px;
            }
            ha-icon {
                --mdc-icon-size: 20px;
                color: var(--secondary-text-color);
                flex: none;
            }
            .grow {
                flex: 1;
                min-width: 0;
            }
            .muted {
                color: var(--secondary-text-color);
                font-size: 13px;
            }
            .chevron {
                transition: transform var(--dvc-dur-tap, 180ms) var(--dvc-ease-out, ease);
            }
            .chevron.open {
                transform: rotate(180deg);
            }
            .content {
                padding-top: 8px;
                display: flex;
                flex-direction: column;
                gap: 2px;
            }
            .rows {
                padding: 4px 4px 8px 42px;
            }
            .row {
                min-height: 40px;
                display: flex;
                align-items: center;
            }
            .row > * {
                flex: 1;
            }
            .fallback {
                justify-content: space-between;
                font-size: 14px;
            }
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "dreame-settings-panel": SettingsPanel;
    }
}
