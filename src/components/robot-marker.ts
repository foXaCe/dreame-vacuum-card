import { LitElement, html, css, nothing, CSSResultGroup } from "lit";
import { customElement, property, state } from "lit/decorators.js";

/**
 * Marqueur de robot en overlay (option 2 anti-flash).
 *
 * Le robot n'est plus « cuit » dans le PNG rendu par l'intégration (il faut cocher
 * « Robot Icon » dans les *Hidden map objects* de l'intégration) : il est dessiné ici,
 * positionné en pourcentage de l'image de carte et orienté selon son cap.
 *
 * ## Pourquoi une interpolation JavaScript (requestAnimationFrame) et pas une
 *    transition CSS ?
 *
 * Deux mécanismes ont été essayés avant celle-ci, tous deux en échec sur certains
 * GPU/WebView (tablette Android en particulier) :
 *
 * 1. `left/top` animés par transition CSS → layout + repaint par frame sur un
 *    calque promu (`will-change: left, top`) : rémanences visibles le long de la
 *    trace (signalement 2026-07-07).
 * 2. `transform: translate(x%, y%)` animé par transition CSS (fix 5.11.1) : le
 *    déplacement passe par le compositor, mais la transition est **interrompue à
 *    chaque nouvelle position** (~1 échantillon toutes les 3 s pendant le
 *    nettoyage, glisse ~2,8 s). Une transition CSS interrompue sur un calque
 *    promu (`will-change: transform`) laisse parfois la frame précédente
 *    affichée — le robot apparaît alors en double, « en retard » sur sa position
 *    réelle (signalement persistant post-5.11.1, tablette Android).
 *
 * La présente version interpole la position en JavaScript via
 * `requestAnimationFrame` et écrit `transform` directement sur le nœud à chaque
 * frame. Il n'y a **aucune transition CSS à interrompre** : le calque est promu
 * une fois (un seul `will-change`, sur l'élément interne) et sa transform est
 * mise à jour en continu — aucune frame résiduelle ne peut rester affichée.
 *
 * Le cap suit la même interpolation (déjà déroulé par l'appelant pour éviter le
 * tour complet à ±180°). La durée de glisse est pilotée par la carte
 * (`transitionMs`) : elle mesure la cadence réelle des échantillons
 * `vacuum_position` (~3 s, push cloud Dreame) et fait glisser le marqueur sur
 * presque tout l'intervalle — mouvement continu au lieu d'un à-coup.
 */
@customElement("dreame-robot-marker")
export class RobotMarker extends LitElement {
    @property({ type: Number })
    public xPercent = -1;

    @property({ type: Number })
    public yPercent = -1;

    @property({ type: Number })
    public headingDeg = 0;

    @property({ type: Boolean })
    public visible = false;

    @property({ type: Boolean, reflect: true })
    public active = false;

    /** Durée de glisse (ms) entre deux positions — fournie par la carte d'après la
     *  cadence mesurée des échantillons `vacuum_position` (défaut : 400 ms). */
    @property({ type: Number })
    public transitionMs = 400;

    /** Icône robot réelle fournie par l'intégration (attribut caméra `robot_icon`,
     *  data URI, vue de dessus orientée +x — contrat §5.I). Fallback : SVG robot. */
    @property({ attribute: false })
    public iconUrl?: string;

    /** Cône de lumière « fill light » fourni par l'intégration (attribut caméra
     *  `robot_beam_icon`, data URI, sommet à gauche / ouverture vers +x — même
     *  convention que iconUrl). Absent = pas de faisceau (fill light éteinte,
     *  ou intégration antérieure au contrat). */
    @property({ attribute: false })
    public beamUrl?: string;

    /** Position/cap courant (interpolés) — écrits dans le DOM à chaque frame. */
    @state()
    private _currentX = 0;

    @state()
    private _currentY = 0;

    @state()
    private _currentHeading = 0;

    /** Animation en cours (interpolation rAF). */
    private _rafId: number | undefined;
    private _animStart = 0;
    private _animDuration = 0;
    private _fromX = 0;
    private _fromY = 0;
    private _fromHeading = 0;
    private _toX = 0;
    private _toY = 0;
    private _toHeading = 0;
    /** `true` une fois la première position reçue (permet de téléporter au lieu
     *  de glisser depuis une position absente). */
    private _hasPosition = false;
    /** Date des dernières propriétés cibles appliquées — évite de relancer
     *  l'animation quand le parent re-rend avec les mêmes valeurs. */
    private _lastAppliedKey = "";

