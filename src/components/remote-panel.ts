import { LitElement, html, css, TemplateResult, CSSResultGroup, nothing, PropertyValues } from "lit";
import { property, state } from "lit/decorators.js";
import { safeCustomElement } from "../utils/define-element";
import { sidePanelStyles } from "./panel-tab-styles";

import { forwardHaptic } from "../ha";
import { HomeAssistantFixed } from "../types/fixes";
import { localize } from "../localize/localize";
import { shouldUpdateForEntities } from "../utils/ha-change-detection";
import {
    REMOTE_SERVICE,
    REMOTE_SPEEDS,
    REMOTE_STOP,
    RemoteDirection,
    RemoteSpeed,
    RemoteStep,
    directionForKey,
    isRemoteAvailable,
    remoteStep,
} from "../model/remote/remote-model";

/** Pause entre deux pas tant qu'une flèche est maintenue. On attend la fin de chaque
 *  appel avant le suivant : des pas envoyés à cadence fixe s'empilent plus vite que le
 *  robot ne les exécute, et il continue de rouler une fois la flèche relâchée. */
const STEP_INTERVAL_MS = 120;

const DIRECTIONS: readonly { dir: RemoteDirection; icon: string; area: string }[] = [
    { dir: "forward", icon: "mdi:arrow-up-bold", area: "up" },
    { dir: "left", icon: "mdi:rotate-left", area: "left" },
    { dir: "right", icon: "mdi:rotate-right", area: "right" },
    { dir: "backward", icon: "mdi:arrow-down-bold", area: "down" },
];

interface Hold {
    readonly direction: RemoteDirection;
    alive: boolean;
    timer?: ReturnType<typeof setTimeout>;
}

/**
 * Panneau repliable « Télécommande » : une croix directionnelle à maintenir et trois
 * vitesses. Masqué quand le robot ne peut pas être piloté (indisponible, station
 * occupée, tâche en cours).
 */
@safeCustomElement("dreame-remote-panel")
export class RemotePanel extends LitElement {
    @property({ attribute: false })
    public hass!: HomeAssistantFixed;

    @property({ attribute: false })
    public entityId!: string;

    /** Capteur « état » détaillé de l'intégration (lavage, séchage, pilotage…). */
    @property({ attribute: false })
    public stateSensorId: string | null = null;

    @state() private _open = false;
    @state() private _speed: RemoteSpeed = "normal";
    @state() private _active?: RemoteDirection;

    private _hold?: Hold;

    private _t(key: string): string {
        return localize(`dreame_ui.remote.${key}`, this.hass?.locale?.language);
    }

    private _available(): boolean {
        const robotState = this.stateSensorId ? this.hass.states[this.stateSensorId]?.state : undefined;
        return isRemoteAvailable(this.hass.states[this.entityId]?.state, robotState);
    }

    protected shouldUpdate(changedProps: PropertyValues): boolean {
        if (!this.hass || !this.entityId) return false;
        return shouldUpdateForEntities(changedProps, this.hass, [this.entityId, this.stateSensorId]);
    }

    protected updated(): void {
        // Le robot ne se pilote plus (tâche lancée ailleurs, station…) : on lâche la flèche.
        if (this._hold && !this._available()) this._stopHold(false);
    }

    public disconnectedCallback(): void {
        this._stopHold();
        super.disconnectedCallback();
    }

    private _send(step: RemoteStep): Promise<boolean> {
        return this.hass.callService("dreame_vacuum", REMOTE_SERVICE, { ...step }, { entity_id: this.entityId }).then(
            () => true,
            () => {
                forwardHaptic("failure");
                return false;
            }
        );
    }

    private _startHold(direction: RemoteDirection): void {
        if (this._hold?.direction === direction) return;
        this._stopHold(false);
        const hold: Hold = { direction, alive: true };
        this._hold = hold;
        this._active = direction;
        forwardHaptic("light");
        const tick = async (): Promise<void> => {
            if (!hold.alive) return;
            const ok = await this._send(remoteStep(direction, this._speed));
            if (!ok) {
                // Refus de l'intégration : inutile d'insister ni d'envoyer un pas d'arrêt.
                if (this._hold === hold) this._stopHold(false);
                return;
            }
            if (hold.alive) hold.timer = setTimeout(tick, STEP_INTERVAL_MS);
        };
        void tick();
    }

    private _stopHold(sendStop = true): void {
        const hold = this._hold;
        if (!hold) return;
        hold.alive = false;
        clearTimeout(hold.timer);
        this._hold = undefined;
        this._active = undefined;
        if (sendStop) void this._send(REMOTE_STOP);
    }

