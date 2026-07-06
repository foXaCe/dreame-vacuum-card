import { LitElement, html, css, nothing, CSSResultGroup } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { AnimationItem } from "lottie-web/build/player/lottie_light";

// Le moteur lottie-web (~168 Ko minifié) et les 3 JSON d'animation (~43 Ko) ne sont
// utiles que pendant les états lavage/séchage/vidage (robots avec station). On les
// charge à la demande via import() dynamique au lieu d'un import statique : Rollup en
// fait des chunks séparés, sortis du chemin critique du bundle principal (voir
// rollup.config.js `chunkFileNames`).
type LottieModule = typeof import("lottie-web/build/player/lottie_light");

const loadDrying = () => import("../assets/lottie/anim_drying.json").then((m) => m.default);
const loadWashing = () => import("../assets/lottie/anim_washing.json").then((m) => m.default);
const loadDustCollect = () => import("../assets/lottie/anim_dust_collect.json").then((m) => m.default);

// `Partial<Record<...>>` (plutôt que `Record<...>`) pour que l'accès indexé soit
// typé `(() => Promise<unknown>) | undefined` : sans ça, TS considère l'accès
// toujours défini et refuse les tests de vérité (`if (loader)`) sur un type fonction.
const STATE_ANIM_LOADER: Partial<Record<string, () => Promise<unknown>>> = {
    // Drying states
    drying: loadDrying,
    dust_bag_drying: loadDrying,
    dust_bag_drying_paused: loadDrying,
    sanitizing_with_dry: loadDrying,
    // Washing states
    washing: loadWashing,
    washing_paused: loadWashing,
    clean_add_water: loadWashing,
    station_cleaning: loadWashing,
    sanitizing: loadWashing,
    initial_deep_cleaning: loadWashing,
    initial_deep_cleaning_paused: loadWashing,
    // Dust collecting states
    auto_emptying: loadDustCollect,
    emptying: loadDustCollect,
};

const ZZZ_STATES = new Set(["charging", "charging_completed", "idle"]);

let lottiePromise: Promise<LottieModule["default"]> | undefined;
function loadLottie(): Promise<LottieModule["default"]> {
    lottiePromise ??= import("lottie-web/build/player/lottie_light").then((m) => m.default);
    return lottiePromise;
}

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
    private _loadedState = "";
    private _timerId = 0;
    // État pour lequel un chargement (lottie + JSON) est en cours ou en attente de
    // reconnexion. Remplace l'ancien `_pendingAnimData` : on ne connaît plus la donnée
    // tout de suite (elle arrive de façon asynchrone), seulement l'état visé.
    private _pendingState: string | null = null;

    protected willUpdate(): void {
        // Dérive l'état AVANT le rendu pour que le markup (#lottie-container / .zzz-container)
        // reflète l'état courant dès la première passe (sinon il accusait un rendu de retard).
        this._currentState = this.robotState?.toLowerCase() ?? "";
    }

    public connectedCallback(): void {
        super.connectedCallback();
        if (this._pendingState && !this._animation) {
            this._scheduleLoad(this._pendingState);
        }
    }

    public disconnectedCallback(): void {
        super.disconnectedCallback();
        clearTimeout(this._timerId);
        this._destroyAnimation();
    }

    protected updated(): void {
        // _currentState est déjà positionné dans willUpdate() (donc le markup est à jour) ;
        // on ne (re)charge l'animation que si l'état chargé diffère de l'état courant.
        if (this._currentState === this._loadedState) return;

        this._loadedState = this._currentState;
        this._destroyAnimation();
        clearTimeout(this._timerId);

        const loader = STATE_ANIM_LOADER[this._currentState];
        const isZzz = ZZZ_STATES.has(this._currentState);

        if (!loader && !isZzz) {
            this._pendingState = null;
            this.style.opacity = "0";
            return;
        }

        this.style.opacity = "1";

        if (loader) {
            this._pendingState = this._currentState;
            this._scheduleLoad(this._currentState);
        }
    }

    private _scheduleLoad(state: string, retries = 40): void {
        clearTimeout(this._timerId);
        this._timerId = window.setTimeout(() => {
            if (!this.isConnected) return;
            const container = this.shadowRoot?.getElementById("lottie-container");
            if (!container) {
                if (retries > 0) this._scheduleLoad(state, retries - 1);
                return;
            }
            const loader = STATE_ANIM_LOADER[state];
            if (!loader) return;

            Promise.all([loadLottie(), loader()])
                .then(([lottie, animData]) => {
                    // L'état courant a pu changer (ou l'élément se déconnecter) pendant
                    // le chargement asynchrone : ne jamais afficher une animation périmée.
                    if (!this.isConnected || this._currentState !== state) return;
                    const freshContainer = this.shadowRoot?.getElementById("lottie-container");
                    if (!freshContainer) {
                        if (retries > 0) this._scheduleLoad(state, retries - 1);
                        return;
                    }
                    try {
                        this._animation = lottie.loadAnimation({
                            container: freshContainer,
                            renderer: "svg",
                            loop: true,
                            autoplay: true,
                            animationData: animData,
                        });
                        this._pendingState = null;
                    } catch {
                        if (retries > 0) this._scheduleLoad(state, retries - 1);
                    }
                })
                .catch(() => {
                    if (retries > 0) this._scheduleLoad(state, retries - 1);
                });
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
        const isLottie = !!STATE_ANIM_LOADER[targetState];

        return html`<div id="lottie-wrapper" class="${hasPosition ? "positioned" : "centered"}" style="${posStyle}">
            ${isLottie ? html`<div id="lottie-container"></div>` : nothing}
            ${
                isZzz
                    ? html`<div class="zzz-container">
                          <span class="z z1">Z</span>
                          <span class="z z2">Z</span>
                          <span class="z z3">Z</span>
                      </div>`
                    : nothing
            }
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
                transition: opacity 280ms var(--dvc-ease, ease);
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
                animation-play-state: var(--dvc-anim-state, running);
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
