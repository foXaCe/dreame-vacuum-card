import { css, CSSResultGroup } from "lit";
import { MapObject } from "./model/map_objects/map-object";
import { ManualRectangle } from "./model/map_objects/manual-rectangle";
import { PredefinedMultiRectangle } from "./model/map_objects/predefined-multi-rectangle";
import { ManualPath } from "./model/map_objects/manual-path";
import { ManualPoint } from "./model/map_objects/manual-point";
import { PredefinedPoint } from "./model/map_objects/predefined-point";
import { Room } from "./model/map_objects/room";

/** Styles du composant principal dreame-vacuum-card (extrait du composant pour lisibilité). */
export const cardStyles: CSSResultGroup = css`
    ha-card {
        overflow: hidden;
        display: flow-root;
        container-type: inline-size;
        container-name: vacuum-card;
        --map-card-internal-primary-color: var(--map-card-primary-color, var(--slider-color));
        --map-card-internal-primary-text-color: var(--map-card-primary-text-color, var(--primary-text-color));
        --map-card-internal-secondary-color: var(--map-card-secondary-color, var(--slider-secondary-color));
        --map-card-internal-secondary-text-color: var(--map-card-secondary-text-color, var(--text-light-primary-color));
        --map-card-internal-tertiary-color: var(--map-card-tertiary-color, var(--secondary-background-color));
        --map-card-internal-tertiary-text-color: var(--map-card-tertiary-text-color, var(--primary-text-color));
        --map-card-internal-disabled-text-color: var(--map-card-disabled-text-color, var(--disabled-text-color));
        --map-card-internal-zoomer-background: var(
            --map-card-zoomer-background,
            var(--map-card-internal-tertiary-color)
        );
        --map-card-internal-ripple-color: var(--map-card-ripple-color, #7a7f87);
        --map-card-internal-big-radius: var(--map-card-big-radius, 25px);
        --map-card-internal-small-radius: var(--map-card-small-radius, 18px);
        --map-card-internal-predefined-point-icon-wrapper-size: var(
            --map-card-predefined-point-icon-wrapper-size,
            36px
        );
        --map-card-internal-predefined-point-icon-size: var(--map-card-predefined-point-icon-size, 24px);
        --map-card-internal-predefined-point-icon-color: var(
            --map-card-predefined-point-icon-color,
            var(--map-card-internal-secondary-text-color)
        );
        --map-card-internal-predefined-point-icon-color-selected: var(
            --map-card-predefined-point-icon-color-selected,
            var(--map-card-internal-primary-text-color)
        );
        --map-card-internal-predefined-point-icon-background-color: var(
            --map-card-predefined-point-icon-background-color,
            var(--map-card-internal-secondary-color)
        );
        --map-card-internal-predefined-point-icon-background-color-selected: var(
            --map-card-predefined-point-icon-background-color-selected,
            var(--map-card-internal-primary-color)
        );
        --map-card-internal-predefined-point-label-color: var(
            --map-card-predefined-point-label-color,
            var(--map-card-internal-secondary-text-color)
        );
        --map-card-internal-predefined-point-label-color-selected: var(
            --map-card-predefined-point-label-color-selected,
            var(--map-card-internal-primary-text-color)
        );
        --map-card-internal-predefined-point-label-font-size: var(--map-card-predefined-point-label-font-size, 12px);
        --map-card-internal-manual-point-radius: var(--map-card-manual-point-radius, 5px);
        --map-card-internal-manual-point-line-color: var(--map-card-manual-point-line-color, yellow);
        --map-card-internal-manual-point-fill-color: var(--map-card-manual-point-fill-color, transparent);
        --map-card-internal-manual-point-line-width: var(--map-card-manual-point-line-width, 1px);
        --map-card-internal-manual-path-point-radius: var(--map-card-manual-path-point-radius, 5px);
        --map-card-internal-manual-path-point-line-color: var(--map-card-manual-path-point-line-color, yellow);
        --map-card-internal-manual-path-point-fill-color: var(--map-card-manual-path-point-fill-color, transparent);
        --map-card-internal-manual-path-point-line-width: var(--map-card-manual-path-point-line-width, 1px);
        --map-card-internal-manual-path-line-color: var(--map-card-manual-path-line-color, yellow);
        --map-card-internal-manual-path-line-width: var(--map-card-manual-path-line-width, 1px);
        --map-card-internal-predefined-rectangle-line-width: var(--map-card-predefined-rectangle-line-width, 1px);
        --map-card-internal-predefined-rectangle-line-color: var(--map-card-predefined-rectangle-line-color, white);
        --map-card-internal-predefined-rectangle-fill-color: var(
            --map-card-predefined-rectangle-fill-color,
            transparent
        );
        --map-card-internal-predefined-rectangle-line-color-selected: var(
            --map-card-predefined-rectangle-line-color-selected,
            white
        );
        --map-card-internal-predefined-rectangle-fill-color-selected: var(
            --map-card-predefined-rectangle-fill-color-selected,
            rgba(255, 255, 255, 0.2)
        );
        --map-card-internal-predefined-rectangle-line-segment-line: var(
            --map-card-predefined-rectangle-line-segment-line,
            10px
        );
        --map-card-internal-predefined-rectangle-line-segment-gap: var(
            --map-card-predefined-rectangle-line-segment-gap,
            5px
        );
        --map-card-internal-predefined-rectangle-icon-wrapper-size: var(
            --map-card-predefined-rectangle-icon-wrapper-size,
            36px
        );
        --map-card-internal-predefined-rectangle-icon-size: var(--map-card-predefined-rectangle-icon-size, 24px);
        --map-card-internal-predefined-rectangle-icon-color: var(
            --map-card-predefined-rectangle-icon-color,
            var(--map-card-internal-secondary-text-color)
        );
        --map-card-internal-predefined-rectangle-icon-color-selected: var(
            --map-card-predefined-rectangle-icon-color-selected,
            var(--map-card-internal-primary-text-color)
        );
        --map-card-internal-predefined-rectangle-icon-background-color: var(
            --map-card-predefined-rectangle-icon-background-color,
            var(--map-card-internal-secondary-color)
        );
        --map-card-internal-predefined-rectangle-icon-background-color-selected: var(
            --map-card-predefined-rectangle-icon-background-color-selected,
            var(--map-card-internal-primary-color)
        );
        --map-card-internal-predefined-rectangle-label-color: var(
            --map-card-predefined-rectangle-label-color,
            var(--map-card-internal-secondary-text-color)
        );
        --map-card-internal-predefined-rectangle-label-color-selected: var(
            --map-card-predefined-rectangle-label-color-selected,
            var(--map-card-internal-primary-text-color)
        );
        --map-card-internal-predefined-rectangle-label-font-size: var(
            --map-card-predefined-rectangle-label-font-size,
            12px
        );
        --map-card-internal-manual-rectangle-line-width: var(--map-card-manual-rectangle-line-width, 1px);
        --map-card-internal-manual-rectangle-line-color: var(--map-card-manual-rectangle-line-color, white);
        --map-card-internal-manual-rectangle-fill-color: var(
            --map-card-manual-rectangle-fill-color,
            rgba(255, 255, 255, 0.2)
        );
        --map-card-internal-manual-rectangle-line-color-selected: var(
            --map-card-manual-rectangle-line-color-selected,
            white
        );
        --map-card-internal-manual-rectangle-fill-color-selected: var(
            --map-card-manual-rectangle-fill-color-selected,
            transparent
        );
        --map-card-internal-manual-rectangle-line-segment-line: var(
            --map-card-manual-rectangle-line-segment-line,
            10px
        );
        --map-card-internal-manual-rectangle-line-segment-gap: var(--map-card-manual-rectangle-line-segment-gap, 5px);
        --map-card-internal-manual-rectangle-description-color: var(
            --map-card-manual-rectangle-description-color,
            white
        );
        --map-card-internal-manual-rectangle-description-font-size: var(
            --map-card-manual-rectangle-description-font-size,
            12px
        );
        --map-card-internal-manual-rectangle-description-offset-x: var(
            --map-card-manual-rectangle-description-offset-x,
            2px
        );
        --map-card-internal-manual-rectangle-description-offset-y: var(
            --map-card-manual-rectangle-description-offset-y,
            -8px
        );
        --map-card-internal-manual-rectangle-delete-circle-radius: var(
            --map-card-manual-rectangle-delete-circle-radius,
            13px
        );
        --map-card-internal-manual-rectangle-delete-circle-line-color: var(
            --map-card-manual-rectangle-delete-circle-line-color,
            white
        );
        --map-card-internal-manual-rectangle-delete-circle-fill-color: var(
            --map-card-manual-rectangle-delete-circle-fill-color,
            var(--map-card-internal-secondary-color)
        );
        --map-card-internal-manual-rectangle-delete-circle-line-color-selected: var(
            --map-card-manual-rectangle-delete-circle-line-color-selected,
            white
        );
        --map-card-internal-manual-rectangle-delete-circle-fill-color-selected: var(
            --map-card-manual-rectangle-delete-circle-fill-color-selected,
            var(--map-card-internal-primary-color)
        );
        --map-card-internal-manual-rectangle-delete-circle-line-width: var(
            --map-card-manual-rectangle-delete-circle-line-width,
            1px
        );
        --map-card-internal-manual-rectangle-delete-icon-color: var(
            --map-card-manual-rectangle-delete-icon-color,
            var(--map-card-internal-secondary-text-color)
        );
        --map-card-internal-manual-rectangle-delete-icon-color-selected: var(
            --map-card-manual-rectangle-delete-icon-color-selected,
            var(--map-card-internal-primary-text-color)
        );
        --map-card-internal-manual-rectangle-resize-circle-radius: var(
            --map-card-manual-rectangle-resize-circle-radius,
            13px
        );
        --map-card-internal-manual-rectangle-resize-circle-line-color: var(
            --map-card-manual-rectangle-resize-circle-line-color,
            white
        );
        --map-card-internal-manual-rectangle-resize-circle-fill-color: var(
            --map-card-manual-rectangle-resize-circle-fill-color,
            var(--map-card-internal-secondary-color)
        );
        --map-card-internal-manual-rectangle-resize-circle-line-color-selected: var(
            --map-card-manual-rectangle-resize-circle-line-color-selected,
            white
        );
        --map-card-internal-manual-rectangle-resize-circle-fill-color-selected: var(
            --map-card-manual-rectangle-resize-circle-fill-color-selected,
            var(--map-card-internal-primary-color)
        );
        --map-card-internal-manual-rectangle-resize-circle-line-width: var(
            --map-card-manual-rectangle-resize-circle-line-width,
            1px
        );
        --map-card-internal-manual-rectangle-resize-icon-color: var(
            --map-card-manual-rectangle-resize-icon-color,
            var(--map-card-internal-secondary-text-color)
        );
        --map-card-internal-manual-rectangle-resize-icon-color-selected: var(
            --map-card-manual-rectangle-resize-icon-color-selected,
            var(--map-card-internal-primary-text-color)
        );
        --map-card-internal-room-label-color: var(--map-card-room-label-color, #333);
        --map-card-internal-room-label-font-size: var(--map-card-room-label-font-size, 12px);
        --map-card-internal-transitions-duration: var(--map-card-transitions-duration, 200ms);
    }

    /* Responsive: small cards (< 350px) */
    @container vacuum-card (max-width: 349px) {
        ha-card {
            --dvc-header-section-padding: 8px 10px 4px;
            --dvc-header-name-size: 15px;
            --dvc-header-status-size: 12px;
            --dvc-stats-gap: 14px;
            --dvc-stats-padding: 6px 10px;
            --dvc-stat-gap: 4px;
            --dvc-stat-font-size: 11px;
            --dvc-stat-icon-size: 15px;
            --dvc-action-host-padding: 6px 10px 12px;
            --dvc-action-gap: 8px;
            --dvc-action-btn-padding: 10px;
            --dvc-action-font-size: 13px;
            --dvc-action-icon-gap: 6px;
            --dvc-action-icon-size: 18px;
            --dvc-tab-padding: 8px 0;
            --dvc-tab-font-size: 12px;
            --dvc-tab-gap: 2px;
            --dvc-tab-icon-size: 18px;
            --dvc-chip-host-padding: 2px 10px;
            --dvc-chip-gap: 6px;
            --dvc-chip-padding: 8px 12px;
            --dvc-chip-font-size: 12px;
            --dvc-progress-host-padding: 0 10px 2px;
            --dvc-progress-font-size: 11px;
        }
        .map-wrapper {
            padding-top: 56px;
        }
        .controls-wrapper {
            margin: 10px;
            gap: 8px;
        }
        .map-actions-item {
            width: 42px;
            height: 42px;
        }
        .icon-on-map {
            width: 30px;
            height: 30px;
        }
        .standalone-icon-on-map {
            width: 30px;
            height: 30px;
        }
        .cycle-counter {
            font-size: 12px;
        }
        .updating-badge {
            font-size: 11px;
            padding: 4px 8px;
        }
    }

    /* Responsive: large cards (> 500px) */
    @container vacuum-card (min-width: 501px) {
        ha-card {
            --dvc-header-section-padding: 16px 20px 10px;
            --dvc-header-name-size: 20px;
            --dvc-stats-gap: 28px;
            --dvc-action-host-padding: 10px 20px 20px;
            --dvc-action-gap: 14px;
            --dvc-action-btn-padding: 16px;
        }
        .map-wrapper {
            padding-top: 80px;
        }
        .controls-wrapper {
            margin: 20px;
            gap: 14px;
        }
        .map-actions-item {
            width: 56px;
            height: 56px;
        }
        .icon-on-map {
            width: 40px;
            height: 40px;
        }
        .standalone-icon-on-map {
            width: 40px;
            height: 40px;
        }
    }

    .clickable {
        cursor: pointer;
    }

    .map-wrapper {
        position: relative;
        height: max-content;
        padding-top: 70px;
    }

    .map-container {
        position: relative;
    }

    #map-zoomer {
        overflow: hidden;
        display: block;
        --scale: 1;
        --x: 0;
        --y: 0;
        background: var(--map-card-internal-zoomer-background);
    }

    #map-zoomer-content {
        transform: translate(var(--x), var(--y)) scale(var(--scale));
        transform-origin: 0 0;
        position: relative;
    }

    #map-image {
        width: 100%;
        margin-bottom: -6px;
        pointer-events: none;
    }

    #map-image.zoomed {
        /* crisp-edges préserve les pixels sans flouter, en évitant l'aspect "grille"
                   brutal de pixelated. Fallback sur pixelated pour les navigateurs qui ne
                   reconnaissent pas crisp-edges. */
        image-rendering: pixelated;
        image-rendering: crisp-edges;
    }

    #room-selection-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1;
        pointer-events: none;
        transition: opacity 0.3s ease;
    }

    #map-image-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 2;
    }

    .standalone-icon-on-map {
        background-color: var(--map-card-internal-secondary-color);
        color: var(--map-card-internal-secondary-text-color);
        border-radius: var(--map-card-internal-small-radius);
        margin: 5px;
        width: 36px;
        height: 36px;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .map-zoom-icons {
        right: 0;
        bottom: 0;
        position: absolute;
        display: flex;
        flex-direction: column-reverse;
        background-color: var(--map-card-internal-secondary-color);
        color: var(--map-card-internal-secondary-text-color);
        border-radius: var(--map-card-internal-small-radius);
        margin: 5px;
        direction: ltr;
    }

    .map-return-base-button {
        left: 0;
        bottom: 0;
        position: absolute;
        display: inline-flex;
        background-color: var(--map-card-internal-secondary-color);
        color: var(--map-card-internal-secondary-text-color);
        border-radius: var(--map-card-internal-small-radius);
        margin: 5px;
        direction: ltr;
    }

    .updating-badge {
        top: 0;
        right: 0;
        position: absolute;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background-color: rgba(var(--rgb-warning-color, 255, 152, 0), 0.9);
        color: var(--text-primary-color, #ffffff);
        border-radius: var(--map-card-internal-small-radius);
        padding: 6px 12px;
        margin: 5px;
        font-size: 12px;
        font-weight: 500;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        animation: pulse-opacity 2s ease-in-out infinite;
    }

    .updating-icon {
        height: 18px;
        width: 18px;
        animation: spin 2s linear infinite;
    }

    @keyframes pulse-opacity {
        0%,
        100% {
            opacity: 0.9;
        }
        50% {
            opacity: 0.7;
        }
    }

    @keyframes spin {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }

    .map-zoom-icons-main {
        display: inline-flex;
        border-radius: var(--map-card-internal-small-radius);
        background-color: var(--map-card-internal-primary-color);
        color: var(--map-card-internal-primary-text-color);
    }

    .icon-on-map {
        touch-action: auto;
        pointer-events: auto;
        height: 36px;
        width: 36px;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .icon-on-map:focus-visible {
        outline: 2px solid var(--primary-color);
        outline-offset: 2px;
        border-radius: 50%;
    }

    .cycle-counter {
        font-size: 14px;
        font-weight: 700;
        font-family: inherit;
        user-select: none;
    }

    .icon-on-map.lock-active {
        color: var(--primary-color, #03a9f4);
    }

    .icon-on-map.zone-action {
        background-color: var(--map-card-internal-primary-color);
        color: var(--map-card-internal-primary-text-color);
        border-radius: var(--map-card-internal-small-radius);
    }

    .controls-wrapper {
        margin: 15px;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .map-controls {
        width: 100%;
        display: inline-flex;
        gap: 10px;
        place-content: space-between;
        flex-wrap: wrap;
    }

    .map-actions-list {
        border-radius: var(--map-card-internal-big-radius);
        overflow: hidden;
        background-color: var(--map-card-internal-secondary-color);
        color: var(--map-card-internal-secondary-text-color);
        margin-inline-start: auto;
        display: inline-flex;
        height: min-content;
    }

    .map-actions-item.main {
        border-radius: var(--map-card-internal-big-radius);
        background-color: var(--map-card-internal-primary-color);
        color: var(--map-card-internal-primary-text-color);
    }

    .map-actions-item {
        width: 50px;
        height: 50px;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: transparent;
    }

    .ripple {
        position: relative;
        overflow: hidden;
        transform: translate3d(0, 0, 0);
    }

    .ripple:after {
        content: "";
        display: block;
        position: absolute;
        border-radius: 50%;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        pointer-events: none;
        background-image: radial-gradient(circle, var(--map-card-internal-ripple-color) 2%, transparent 10.01%);
        background-repeat: no-repeat;
        background-position: 50%;
        transform: scale(10, 10);
        opacity: 0;
        transition:
            transform 0.5s,
            opacity 1s;
    }

    .ripple:active:after {
        transform: scale(0, 0);
        opacity: 0.7;
        transition: 0s;
    }

    ${MapObject.styles}
    ${ManualRectangle.styles}
            ${PredefinedMultiRectangle.styles}
            ${ManualPath.styles}
            ${ManualPoint.styles}
            ${PredefinedPoint.styles}
            ${Room.styles}
`;
