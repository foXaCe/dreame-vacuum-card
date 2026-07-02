import { LitElement, html, css, TemplateResult, CSSResultGroup, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import { HomeAssistantFixed } from "../types/fixes";
import { localize } from "../localize/localize";
import { computeStateDisplay } from "../localize/hass/compute_state_display";

/** Une entrée du menu de sélection de mode. */
interface ModeChoice {
    readonly kind: "cleangenius" | "manual";
    readonly option: string;
    readonly label: string;
    readonly icons: string[];
    readonly selected: boolean;
}

@customElement("dreame-cleaning-mode-chip")
export class CleaningModeChip extends LitElement {
    @property({ attribute: false })
    public hass!: HomeAssistantFixed;

    @property({ attribute: false })
    public entityId!: string;

    @state() private _menuOpen = false;

    private _cachedModeEntityId: string | null | undefined = undefined;
    private _cachedModeEntityKey: string | undefined = undefined;
    private _cachedCgEntityId: string | null | undefined = undefined;
    private _cachedCgEntityKey: string | undefined = undefined;

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

    /** Entité CleanGenius (le select principal, pas `cleangenius_mode`) du même device. */
    private _getCleanGeniusEntity(): string | undefined {
        if (!this.hass || !this.entityId) return undefined;
        if (this._cachedCgEntityId !== undefined && this._cachedCgEntityKey === this.entityId) {
            return this._cachedCgEntityId ?? undefined;
        }
        this._cachedCgEntityKey = this.entityId;
        const deviceId = this.hass.entities[this.entityId]?.device_id;
        if (!deviceId) {
            this._cachedCgEntityId = null;
            return undefined;
        }
        const found = Object.keys(this.hass.states).find((eid) => {
            const entry = this.hass!.entities[eid];
            return (
                entry?.device_id === deviceId &&
                eid.startsWith("select.") &&
                eid.includes("cleangenius") &&
                !eid.includes("cleangenius_mode")
            );
        });
        this._cachedCgEntityId = found ?? null;
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

    private _isCgActive(): boolean {
        const cgId = this._getCleanGeniusEntity();
        const cgState = cgId ? this.hass.states[cgId]?.state : undefined;
        return !!cgState && !["off", "unavailable", "unknown", ""].includes(cgState);
    }

    /** Construit la liste des choix : options CleanGenius (hors "off") puis modes manuels. */
    private _buildChoices(cgActive: boolean): ModeChoice[] {
        const choices: ModeChoice[] = [];

        const cgId = this._getCleanGeniusEntity();
        const cgObj = cgId ? this.hass.states[cgId] : undefined;
        if (cgObj && Array.isArray(cgObj.attributes.options)) {
            for (const option of cgObj.attributes.options as string[]) {
                if (option === "off") continue;
                choices.push({
                    kind: "cleangenius",
                    option,
                    label: computeStateDisplay(this.hass.localize, cgObj, this.hass.locale, this.hass.entities, option),
                    icons: ["mdi:auto-fix"],
                    selected: cgActive && cgObj.state === option,
                });
            }
        }

        const modeId = this._getCleaningModeEntity();
        const modeObj = modeId ? this.hass.states[modeId] : undefined;
        if (modeObj && Array.isArray(modeObj.attributes.options)) {
            for (const option of modeObj.attributes.options as string[]) {
                choices.push({
                    kind: "manual",
                    option,
                    label: computeStateDisplay(
                        this.hass.localize,
                        modeObj,
                        this.hass.locale,
                        this.hass.entities,
                        option
                    ),
                    icons: this._getModeIcons(option),
                    selected: !cgActive && modeObj.state === option,
                });
            }
        }

        return choices;
    }

    private _handleKeydown(e: KeyboardEvent): void {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            this._toggleMenu();
        } else if (e.key === "Escape" && this._menuOpen) {
            e.preventDefault();
            this._menuOpen = false;
        }
    }

    private _toggleMenu(): void {
        const cgActive = this._isCgActive();
        const modeId = this._getCleaningModeEntity();
        const modeState = modeId ? this.hass.states[modeId]?.state : undefined;
        const unavailable = !modeState || modeState === "unavailable" || modeState === "unknown";
        // Robot en veille sans CleanGenius : rien à piloter, la puce reste inerte.
        if (unavailable && !cgActive) return;
        if (this._buildChoices(cgActive).length === 0) return;
        this._menuOpen = !this._menuOpen;
    }

    private async _selectChoice(choice: ModeChoice): Promise<void> {
        this._menuOpen = false;
        if (choice.selected || !this.hass) return;

        if (choice.kind === "cleangenius") {
            const cgId = this._getCleanGeniusEntity();
            if (!cgId) return;
            this.hass.callService("select", "select_option", { option: choice.option }, { entity_id: cgId });
            return;
        }

        // Mode manuel : couper CleanGenius d'abord si actif (sinon le select de mode
        // est indisponible), puis attendre que l'intégration le libère avant d'appliquer.
        const modeId = this._getCleaningModeEntity();
        if (!modeId) return;
        const cgId = this._getCleanGeniusEntity();
        if (cgId && this._isCgActive()) {
            await this.hass.callService("select", "select_option", { option: "off" }, { entity_id: cgId });
            for (let attempt = 0; attempt < 8; attempt++) {
                const st = this.hass.states[modeId]?.state;
                if (st && st !== "unavailable" && st !== "unknown") break;
                await new Promise((resolve) => setTimeout(resolve, 400));
            }
        }
        this.hass.callService("select", "select_option", { option: choice.option }, { entity_id: modeId });
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
        // En veille, le robot coupe sa liaison locale : le select de mode devient
        // indisponible. Plutôt qu'un « Indisponible » brut, on grise la puce et on
        // affiche un tiret discret (rendu premium).
        const unavailable = currentMode === "unavailable" || currentMode === "unknown" || !currentMode;
        const translatedMode = computeStateDisplay(this.hass.localize, stateObj, this.hass.locale, this.hass.entities);
        const modeLabel = localize("tile.cleaning_mode.label", lang);

        const cgActive = this._isCgActive();
        const cgId = this._getCleanGeniusEntity();
        const cgObj = cgId ? this.hass.states[cgId] : undefined;
        const cgOptionLabel =
            cgActive && cgObj
                ? computeStateDisplay(this.hass.localize, cgObj, this.hass.locale, this.hass.entities)
                : "";

        const icons = cgActive ? ["mdi:auto-fix"] : this._getModeIcons(currentMode);
        // Valeur seule, compacte : « CleanGenius · Routine » ou le mode manuel traduit.
        const valueText = cgActive ? `CleanGenius · ${cgOptionLabel}` : unavailable ? "—" : translatedMode;
        const ariaLabel = `${modeLabel}: ${cgActive ? "CleanGenius" : unavailable ? "—" : translatedMode}`;
        const dimmed = unavailable && !cgActive;
        const interactive = !dimmed;
        const choices = interactive ? this._buildChoices(cgActive) : [];
        const cgChoices = choices.filter((c) => c.kind === "cleangenius");
        const manualChoices = choices.filter((c) => c.kind === "manual");

        return html`
            ${this._menuOpen
                ? html`<div class="menu-backdrop" @click="${() => (this._menuOpen = false)}"></div>`
                : nothing}
            <div
                class="mode-chip ${dimmed ? "unavailable" : ""}"
                part="mode-chip"
                role="button"
                tabindex="${interactive ? 0 : -1}"
                aria-label="${ariaLabel}"
                aria-haspopup="listbox"
                aria-expanded="${this._menuOpen ? "true" : "false"}"
                @click="${this._toggleMenu}"
                @keydown="${this._handleKeydown}"
            >
                <div class="mode-icons">
                    ${icons.map((icon) => html`<ha-icon class="mode-icon" icon="${icon}"></ha-icon>`)}
                </div>
                <span class="mode-label">${valueText}</span>
                <ha-icon class="mode-arrow ${this._menuOpen ? "open" : ""}" icon="mdi:chevron-down"></ha-icon>
            </div>
            ${this._menuOpen
                ? html`
                      <div class="mode-menu" role="listbox" aria-label="${modeLabel}">
                          ${cgChoices.length > 0
                              ? html`<div class="menu-section">CleanGenius</div>
                                    ${cgChoices.map((c) => this._renderChoice(c))}`
                              : nothing}
                          ${manualChoices.length > 0
                              ? html`<div class="menu-section">${localize("dreame_ui.mode.manual_section", lang)}</div>
                                    ${manualChoices.map((c) => this._renderChoice(c))}`
                              : nothing}
                      </div>
                  `
                : nothing}
        `;
    }

    private _renderChoice(choice: ModeChoice): TemplateResult {
        return html`
            <button
                type="button"
                class="menu-item"
                role="option"
                aria-selected="${choice.selected ? "true" : "false"}"
                @click="${() => this._selectChoice(choice)}"
            >
                <span class="menu-item-icons">
                    ${choice.icons.map((icon) => html`<ha-icon class="menu-item-icon" icon="${icon}"></ha-icon>`)}
                </span>
                <span class="menu-item-label">${choice.label}</span>
                ${choice.selected ? html`<ha-icon class="menu-item-check" icon="mdi:check"></ha-icon>` : nothing}
            </button>
        `;
    }

    static get styles(): CSSResultGroup {
        return css`
            :host {
                display: block;
                position: relative;
                padding: var(--dvc-chip-host-padding, 2px 14px);
            }

            .mode-chip {
                display: flex;
                align-items: center;
                gap: var(--dvc-chip-gap, 7px);
                width: fit-content;
                background: var(--dvc-glass-tint, var(--secondary-background-color, rgba(0, 0, 0, 0.1)));
                -webkit-backdrop-filter: var(--dvc-glass-blur);
                backdrop-filter: var(--dvc-glass-blur);
                border: 0.5px solid var(--dvc-hairline, transparent);
                box-shadow: var(--dvc-shadow-1);
                border-radius: var(--dvc-radius-pill, 980px);
                padding: var(--dvc-chip-padding, 5px 11px 5px 7px);
                cursor: pointer;
                transition:
                    transform var(--dvc-dur-tap, 180ms) var(--dvc-ease-out, ease),
                    filter var(--dvc-dur-tap, 180ms) var(--dvc-ease-out, ease),
                    box-shadow var(--dvc-dur-tap, 180ms) var(--dvc-ease-out, ease),
                    opacity var(--dvc-dur-tap, 180ms) var(--dvc-ease-out, ease);
                will-change: transform;
            }

            @media (hover: hover) {
                .mode-chip:hover {
                    filter: brightness(1.03);
                }
            }

            .mode-chip:active {
                transform: scale(0.97);
                filter: brightness(0.96);
            }

            .mode-chip:focus-visible {
                outline: 2px solid var(--primary-color);
                outline-offset: 2px;
            }

            .mode-chip.unavailable {
                opacity: 0.45;
                cursor: default;
                box-shadow: none;
            }

            /* Bulle teintée autour des icônes de mode : structure la puce, à la iOS Settings. */
            .mode-icons {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 2px;
                padding: 3px 5px;
                border-radius: var(--dvc-radius-pill, 980px);
                background: color-mix(in oklab, var(--primary-color, #0a84ff) 12%, transparent);
            }

            .mode-icon {
                color: var(--primary-color);
                --mdc-icon-size: 15px;
            }

            .mode-label {
                font-size: var(--dvc-chip-font-size, 13px);
                font-weight: 510;
                letter-spacing: -0.01em;
                color: var(--primary-text-color);
                white-space: nowrap;
            }

            .mode-arrow {
                color: var(--secondary-text-color);
                --mdc-icon-size: 16px;
                transition: transform var(--dvc-dur-tap, 180ms) var(--dvc-ease-out, ease);
            }

            .mode-arrow.open {
                transform: rotate(180deg);
            }

            /* --- Menu de sélection ------------------------------------------------ */

            .menu-backdrop {
                position: fixed;
                inset: 0;
                z-index: 6;
            }

            .mode-menu {
                position: absolute;
                left: var(--dvc-chip-menu-inset, 14px);
                bottom: calc(100% + 4px);
                min-width: 230px;
                max-width: calc(100% - 2 * var(--dvc-chip-menu-inset, 14px));
                z-index: 7;
                padding: 5px;
                background: var(--dvc-glass-tint-strong, var(--card-background-color, #fff));
                -webkit-backdrop-filter: var(--dvc-glass-blur);
                backdrop-filter: var(--dvc-glass-blur);
                border: 0.5px solid var(--dvc-hairline, transparent);
                border-radius: 16px;
                box-shadow: var(--dvc-shadow-2);
                transform-origin: bottom left;
                animation: dvc-menu-in 200ms var(--dvc-ease, cubic-bezier(0.32, 0.72, 0, 1));
            }

            @keyframes dvc-menu-in {
                from {
                    opacity: 0;
                    transform: translateY(4px) scale(0.97);
                }
                to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }

            .menu-section {
                padding: 6px 10px 3px;
                font-size: 10.5px;
                font-weight: 600;
                letter-spacing: 0.04em;
                text-transform: uppercase;
                color: var(--secondary-text-color);
            }

            .menu-item {
                display: flex;
                align-items: center;
                gap: 8px;
                width: 100%;
                padding: 7px 10px;
                border: none;
                border-radius: 10px;
                background: transparent;
                font-family: inherit;
                font-size: 13px;
                font-weight: 510;
                letter-spacing: -0.01em;
                color: var(--primary-text-color);
                text-align: left;
                cursor: pointer;
                transition: background var(--dvc-dur-tap, 180ms) var(--dvc-ease-out, ease);
            }

            @media (hover: hover) {
                .menu-item:hover {
                    background: color-mix(in oklab, var(--primary-text-color, #000) 6%, transparent);
                }
            }

            .menu-item:active {
                background: color-mix(in oklab, var(--primary-text-color, #000) 10%, transparent);
            }

            .menu-item:focus-visible {
                outline: 2px solid var(--primary-color);
                outline-offset: -2px;
            }

            .menu-item-icons {
                display: flex;
                align-items: center;
                gap: 2px;
            }

            .menu-item-icon {
                color: var(--secondary-text-color);
                --mdc-icon-size: 16px;
            }

            .menu-item[aria-selected="true"] .menu-item-icon {
                color: var(--primary-color);
            }

            .menu-item-label {
                flex: 1;
            }

            .menu-item-check {
                color: var(--primary-color);
                --mdc-icon-size: 16px;
            }

            @media (prefers-reduced-motion: reduce) {
                .mode-menu {
                    animation: none;
                }
                .mode-chip,
                .mode-arrow,
                .menu-item {
                    transition: none;
                }
            }
        `;
    }
}