    private _onPointerDown(ev: PointerEvent, direction: RemoteDirection): void {
        if (ev.button !== 0) return;
        // La capture garantit le pointerup même si le doigt glisse hors du bouton.
        (ev.currentTarget as HTMLElement).setPointerCapture?.(ev.pointerId);
        this._startHold(direction);
    }

    private _onKeyDown(ev: KeyboardEvent, direction?: RemoteDirection): void {
        const dir = directionForKey(ev.key) ?? (ev.key === "Enter" || ev.key === " " ? direction : undefined);
        if (!dir) return;
        ev.preventDefault();
        if (!ev.repeat) this._startHold(dir);
    }

    private _onKeyUp(ev: KeyboardEvent): void {
        if (directionForKey(ev.key) || ev.key === "Enter" || ev.key === " ") this._stopHold();
    }

    private _stopNow(): void {
        this._stopHold(false);
        forwardHaptic("light");
        void this._send(REMOTE_STOP);
    }

    private _setSpeed(speed: RemoteSpeed): void {
        this._speed = speed;
        forwardHaptic("selection");
    }

    /** Ferme le panneau (la carte n'en garde qu'un ouvert à la fois). */
    public close(): void {
        this._open = false;
    }

    /** Signale l'ouverture à la carte, qui ferme les autres panneaux. */
    private _announceOpen(): void {
        if (this._open) {
            this.dispatchEvent(new CustomEvent("dreame-panel-open", { bubbles: true, composed: true }));
        }
    }

    protected render(): TemplateResult | typeof nothing {
        if (!this.hass || !this.entityId || !this.hass.states[this.entityId]) return nothing;
        if (!this._available()) return nothing;
        return html`
            <button
                class="toggle"
                aria-expanded=${this._open}
                @click=${() => {
                    this._open = !this._open;
                    this._announceOpen();
                }}
            >
                <ha-icon .icon=${"mdi:gamepad-variant-outline"}></ha-icon>
                <span class="grow">${this.hasAttribute("tab") ? this._t("tab_label") : this._t("title")}</span>
                <ha-icon class="chevron ${this._open ? "open" : ""}" .icon=${"mdi:chevron-down"}></ha-icon>
            </button>
            ${this._open ? this._renderContent() : nothing}
        `;
    }

    private _renderContent(): TemplateResult {
        return html`<div class="content">
            <p class="hint">${this._t("hint")}</p>
            <div
                class="pad"
                role="group"
                aria-label=${this._t("title")}
                @keydown=${(ev: KeyboardEvent) => this._onKeyDown(ev)}
                @keyup=${(ev: KeyboardEvent) => this._onKeyUp(ev)}
            >
                ${DIRECTIONS.map(
                    ({ dir, icon, area }) => html`
                        <button
                            class="dir ${this._active === dir ? "held" : ""}"
                            style="grid-area: ${area}"
                            aria-label=${this._t(dir)}
                            aria-pressed=${this._active === dir}
                            @pointerdown=${(ev: PointerEvent) => this._onPointerDown(ev, dir)}
                            @pointerup=${() => this._stopHold()}
                            @pointercancel=${() => this._stopHold()}
                            @lostpointercapture=${() => this._stopHold()}
                            @contextmenu=${(ev: Event) => ev.preventDefault()}
                            @keydown=${(ev: KeyboardEvent) => {
                                ev.stopPropagation();
                                this._onKeyDown(ev, dir);
                            }}
                            @blur=${() => this._stopHold()}
                        >
                            <ha-icon .icon=${icon}></ha-icon>
                        </button>
                    `
                )}
                <button class="dir stop" style="grid-area: stop" aria-label=${this._t("stop")} @click=${this._stopNow}>
                    <ha-icon .icon=${"mdi:stop"}></ha-icon>
                </button>
            </div>
            <div class="speed" role="group" aria-label=${this._t("speed")}>
                ${REMOTE_SPEEDS.map(
                    (speed) => html`
                        <button
                            class=${this._speed === speed ? "on" : ""}
                            aria-pressed=${this._speed === speed}
                            @click=${() => this._setSpeed(speed)}
                        >
                            ${this._t(`speed_${speed}`)}
                        </button>
                    `
                )}
            </div>
        </div>`;
    }

