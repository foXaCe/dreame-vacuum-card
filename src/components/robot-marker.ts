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

    protected render(): unknown {
        if (!this.visible || this.xPercent < 0 || this.yPercent < 0) {
            return nothing;
        }
        const pos = `left: ${this.xPercent}%; top: ${this.yPercent}%;`;
        const rot = `transform: rotate(${this.headingDeg}deg);`;
        return html`<div id="marker" style="${pos}">
            <div id="icon" style="${rot}">
                <svg viewBox="0 0 32 32" width="28" height="28" aria-hidden="true">
                    <polygon points="30,16 20,9.5 20,22.5" class="beak" />
                    <circle cx="16" cy="16" r="10" class="halo" />
                    <circle cx="16" cy="16" r="7.5" class="body" />
                </svg>
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
                   left/top interpole les mises à jour discrètes en glissement fluide. */
                transform: translate(-50%, -50%);
                transition:
                    left 0.4s linear,
                    top 0.4s linear;
                will-change: left, top;
            }

            #icon {
                position: absolute;
                left: -14px;
                top: -14px;
                width: 28px;
                height: 28px;
                transform-origin: center;
                transition: transform 0.4s linear;
                will-change: transform;
                filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.45));
            }

            .beak {
                fill: var(--map-card-internal-primary-color, var(--primary-color, #03a9f4));
            }

            .halo {
                fill: #ffffff;
            }

            .body {
                fill: var(--map-card-internal-primary-color, var(--primary-color, #03a9f4));
            }
        `;
    }
}
