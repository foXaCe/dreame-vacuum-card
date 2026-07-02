import { LitElement, html, css, TemplateResult, CSSResultGroup, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";

import { HomeAssistantFixed } from "../types/fixes";
import { localize } from "../localize/localize";
import { computeStateDisplay } from "../localize/hass/compute_state_display";

@customElement("dreame-cleaning-mode-chip")
export class CleaningModeChip extends LitElement {
    @property({ attribute: false })
    public hass!: HomeAssistantFixed;

    @property({ attribute: false })
    public entityId!: string;

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

    private _handleKeydown(e: KeyboardEvent): void {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            this._handleClick();
        }
    }

    private _handleClick(): void {
        const selectEntityId = this._getCleaningModeEntity();
        if (!selectEntityId || !this.hass) return;

        const stateObj = this.hass.states[selectEntityId];
        if (!stateObj) return;

        const options: string[] | undefined = stateObj.attributes.options;
        if (!options || options.length === 0) return;

        const currentIndex = options.indexOf(stateObj.state);
        const nextIndex = (currentIndex + 1) % options.length;
        const nextOption = options[nextIndex];

        this.hass.callService("select", "select_option", { option: nextOption }, { entity_id: selectEntityId });
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
        const options: string[] | undefined = stateObj.attributes.options;

        // Le mode manuel devient indisponible quand CleanGenius pilote le robot
        // (suction/eau/mode en auto) ou quand le robot est en veille. Plutôt qu'un
        // « Indisponible » brut : si CleanGenius est actif on l'affiche (mode auto),
        // sinon on grise discrètement la puce.
        let cgActive = false;
        if (unavailable) {
            const cgId = this._getCleanGeniusEntity();
            const cgState = cgId ? this.hass.states[cgId]?.state : undefined;
            cgActive = !!cgState && !["off", "unavailable", "unknown", ""].includes(cgState);
        }

        const icons = cgActive ? ["mdi:auto-fix"] : this._getModeIcons(currentMode);
        const valueText = cgActive ? "CleanGenius" : unavailable ? "—" : translatedMode;
        const displayLabel = `${modeLabel}: ${valueText}`;
        const dimmed = unavailable && !cgActive;
        const interactive = !unavailable;

        return html`
            <div
                class="mode-chip ${dimmed ? "unavailable" : ""} ${cgActive ? "cg-active" : ""}"
                part="mode-chip"
                role="button"
                tabindex="${interactive ? 0 : -1}"
                aria-label="${displayLabel}"
                @click="${this._handleClick}"
                @keydown="${this._handleKeydown}"
                title="${
                    interactive && options
                        ? localize(
                              ["dreame_ui.mode.cycle_tooltip", "{0}", `${options.length}`],
                              this.hass.locale?.language
                          )
                        : ""
                }"
            >
                <div class="mode-icons">
                    ${icons.map((icon) => html`<ha-icon class="mode-icon" icon="${icon}"></ha-icon>`)}
                </div>
                <span class="mode-label">${displayLabel}</span>
                <ha-icon class="mode-arrow" icon="mdi:chevron-right"></ha-icon>
            </div>
        `;
    }

    static get styles(): CSSResultGroup {
        return css`
            :host {
                display: block;
                padding: var(--dvc-chip-host-padding, 4px 16px);
            }

            .mode-chip {
                display: flex;
                align-items: center;
                gap: var(--dvc-chip-gap, 8px);
                background: var(--dvc-glass-tint, var(--secondary-background-color, rgba(0, 0, 0, 0.1)));
                -webkit-backdrop-filter: var(--dvc-glass-blur);
                backdrop-filter: var(--dvc-glass-blur);
                border: 0.5px solid var(--dvc-hairline, transparent);
                box-shadow: var(--dvc-shadow-1);
                border-radius: var(--dvc-radius-pill, 980px);
                padding: var(--dvc-chip-padding, 10px 16px);
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

            /* CleanGenius actif : puce informative (mode auto), non cliquable. */
            .mode-chip.cg-active {
                cursor: default;
            }
            .mode-chip.cg-active .mode-arrow {
                display: none;
            }

            /* Bulle teintée autour des icônes de mode : structure la puce, à la iOS Settings. */
            .mode-icons {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 2px;
                padding: 4px 6px;
                border-radius: var(--dvc-radius-pill, 980px);
                background: color-mix(in oklab, var(--primary-color, #0a84ff) 12%, transparent);
            }

            .mode-icon {
                color: var(--primary-color);
                --mdc-icon-size: 18px;
            }

            .mode-label {
                flex: 1;
                font-size: var(--dvc-chip-font-size, 14px);
                font-weight: 510;
                letter-spacing: -0.01em;
                color: var(--primary-text-color);
            }

            .mode-arrow {
                color: var(--secondary-text-color);
                --mdc-icon-size: 18px;
                transition: transform var(--dvc-dur-tap, 180ms) var(--dvc-ease-out, ease);
            }

            @media (hover: hover) {
                .mode-chip:hover .mode-arrow {
                    transform: translateX(2px);
                }
            }
        `;
    }
}