    connectedCallback(): void {
        super.connectedCallback();
        // Si une animation était en cours avant un disconnect (dashboard non
        // visible), la reprendre : sans cela le marqueur resterait figé.
        if (this.visible && this._rafId === undefined && this._animDuration > 0 && this._hasPosition) {
            this._restartAnimation();
        }
    }

    disconnectedCallback(): void {
        this._cancelAnimation();
        super.disconnectedCallback();
    }

    /** Recalcule les cibles d'interpolation quand les propriétés changent. */
    protected willUpdate(changed: PropertiesChanged): void {
        if (
            changed.has("xPercent") ||
            changed.has("yPercent") ||
            changed.has("headingDeg") ||
            changed.has("transitionMs")
        ) {
            const key = `${this.xPercent},${this.yPercent},${this.headingDeg}`;
            if (key === this._lastAppliedKey && this._hasPosition) {
                return; // le parent re-rend avec les mêmes valeurs : ne rien relancer
            }
            this._lastAppliedKey = key;

            // Première position (ou re-masquage puis réapparition) : téléporter
            // directement — aucune glisse depuis une position inexistante.
            if (!this._hasPosition) {
                this._hasPosition = true;
                this._currentX = this.xPercent;
                this._currentY = this.yPercent;
                this._currentHeading = this.headingDeg;
                this._animDuration = 0;
                this._cancelAnimation();
                return;
            }

            const duration = this.transitionMs > 0 ? this.transitionMs : 0;
            this._fromX = this._currentX;
            this._fromY = this._currentY;
            this._fromHeading = this._currentHeading;
            this._toX = this.xPercent;
            this._toY = this.yPercent;
            this._toHeading = this.headingDeg;
            this._animDuration = duration;

            if (duration <= 0) {
                // Téléportation (saut > 20 % de la diagonale, changement de carte…) :
                // poser la cible immédiatement, aucune interpolation.
                this._currentX = this._toX;
                this._currentY = this._toY;
                this._currentHeading = this._toHeading;
                this._cancelAnimation();
                return;
            }
            this._restartAnimation();
        }
    }

    private _restartAnimation(): void {
        this._cancelAnimation();
        this._animStart = performance.now();
        const step = (now: number): void => {
            const t = Math.min(1, (now - this._animStart) / this._animDuration);
            // `linear` volontaire : vitesse constante entre deux points de passage
            // (un easing ferait « élastiquer » le robot en fin de course).
            this._currentX = this._fromX + (this._toX - this._fromX) * t;
            this._currentY = this._fromY + (this._toY - this._fromY) * t;
            this._currentHeading = this._fromHeading + (this._toHeading - this._fromHeading) * t;
            if (t < 1) {
                this._rafId = requestAnimationFrame(step);
            } else {
                this._rafId = undefined;
            }
        };
        this._rafId = requestAnimationFrame(step);
    }

    private _cancelAnimation(): void {
        if (this._rafId !== undefined) {
            cancelAnimationFrame(this._rafId);
            this._rafId = undefined;
        }
    }

    protected render(): unknown {
        if (!this.visible || this.xPercent < 0 || this.yPercent < 0) {
            return nothing;
        }
        // Le translate utilise la position INTERPOLÉE (état _currentX/_currentY),
        // mis à jour par rAF à chaque frame. Le rotate suit le cap interpolé.
        const pos = `transform: translate(${this._currentX}%, ${this._currentY}%);`;
        const rot = `transform: rotate(${this._currentHeading}deg);`;
        return html`<div id="marker" style="${pos}">
            <div id="icon" style="${rot}">
                ${this.beamUrl ? html`<img id="beam-img" src="${this.beamUrl}" alt="" />` : nothing}
                ${
                    this.iconUrl
                        ? html`<img id="robot-img" src="${this.iconUrl}" alt="" />`
                        : html`<svg viewBox="0 0 32 32" width="21" height="21" aria-hidden="true">
                              <!-- Robot aspirateur vu de dessus, orienté vers +x à rotate(0) :
                               halo de contraste, corps, pare-chocs avant (cap) et tourelle lidar. -->
                              <circle cx="16" cy="16" r="14" class="halo" />
                              <circle cx="16" cy="16" r="12.4" class="body" />
                              <path class="beak" d="M 24.8 8.9 A 11.3 11.3 0 0 1 24.8 23.1" />
                              <circle cx="16" cy="16" r="5.2" class="lidar" />
                              <circle cx="16" cy="16" r="2.4" class="lidar-dot" />
                          </svg>`
                }
            </div>
        </div>`;
    }

