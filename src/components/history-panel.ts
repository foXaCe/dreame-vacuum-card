import { LitElement, html, css, TemplateResult, CSSResultGroup, nothing, PropertyValues } from "lit";
import { property, state } from "lit/decorators.js";
import { safeCustomElement } from "../utils/define-element";

import { forwardHaptic } from "../ha";
import { HomeAssistantFixed } from "../types/fixes";
import { localize } from "../localize/localize";
import { resolveDeviceEntities } from "../model/care/care-model";
import {
    HistoryRun,
    ObstaclePhoto,
    historySignature,
    parseCleaningHistory,
    parseObstaclePhotos,
} from "../model/history/history-model";

/** Nombre de nettoyages et de photos affichés : les plus récents d'abord. */
const MAX_RUNS = 10;
const MAX_PHOTOS = 12;

const KIND_ICONS: Record<string, string> = {
    room_cleaning: "mdi:floor-plan",
    zone_cleaning: "mdi:select-drag",
    spot_cleaning: "mdi:map-marker-radius",
    fast_mapping: "mdi:map-search-outline",
    cruising_path: "mdi:map-marker-path",
    cruising_point: "mdi:map-marker-path",
};

/**
 * Panneau repliable « Historique » : les derniers nettoyages avec la carte de chacun, et les
 * photos d'obstacles de la carte courante. Tout vient des attributs déjà exposés par
 * l'intégration (caméra de carte, capteur d'historique) ; les images ne sont chargées qu'à
 * l'ouverture, une à la fois pour les cartes.
 */
@safeCustomElement("dreame-history-panel")
export class HistoryPanel extends LitElement {
    @property({ attribute: false })
    public hass!: HomeAssistantFixed;

    @property({ attribute: false })
    public entityId!: string;

    /** Caméra de carte principale (porte `cleaning_history_picture` et `obstacle_picture`). */
    @property({ attribute: false })
    public cameraId?: string;

    @state() private _open = false;
    @state() private _selected = 0;
    @state() private _photo?: number;
    @state() private _failed = new Set<string>();

    private _sensorId?: string;
    private _sensorFor?: unknown;
    private _signature = "";

    private _t(key: string): string {
        return localize(`dreame_ui.history.${key}`, this._lang);
    }

    private get _lang(): string {
        return this.hass?.locale?.language ?? "";
    }

    private _historySensor(): string | undefined {
        if (this._sensorFor !== this.hass.entities) {
            this._sensorId = resolveDeviceEntities(this.hass, this.entityId)["sensor.cleaning_history"];
            this._sensorFor = this.hass.entities;
        }
        return this._sensorId;
    }

    private _data(): { runs: HistoryRun[]; photos: ObstaclePhoto[] } {
        const camera = this.cameraId ? this.hass.states[this.cameraId]?.attributes : undefined;
        const sensorId = this._historySensor();
        const sensor = sensorId ? this.hass.states[sensorId]?.attributes : undefined;
        return {
            runs: parseCleaningHistory(camera, sensor).slice(0, MAX_RUNS),
            photos: parseObstaclePhotos(camera).slice(0, MAX_PHOTOS),
        };
    }

    /** La caméra change à chaque image de carte : fermé, le panneau ne se redessine que si
     *  la liste des nettoyages ou des photos a changé. */
    protected shouldUpdate(changedProps: PropertyValues): boolean {
        if (!this.hass || !this.entityId) return false;
        if (!(changedProps.size === 1 && changedProps.has("hass"))) return true;
        const old = changedProps.get("hass") as HomeAssistantFixed | undefined;
        const sensorId = this._historySensor();
        const watched = [this.cameraId, sensorId].filter((id): id is string => !!id);
        if (old && watched.every((id) => old.states[id] === this.hass.states[id])) return false;
        if (this._open) return true;
        const { runs, photos } = this._data();
        return historySignature(runs, photos) !== this._signature;
    }

    private _url(path: string): string {
        return this.hass.hassUrl ? this.hass.hassUrl(path) : path;
    }

    private _kindLabel(run: HistoryRun): string {
        const label = localize(`dreame_ui.history.kind.${run.kindKey}`, this._lang, run.kind) || run.kind;
        return run.second ? `${label} · ${this._t("second_pass")}` : label;
    }

