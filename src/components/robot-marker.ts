import { LitElement, html, css, nothing, CSSResultGroup } from "lit";
import { customElement, property } from "lit/decorators.js";

/**
 * Marqueur de robot en overlay (option 2 anti-flash).
 *
 * Le robot n'est plus « cuit » dans le PNG rendu par l'intégration (il faut cocher
 * « Robot Icon » dans les *Hidden map objects* de l'intégration) : il est dessiné ici,
 * positionné en pourcentage de l'image de carte et orienté selon son cap. Les
 * transitions CSS interpolent les sauts de position (~5 FPS) en un glissement fluide,
 * ce qui supprime le clignotement causé par le rechargement complet de l'<img>.
 *
 * Le marqueur est conçu pour pointer vers +x (la droite) à `rotate(0deg)` : l'appelant
 * fournit le cap déjà exprimé en angle écran (atan2 sur un vecteur transformé par la
 * calibration), donc valable quelle que soit la rotation/perspective de la carte.
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

    protected render(): unknown {
        if (!this.visible || this.xPercent < 0 || this.yPercent < 0) {
            return nothing;
        }
        const pos = `left: ${this.xPercent}%; top: ${this.yPercent}%; --rm-glide: ${this.transitionMs}ms;`;
        const rot = `transform: rotate(${this.headingDeg}deg);`;
        return html`<div id="marker" style="${pos}">
            <div id="icon" style="${rot}">
                ${this.beamUrl ? html`<img id="beam-img" src="${this.beamUrl}" alt="" />` : nothing}
                ${
                    this.iconUrl
                        ? html`<img id="robot-img" src="${this.iconUrl}" alt="" />`
                        : html`<svg viewBox="0 0 32 32" width="24" height="24" aria-hidden="true">
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
                width: 0;
                height: 0;
                /* translate(-50%,-50%) : centre l'icône sur le point ; la transition sur
                   left/top interpole les mises à jour discrètes en glissement fluide.
                   La durée est pilotée par la carte (--rm-glide) : elle mesure la cadence
                   réelle des échantillons vacuum_position (~3 s, push cloud Dreame) et fait
                   glisser le marqueur sur presque tout l'intervalle — mouvement continu au
                   lieu d'un à-coup de 0,4 s suivi d'une pause. linear voulu : vitesse
                   constante entre deux points de passage (un easing ferait « élastiquer »). */
                transform: translate(-50%, -50%);
                transition:
                    left var(--rm-glide, 400ms) linear,
                    top var(--rm-glide, 400ms) linear;
                will-change: left, top;
            }

            #icon {
                position: absolute;
                left: -12px;
                top: -12px;
                width: 24px;
                height: 24px;
                transform-origin: center;
                transition: transform 0.4s linear;
                will-change: transform;
                filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.45));
            }

            #robot-img {
                display: block;
                width: 24px;
                height: 24px;
                object-fit: contain;
            }

            /* Faisceau fill-light : derrière le corps, ouverture vers +x ; il
               hérite de la rotation de #icon, donc suit le cap tout seul. */
            #beam-img {
                position: absolute;
                left: 62%; /* démarre au nez du robot, déborde vers +x */
                top: 50%;
                width: 34px;
                height: 34px;
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
                width: 22px;
                height: 22px;
                margin: -11px 0 0 -11px;
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