    public static get styles(): CSSResultGroup {
        return [
            sidePanelStyles,
            css`
                /* Mode « tab » : les panneaux de la carte forment une rangée de boutons compacts ;
               l'hôte disparaît du rendu (display: contents) pour que les boutons partagent la
               rangée, et le contenu ouvert passe à la ligne sur toute la largeur. */
                :host([tab]) {
                    display: contents;
                }
                :host([tab]) .toggle {
                    position: relative;
                    flex: 1 1 0;
                    min-width: 0;
                    width: auto;
                    flex-direction: column;
                    justify-content: center;
                    gap: 4px;
                    min-height: 56px;
                    padding: 8px 4px;
                    font-size: 12px;
                    text-align: center;
                }
                :host([tab]) .toggle .grow {
                    flex: none;
                    max-width: 100%;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                :host([tab]) .toggle .chevron,
                :host([tab]) .toggle .muted {
                    display: none !important;
                }
                :host([tab]) .toggle[aria-expanded="true"] {
                    background: color-mix(in srgb, var(--primary-color) 20%, var(--secondary-background-color));
                }
                :host([tab]) .toggle[aria-expanded="true"] ha-icon {
                    color: var(--primary-color);
                }
                :host([tab]) .toggle .badge {
                    position: absolute;
                    top: 4px;
                    right: 6px;
                    min-width: 18px;
                    height: 18px;
                    font-size: 11px;
                }
                :host([tab]) .content {
                    order: 1;
                    flex-basis: 100%;
                    width: 100%;
                    box-sizing: border-box;
                }
                :host {
                    display: block;
                    padding: 0 16px 16px;
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
                button:focus-visible {
                    outline: 2px solid var(--primary-color);
                    outline-offset: 2px;
                }
                .toggle ha-icon {
                    --mdc-icon-size: 20px;
                    color: var(--secondary-text-color);
                    flex: none;
                }
                .grow {
                    flex: 1;
                    min-width: 0;
                }
                .chevron {
                    transition: transform var(--dvc-dur-tap, 180ms) var(--dvc-ease-out, ease);
                }
                .chevron.open {
                    transform: rotate(180deg);
                }
                .content {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 14px;
                    padding-top: 12px;
                }
                .hint {
                    margin: 0;
                    color: var(--secondary-text-color);
                    font-size: 13px;
                    text-align: center;
                }
                .pad {
                    display: grid;
                    grid-template-columns: repeat(3, 60px);
                    grid-template-rows: repeat(3, 60px);
                    grid-template-areas:
                        ". up ."
                        "left stop right"
                        ". down .";
                    gap: 8px;
                    touch-action: none;
                    user-select: none;
                    -webkit-user-select: none;
                }
                .dir {
                    display: grid;
                    place-items: center;
                    border: none;
                    border-radius: 50%;
                    background: var(--secondary-background-color);
                    color: var(--primary-text-color);
                    cursor: pointer;
                    -webkit-tap-highlight-color: transparent;
                    -webkit-touch-callout: none;
                    transition:
                        transform var(--dvc-dur-tap, 180ms) var(--dvc-ease-out, ease),
                        background-color var(--dvc-dur-tap, 180ms) var(--dvc-ease-out, ease);
                }
                .dir ha-icon {
                    --mdc-icon-size: 26px;
                    pointer-events: none;
                }
                .dir.held {
                    background: var(--primary-color);
                    color: var(--text-primary-color, #fff);
                    transform: scale(0.94);
                }
                .dir.stop {
                    background: color-mix(in oklab, var(--error-color, #db4437) 14%, transparent);
                    color: var(--error-color, #db4437);
                }
                .dir.stop:active {
                    transform: scale(0.94);
                }
                .speed {
                    display: flex;
                    gap: 4px;
                    padding: 3px;
                    border-radius: 12px;
                    background: color-mix(in oklab, var(--primary-text-color, #000) 6%, transparent);
                }
                .speed button {
                    min-width: 76px;
                    min-height: 34px;
                    padding: 6px 12px;
                    border: none;
                    border-radius: 9px;
                    background: transparent;
                    color: var(--secondary-text-color);
                    font: inherit;
                    font-size: 13px;
                    font-weight: 510;
                    cursor: pointer;
                }
                .speed button.on {
                    background: var(--card-background-color, #fff);
                    color: var(--primary-text-color);
                    font-weight: 600;
                    box-shadow: var(--dvc-shadow-1, 0 1px 3px rgba(0, 0, 0, 0.15));
                }
                @media (prefers-reduced-motion: reduce) {
                    .dir,
                    .chevron {
                        transition: none;
                    }
                }
            `,
        ];
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "dreame-remote-panel": RemotePanel;
    }
}