    private _date(run: HistoryRun): string {
        if (run.timestamp === undefined) return run.when;
        try {
            return new Date(run.timestamp * 1000).toLocaleString(this._lang || undefined, {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return run.when;
        }
    }

    private _toggle(): void {
        this._open = !this._open;
        this._photo = undefined;
    }

    private _select(index: number): void {
        if (this._selected === index) return;
        this._selected = index;
        forwardHaptic("selection");
    }

    private _imageFailed(url: string): void {
        this._failed = new Set(this._failed).add(url);
    }

    protected render(): TemplateResult | typeof nothing {
        if (!this.hass || !this.entityId || !this.hass.states[this.entityId]) return nothing;
        const { runs, photos } = this._data();
        this._signature = historySignature(runs, photos);
        if (!runs.length && !photos.length) return nothing;
        return html`
            <button class="toggle" aria-expanded=${this._open} @click=${this._toggle}>
                <ha-icon .icon=${"mdi:history"}></ha-icon>
                <span class="grow">${this._t("title")}</span>
                ${runs.length ? html`<span class="muted">${runs.length}</span>` : nothing}
                <ha-icon class="chevron ${this._open ? "open" : ""}" .icon=${"mdi:chevron-down"}></ha-icon>
            </button>
            ${this._open ? this._renderContent(runs, photos) : nothing}
        `;
    }

    private _renderContent(runs: HistoryRun[], photos: ObstaclePhoto[]): TemplateResult {
        const selected = runs[Math.min(this._selected, runs.length - 1)];
        return html`<div class="content">
            ${runs.length ? this._renderRuns(runs, selected) : nothing}
            ${photos.length ? this._renderPhotos(photos) : nothing}
        </div>`;
    }

    private _renderRuns(runs: HistoryRun[], selected: HistoryRun): TemplateResult {
        const failed = this._failed.has(selected.url);
        return html`
            <div class="runs" role="listbox" aria-label=${this._t("title")}>
                ${runs.map((run, i) => {
                    const on = run === selected;
                    const meta = [this._date(run), run.duration, run.area].filter(Boolean).join(" · ");
                    return html`<button
                        class="run ${on ? "on" : ""}"
                        role="option"
                        aria-selected=${on}
                        @click=${() => this._select(i)}
                    >
                        <ha-icon class="kind" .icon=${KIND_ICONS[run.kindKey] ?? "mdi:robot-vacuum"}></ha-icon>
                        <span class="grow">
                            <span class="run-title">${this._kindLabel(run)}</span>
                            <span class="muted">${meta}</span>
                        </span>
                        ${
                            run.completed === undefined
                                ? nothing
                                : html`<span class="badge ${run.completed ? "ok" : "warn"}"
                                      >${this._t(run.completed ? "completed" : "interrupted")}</span
                                  >`
                        }
                    </button>`;
                })}
            </div>
            <figure class="map">
                ${
                    failed
                        ? html`<div class="placeholder">
                              <ha-icon .icon=${"mdi:map-marker-off-outline"}></ha-icon>${this._t("map_unavailable")}
                          </div>`
                        : html`<img
                              src=${this._url(selected.url)}
                              alt=${`${this._t("map_of")} ${this._kindLabel(selected)} — ${this._date(selected)}`}
                              loading="lazy"
                              decoding="async"
                              @error=${() => this._imageFailed(selected.url)}
                          />`
                }
            </figure>
        `;
    }

    private _renderPhotos(photos: ObstaclePhoto[]): TemplateResult {
        const zoomed = this._photo !== undefined ? photos[this._photo] : undefined;
        const caption = (p: ObstaclePhoto): string =>
            [p.type, p.probability !== undefined ? `${p.probability} %` : undefined, ...p.details]
                .filter(Boolean)
                .join(" · ");
        return html`
            <div class="section-title">${this._t("obstacles")}</div>
            ${
                zoomed
                    ? html`<figure class="zoom">
                          <button
                              class="zoom-btn"
                              aria-label=${this._t("close_photo")}
                              @click=${() => (this._photo = undefined)}
                          >
                              <img src=${this._url(zoomed.url)} alt=${caption(zoomed)} decoding="async" />
                          </button>
                          <figcaption>${caption(zoomed)}</figcaption>
                      </figure>`
                    : nothing
            }
            <div class="photos">
                ${photos.map(
                    (p, i) =>
                        html`<button
                            class="photo ${this._photo === i ? "on" : ""}"
                            aria-label=${caption(p)}
                            aria-pressed=${this._photo === i}
                            @click=${() => (this._photo = this._photo === i ? undefined : i)}
                        >
                            ${
                                this._failed.has(p.url)
                                    ? html`<ha-icon .icon=${"mdi:image-off-outline"}></ha-icon>`
                                    : html`<img
                                          src=${this._url(p.url)}
                                          alt=""
                                          loading="lazy"
                                          decoding="async"
                                          @error=${() => this._imageFailed(p.url)}
                                      />`
                            }
                            <span class="photo-label">${p.type}</span>
                        </button>`
                )}
            </div>
        `;
    }

    public static get styles(): CSSResultGroup {
        return css`
            :host {
                display: block;
                padding: 0 16px 16px;
                color: var(--primary-text-color);
            }
            button {
                font: inherit;
                color: inherit;
            }
            button:focus-visible {
                outline: 2px solid var(--primary-color);
                outline-offset: 2px;
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
                font-size: 14px;
                font-weight: 590;
                text-align: start;
                cursor: pointer;
            }
            ha-icon {
                --mdc-icon-size: 20px;
                color: var(--secondary-text-color);
                flex: none;
            }
            .grow {
                flex: 1;
                min-width: 0;
            }
            .muted {
                color: var(--secondary-text-color);
                font-size: 13px;
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
                gap: 10px;
                padding-top: 10px;
            }
            .runs {
                display: flex;
                flex-direction: column;
                gap: 2px;
                max-height: 232px;
                overflow-y: auto;
                overscroll-behavior: contain;
            }
            .run {
                display: flex;
                align-items: center;
                gap: 12px;
                width: 100%;
                min-height: 52px;
                padding: 6px 10px;
                border: none;
                border-radius: 12px;
                background: transparent;
                text-align: start;
                cursor: pointer;
            }
            @media (hover: hover) {
                .run:hover {
                    background: var(--secondary-background-color);
                }
            }
            .run.on {
                background: color-mix(in oklab, var(--primary-color) 12%, transparent);
            }
            .run.on .kind {
                color: var(--primary-color);
            }
            .run .grow {
                display: flex;
                flex-direction: column;
                gap: 2px;
            }
            .run-title {
                font-size: 14px;
                font-weight: 510;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            .run .muted {
                font-size: 12px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            .badge {
                flex: none;
                padding: 2px 8px;
                border-radius: 980px;
                font-size: 12px;
                font-weight: 510;
            }
            .badge.ok {
                color: var(--success-color, #43a047);
                background: color-mix(in oklab, var(--success-color, #43a047) 14%, transparent);
            }
            .badge.warn {
                color: var(--warning-color, #ffa600);
                background: color-mix(in oklab, var(--warning-color, #ffa600) 16%, transparent);
            }
            figure {
                margin: 0;
            }
            .map {
                display: grid;
                place-items: center;
                min-height: 160px;
                padding: 8px;
                border-radius: 14px;
                background: var(--secondary-background-color);
            }
            .map img {
                display: block;
                max-width: 100%;
                max-height: 300px;
                object-fit: contain;
            }
            .placeholder {
                display: flex;
                align-items: center;
                gap: 8px;
                color: var(--secondary-text-color);
                font-size: 13px;
            }
            .section-title {
                margin-top: 4px;
                color: var(--secondary-text-color);
                font-size: 12px;
                font-weight: 600;
                letter-spacing: 0.02em;
                text-transform: uppercase;
            }
            .photos {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(84px, 1fr));
                gap: 8px;
            }
            .photo {
                position: relative;
                display: grid;
                place-items: center;
                aspect-ratio: 1;
                padding: 0;
                overflow: hidden;
                border: 2px solid transparent;
                border-radius: 12px;
                background: var(--secondary-background-color);
                cursor: pointer;
            }
            .photo.on {
                border-color: var(--primary-color);
            }
            .photo img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            .photo-label {
                position: absolute;
                inset: auto 0 0;
                padding: 12px 6px 4px;
                background: linear-gradient(transparent, rgba(0, 0, 0, 0.65));
                color: #fff;
                font-size: 11px;
                font-weight: 510;
                text-align: start;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            .zoom {
                display: flex;
                flex-direction: column;
                gap: 6px;
            }
            .zoom-btn {
                padding: 0;
                border: none;
                border-radius: 14px;
                overflow: hidden;
                background: var(--secondary-background-color);
                cursor: zoom-out;
            }
            .zoom img {
                display: block;
                width: 100%;
                max-height: 320px;
                object-fit: contain;
            }
            figcaption {
                color: var(--secondary-text-color);
                font-size: 13px;
            }
            @media (prefers-reduced-motion: reduce) {
                .chevron {
                    transition: none;
                }
            }
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "dreame-history-panel": HistoryPanel;
    }
}
