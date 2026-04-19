import { LitElement, html, css, nothing, CSSResultGroup } from "lit";
import { customElement, property } from "lit/decorators.js";
import lottie, { AnimationItem } from "lottie-web/build/player/lottie_light";

import animDrying from "../assets/lottie/anim_drying.json";
import animWashing from "../assets/lottie/anim_washing.json";
import animDustCollect from "../assets/lottie/anim_dust_collect.json";

const STATE_LOTTIE_MAP: Record<string, unknown> = {
    // Drying states
    drying: animDrying,
    dust_bag_drying: animDrying,
    dust_bag_drying_paused: animDrying,
    sanitizing_with_dry: animDrying,
    // Washing states
    washing: animWashing,
    washing_paused: animWashing,
    clean_add_water: animWashing,
    station_cleaning: animWashing,
    sanitizing: animWashing,
    initial_deep_cleaning: animWashing,
    initial_deep_cleaning_paused: animWashing,
    // Dust collecting states
    auto_emptying: animDustCollect,
    emptying: animDustCollect,
};

const ZZZ_STATES = new Set(["charging", "charging_completed", "idle"]);

@customElement("dreame-robot-animation")
export class RobotAnimation extends LitElement {
    @property({ type: String })
    public robotState = "";

    @property({ type: Number })
    public chargerX = -1;

    @property({ type: Number })
    public chargerY = -1;

    private _animation: AnimationItem | null = null;
    private _currentState = "";
    private _timerId = 0;
    private _pendingAnimData: unknown = null;

    public connectedCallback(): void {
        super.connectedCallback();
        if (this._pendingAnimData && !this._animation) {
            this._scheduleLoad(this._pendingAnimData);
        }
    }

    public disconnectedCallback(): void {
        super.disconnectedCallback();
        clearTimeout(this._timerId);
        this._destroyAnimation();
    }

    protected updated(): void {
        const targetState = this.robotState?.toLowerCase() ?? "";
        if (targetState === this._currentState) return;

        this._currentState = targetState;
        this._destroyAnimation();
        clearTimeout(this._timerId);

        const animData = STATE_LOTTIE_MAP[targetState];
        const isZzz = ZZZ_STATES.has(targetState);

        if (!animData && !isZzz) {
            this._pendingAnimData = null;
            this.style.opacity = "0";
            return;
        }

        this.style.opacity = "1";

        if (animData) {
            this._pendingAnimData = animData;
            this._scheduleLoad(animData);
        }
    }

    private _scheduleLoad(animData: unknown, retries = 10): void {
        clearTimeout(this._timerId);
        this._timerId = window.setTimeout(() => {
            if (!this.isConnected) return;
            const container = this.shadowRoot?.getElementById("lottie-container");
            if (!container) {
                if (retries > 0) this._scheduleLoad(animData, retries - 1);
                return;
            }
            try {
                this._animation = lottie.loadAnimation({
                    container,
                    renderer: "svg",
                    loop: true,
                    autoplay: true,
                    animationData: animData,
                });
                this._pendingAnimData = null;
            } catch {
                if (retries > 0) this._scheduleLoad(animData, retries - 1);
            }
        }, 50);
    }

    private _destroyAnimation(): void {
        if (this._animation) {
            this._animation.destroy();
            this._animation = null;
        }
    }

    protected render(): unknown {
        const hasPosition = this.chargerX >= 0 && this.chargerY >= 0;
        const posStyle = hasPosition ? `left: ${this.chargerX}%; top: ${this.chargerY}%;` : "";
        const targetState = this._currentState;
        const isZzz = ZZZ_STATES.has(targetState);
        const isLottie = !!STATE_LOTTIE_MAP[targetState];

        return html`<div id="lottie-wrapper" class="${hasPosition ? "positioned" : "centered"}" style="${posStyle}">
            ${isLottie ? html`<div id="lottie-container"></div>` : nothing}
            ${isZzz
                ? html`<div class="zzz-container">
                      <span class="z z1">Z</span>
                      <span class="z z2">Z</span>
                      <span class="z z3">Z</span>
                  </div>`
                : nothing}
        </div>`;
    }

    public static get styles(): CSSResultGroup {
        return css`
            :host {
                display: block;
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 3;
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.3s ease;
            }

            #lottie-wrapper.centered {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
            }

            #lottie-wrapper.positioned {
                position: absolute;
                transform: translate(-50%, -110%);
            }

            #lottie-container {
                width: 48px;
                opacity: 0.9;
            }

            .zzz-container {
                position: relative;
                width: 40px;
                height: 48px;
            }

            .z {
                position: absolute;
                font-weight: 700;
                color: rgba(255, 255, 255, 0.85);
                text-shadow: 0 0 4px rgba(0, 0, 0, 0.5);
                animation: zzz-float 2.4s ease-in-out infinite;
                opacity: 0;
            }

            .z1 {
                font-size: 10px;
                bottom: 0;
                left: 8px;
                animation-delay: 0s;
            }

            .z2 {
                font-size: 14px;
                bottom: 14px;
                left: 18px;
                animation-delay: 0.8s;
            }

            .z3 {
                font-size: 18px;
                bottom: 28px;
                left: 26px;
                animation-delay: 1.6s;
            }

            @keyframes zzz-float {
                0% {
                    opacity: 0;
                    transform: translateY(4px) scale(0.8);
                }
                20% {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
                80% {
                    opacity: 1;
                    transform: translateY(-6px) scale(1);
                }
                100% {
                    opacity: 0;
                    transform: translateY(-10px) scale(0.8);
                }
            }
        `;
    }
}
