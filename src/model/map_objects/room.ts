// noinspection CssUnresolvedCustomProperty
import { css, CSSResultGroup, svg, SVGTemplateResult } from "lit";
import { forwardHaptic } from "../../ha";

import { Context } from "./context";
import { deleteFromArray } from "../../utils";
import { OutlineType, RoomConfig } from "../../types/types";
import { PredefinedMapObject } from "./predefined-map-object";
import { SelectionType } from "../map_mode/selection-type";

export class Room extends PredefinedMapObject {
    private readonly _config: RoomConfig;

    constructor(config: RoomConfig, context: Context) {
        super(config, context);
        this._config = config;
    }

    private _renderRoomLabel(): SVGTemplateResult | null {
        const label = this._config.label;
        if (!label) return null;
        const mapped = this.vacuumToScaledMap(label.x, label.y);
        const text = label.text ?? "";
        if (!text) return null;
        const cx = mapped[0];
        const cy = mapped[1];
        const fontSize = 12 / this._context.scale();
        // Pilule-badge dimensionnée par estimation (pas de mesure DOM possible en rendu
        // SVG déclaratif) : largeur ≈ longueur du texte × largeur moyenne d'un glyphe,
        // + padding. Centrée sur le point de label, coins pleinement arrondis.
        const padX = fontSize * 0.72;
        const padY = fontSize * 0.34;
        const textW = Math.max(text.length, 1) * fontSize * 0.58;
        const w = textW + padX * 2;
        const h = fontSize + padY * 2;
        return svg`
            <g class="room-label">
                <rect class="room-label-pill"
                      x="${cx - w / 2}"
                      y="${cy - h / 2}"
                      width="${w}"
                      height="${h}"
                      rx="${h / 2}"
                      ry="${h / 2}"
                      pointer-events="none"></rect>
                <text class="room-label-text"
                      x="${cx}"
                      y="${cy}"
                      font-size="${fontSize}"
                      text-anchor="middle"
                      dominant-baseline="central"
                      pointer-events="none">
                    ${text}
                </text>
            </g>
        `;
    }

    public render(): SVGTemplateResult {
        return this.renderLabelOnly();
    }

    public renderLabelOnly(): SVGTemplateResult {
        const hasAnySelection = this._context.selectedRooms().length > 0;
        const isDimmed = hasAnySelection && !this._selected;
        const classes = [
            "room-wrapper",
            this._selected ? "selected" : "",
            isDimmed ? "dimmed" : "",
            `room-${`${this._config.id}`.replace(/[^a-zA-Z0-9_-]/g, "_")}-wrapper`,
        ]
            .filter(Boolean)
            .join(" ");
        return svg`
            <g class="${classes}">
                ${this._renderRoomLabel()}
            </g>
        `;
    }

    public toVacuum(): number | string {
        return this._config.id;
    }

    public getOutline(): OutlineType | undefined {
        return this._config.outline;
    }

    public async toggleFromHitTest(): Promise<void> {
        const currentMode = this._context.getCurrentMode();
        const currentModeIsRoom = currentMode?.selectionType === SelectionType.ROOM;

        if (!currentModeIsRoom) {
            this._context.activateRoomMode();
            await new Promise((resolve) => setTimeout(resolve, 150));

            const newMode = this._context.getCurrentMode();
            if (newMode?.selectionType !== SelectionType.ROOM) {
                return;
            }
        }

        const isAlreadyInSelected = this._context.selectedRooms().includes(this);

        if (
            !this._selected &&
            !isAlreadyInSelected &&
            this._context.selectedRooms().length >= this._context.maxSelections()
        ) {
            forwardHaptic("failure");
            return;
        }

        this._toggleSelected();

        if (this._selected) {
            if (!isAlreadyInSelected) {
                this._context.selectedRooms().push(this);
            }
        } else {
            if (isAlreadyInSelected) {
                deleteFromArray(this._context.selectedRooms(), this);
            }
        }

        this._context.selectionChanged();

        if (await this._context.runImmediately().catch(() => false)) {
            this._selected = false;
            deleteFromArray(this._context.selectedRooms(), this);
            this._context.selectionChanged();
            return;
        }

        forwardHaptic("selection");
        this.update();
    }

    public static get styles(): CSSResultGroup {
        return css`
            /* Pilule-badge sous le nom de pièce (fond sombre translucide premium). */
            .room-label-pill {
                fill: rgba(18, 18, 20, 0.55);
                transition:
                    fill 0.3s ease,
                    opacity 0.3s ease;
            }
            .room-label-text {
                fill: #fff;
                font-weight: 600;
                letter-spacing: 0.02em;
                font-family: inherit;
                pointer-events: none;
                transition:
                    opacity 0.3s ease,
                    fill 0.3s ease;
            }

            /* Mode pièce : badges atténués par défaut */
            .room-mode .room-label-pill,
            .room-mode .room-label-text {
                opacity: 0.55;
            }

            /* Pièce sélectionnée : badge en couleur d'accent, texte net */
            .room-wrapper.selected .room-label-pill {
                fill: var(--map-card-internal-primary-color, var(--primary-color, #0a84ff));
                /* Petit "pop" à la sélection — purement décoratif, centré sur la pilule. */
                transform-box: fill-box;
                transform-origin: center;
                animation: dvc-pill-pop 320ms var(--dvc-ease, cubic-bezier(0.32, 0.72, 0, 1));
            }

            @keyframes dvc-pill-pop {
                0% {
                    transform: scale(0.86);
                }
                55% {
                    transform: scale(1.06);
                }
                100% {
                    transform: scale(1);
                }
            }

            @media (prefers-reduced-motion: reduce) {
                .room-wrapper.selected .room-label-pill {
                    animation: none;
                }
            }
            .room-wrapper.selected .room-label-text {
                fill: #fff;
                font-weight: 700;
            }
            .room-mode .room-wrapper.selected .room-label-pill,
            .room-mode .room-wrapper.selected .room-label-text {
                opacity: 1;
            }

            /* Pièces non sélectionnées quand une sélection est active */
            .room-mode .room-wrapper.dimmed .room-label-pill,
            .room-mode .room-wrapper.dimmed .room-label-text {
                opacity: 0.3;
            }
            .room-wrapper.dimmed .room-label-pill,
            .room-wrapper.dimmed .room-label-text {
                opacity: 0.4;
            }
        `;
    }
}
