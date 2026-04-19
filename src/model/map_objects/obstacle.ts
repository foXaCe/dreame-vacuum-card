// noinspection CssUnresolvedCustomProperty
import { css, CSSResultGroup, svg, SVGTemplateResult } from "lit";
import { MapObject } from "./map-object";
import { Context } from "./context";

export interface ObstacleConfig {
    id: string;
    x: number;
    y: number;
    type: number;
    possibility: number;
    ignore_status: number;
    picture_status?: number;
    object_id?: string;
    pos_x?: number;
    pos_y?: number;
    width?: number;
    height?: number;
    segment?: number;
    color_index?: number;
}

// Types d'obstacles de l'app Dreame
const OBSTACLE_ICONS: Record<number, string> = {
    0: "mdi:help-circle", // Unknown
    1: "mdi:power-socket", // Power cord
    2: "mdi:shoe-heel", // Shoes
    3: "mdi:excrement", // Pet waste
    4: "mdi:table-furniture", // Table/Furniture base
    5: "mdi:hanger", // Clothes
    6: "mdi:teddy-bear", // Toy
    7: "mdi:chair-rolling", // Chair
    8: "mdi:scale", // Scale
    9: "mdi:water-outline", // Liquid stain
    10: "mdi:water-off-outline", // Dried stain
    11: "mdi:water-alert-outline", // Mixed stain
    12: "mdi:water-check-outline", // Detected stain
};

export class Obstacle extends MapObject {
    private readonly _config: ObstacleConfig;

    constructor(config: ObstacleConfig, context: Context) {
        super(context);
        this._config = config;
    }

    public render(): SVGTemplateResult {
        const mapped = this.vacuumToScaledMap(this._config.x, this._config.y);
        const isIgnored = this._config.ignore_status === 1 || this._config.ignore_status === 2;
        const icon = OBSTACLE_ICONS[this._config.type] || "mdi:alert-circle";

        return svg`
            <g class="obstacle-wrapper ${isIgnored ? "ignored" : ""}"
               data-obstacle-id="${this._config.id}"
               data-obstacle-type="${this._config.type}">
                <foreignObject class="obstacle-icon-foreign-object"
                               style="--x-obstacle: ${mapped[0]}px; --y-obstacle: ${mapped[1]}px;"
                               x="${mapped[0]}px" y="${mapped[1]}px"
                               width="50px" height="50px">
                    <body xmlns="http://www.w3.org/1999/xhtml">
                        <div class="obstacle-icon-wrapper ${isIgnored ? "obstacle-ignored" : ""}">
                            <div class="obstacle-background"></div>
                            <ha-icon icon="${icon}"></ha-icon>
                            ${
                                this._config.possibility != null
                                    ? svg`
                                <div class="obstacle-probability">${this._config.possibility}%</div>
                            `
                                    : ""
                            }
                        </div>
                    </body>
                </foreignObject>
            </g>
        `;
    }

    public static get styles(): CSSResultGroup {
        return css`
            .obstacle-wrapper {
                pointer-events: auto;
            }

            .obstacle-icon-foreign-object {
                overflow: visible;
                pointer-events: none;
            }

            .obstacle-icon-wrapper {
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
                width: calc(var(--map-card-internal-obstacle-icon-wrapper-size, 40px) / var(--map-scale));
                height: calc(var(--map-card-internal-obstacle-icon-wrapper-size, 40px) / var(--map-scale));
                transform: translate(-50%, -50%) scale(calc(1 / var(--map-scale)));
                pointer-events: auto;
                cursor: pointer;
                transition: transform var(--map-card-internal-transitions-duration) ease;
            }

            .obstacle-icon-wrapper:hover {
                transform: translate(-50%, -50%) scale(calc(1.2 / var(--map-scale)));
            }

            .obstacle-background {
                position: absolute;
                width: 100%;
                height: 100%;
                border-radius: 50%;
                background: var(--map-card-internal-obstacle-icon-background-color, rgba(255, 152, 0, 0.15));
                border: calc(2px / var(--map-scale)) solid var(--map-card-internal-obstacle-icon-border-color, #ff9800);
                box-shadow: 0 calc(2px / var(--map-scale)) calc(8px / var(--map-scale)) rgba(0, 0, 0, 0.2);
                transition: all var(--map-card-internal-transitions-duration) ease;
            }

            .obstacle-icon-wrapper ha-icon {
                position: relative;
                z-index: 1;
                color: var(--map-card-internal-obstacle-icon-color, #ff9800);
                --mdc-icon-size: calc(var(--map-card-internal-obstacle-icon-size, 24px) / var(--map-scale));
                transition: color var(--map-card-internal-transitions-duration) ease;
            }

            .obstacle-probability {
                position: absolute;
                bottom: -15px;
                left: 50%;
                transform: translateX(-50%);
                font-size: calc(10px / var(--map-scale));
                font-weight: bold;
                color: var(--map-card-internal-obstacle-probability-color, #666);
                background: var(--map-card-internal-obstacle-probability-background, rgba(255, 255, 255, 0.9));
                padding: calc(2px / var(--map-scale)) calc(4px / var(--map-scale));
                border-radius: calc(4px / var(--map-scale));
                white-space: nowrap;
                pointer-events: none;
            }

            .obstacle-ignored .obstacle-background {
                background: var(--map-card-internal-obstacle-ignored-background-color, rgba(128, 128, 128, 0.1));
                border-color: var(--map-card-internal-obstacle-ignored-border-color, #999);
                opacity: 0.5;
            }

            .obstacle-ignored ha-icon {
                color: var(--map-card-internal-obstacle-ignored-icon-color, #999);
                opacity: 0.5;
            }

            .obstacle-ignored .obstacle-probability {
                opacity: 0.5;
            }
        `;
    }
}