    public static get styles(): CSSResultGroup {
        return css`
            :host {
                position: absolute;
                inset: 0;
                z-index: 3;
                pointer-events: none;
            }

            #marker {
                position: absolute;
                left: 0;
                top: 0;
                /* Boîte pleine taille : un translate(x%, y%) se réfère à la taille de
                   l'ÉLÉMENT, donc ici au conteneur de la carte — le coin haut-gauche de
                   #marker devient le point (x, y) et #icon (offsets négatifs) s'y centre.
                   Le déplacement est écrit à chaque frame par rAF (transform direct) :
                   AUCUNE transition CSS, donc aucune transition à interrompre — c'est ce
                   qui laissait des frames résiduelles (« fantômes ») sur WebView Android. */
                width: 100%;
                height: 100%;
                pointer-events: none;
                will-change: transform;
            }

            #icon {
                position: absolute;
                left: -10.5px;
                top: -10.5px;
                width: 21px;
                height: 21px;
                transform-origin: center;
                filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.45));
            }

            #robot-img {
                display: block;
                width: 21px;
                height: 21px;
                object-fit: contain;
            }

            /* Faisceau fill-light : derrière le corps, ouverture vers +x ; il
               hérite de la rotation de #icon, donc suit le cap tout seul. */
            #beam-img {
                position: absolute;
                left: 62%; /* démarre au nez du robot, déborde vers +x */
                top: 50%;
                width: 30px;
                height: 30px;
                transform: translateY(-50%);
                object-fit: contain;
                z-index: -1; /* derrière le robot, comme le halo sonar */
                pointer-events: none;
                opacity: 0.95;
                transition: opacity 0.3s ease;
            }

            /* Halo de contraste : garde le robot lisible sur toutes les couleurs de sol. */
            .halo {
                fill: var(--map-card-robot-halo, rgba(255, 255, 255, 0.92));
            }

            /* Corps du robot (blanc cassé, façon Dreame) — surchargeable par thème. */
            .body {
                fill: var(--map-card-robot-body, #eceff1);
                stroke: rgba(0, 0, 0, 0.22);
                stroke-width: 0.75;
            }

            /* Pare-chocs avant en couleur d'accent : c'est lui qui indique le cap. */
            .beak {
                fill: none;
                stroke: var(--map-card-internal-primary-color, var(--primary-color, #03a9f4));
                stroke-width: 2.4;
                stroke-linecap: round;
            }

            .lidar {
                fill: var(--map-card-robot-lidar, #cfd4d9);
                stroke: rgba(0, 0, 0, 0.18);
                stroke-width: 0.6;
            }

            .lidar-dot {
                fill: var(--map-card-internal-primary-color, var(--primary-color, #03a9f4));
            }

            /* Sonar-like halo while the robot is actively cleaning (Find My-style, premium). */
            :host([active]) #icon::after {
                content: "";
                position: absolute;
                left: 50%;
                top: 50%;
                width: 19px;
                height: 19px;
                margin: -9.5px 0 0 -9.5px;
                border-radius: 50%;
                background: radial-gradient(
                    circle,
                    var(--map-card-internal-primary-color, var(--primary-color, #03a9f4)) 0%,
                    transparent 70%
                );
                z-index: -1;
                pointer-events: none;
                animation: dvc-robot-pulse 2.6s ease-out infinite;
                animation-play-state: var(--dvc-anim-state, running);
            }

            @keyframes dvc-robot-pulse {
                0% {
                    transform: scale(0.7);
                    opacity: 0.5;
                }
                70%,
                100% {
                    transform: scale(2.4);
                    opacity: 0;
                }
            }

            @media (prefers-reduced-motion: reduce) {
                :host([active]) #icon::after {
                    animation: none;
                }
            }
        `;
    }
}

/** Type minimal des changedProperties de Lit pour willUpdate. */
interface PropertiesChanged {
    has(name: PropertyKey): boolean;
}
