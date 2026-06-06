import { MousePosition } from "./mouse-position";
import { PredefinedMultiRectangle } from "./predefined-multi-rectangle";
import { Room } from "./room";
import { PredefinedPoint } from "./predefined-point";
import { ManualRectangle } from "./manual-rectangle";
import { CoordinatesConverter } from "./coordinates-converter";
import { TranslatableString } from "../../types/types";
import { MapMode } from "../map_mode/map-mode";

/** Dépendances injectées dans les objets de carte (callbacks vers l'état du composant).
 *  Objet nommé plutôt qu'une longue liste de paramètres positionnels : auto-documenté,
 *  indépendant de l'ordre, et insensible aux inversions de callbacks de même signature. */
export interface ContextOptions {
    scale: () => number;
    realScale: () => number;
    mousePositionCalculator: (event: MouseEvent | TouchEvent) => MousePosition;
    update: () => void;
    selectionChanged: () => void;
    coordinatesConverter: () => CoordinatesConverter | undefined;
    selectedManualRectangles: () => ManualRectangle[];
    selectedPredefinedRectangles: () => PredefinedMultiRectangle[];
    selectedRooms: () => Room[];
    selectedPredefinedPoint: () => PredefinedPoint[];
    roundingEnabled: () => boolean;
    coordinatesToMetersDivider: () => number;
    maxSelections: () => number;
    runImmediately: () => Promise<boolean>;
    localize: (value: TranslatableString) => string;
    getState: (entity: string) => string;
    toggleEntity: (entity: string) => void;
    getCurrentMode: () => MapMode | undefined;
    activateRoomMode: () => void;
    activeTab: () => "room" | "all" | "zone";
}

export class Context {
    public readonly scale: () => number;
    public readonly realScale: () => number;
    public readonly mousePositionCalculator: (event: MouseEvent | TouchEvent) => MousePosition;
    public readonly update: () => void;
    public readonly selectionChanged: () => void;
    public readonly coordinatesConverter: () => CoordinatesConverter | undefined;
    public readonly selectedManualRectangles: () => ManualRectangle[];
    public readonly selectedPredefinedRectangles: () => PredefinedMultiRectangle[];
    public readonly selectedRooms: () => Room[];
    public readonly selectedPredefinedPoint: () => PredefinedPoint[];
    public readonly roundingEnabled: () => boolean;
    public readonly coordinatesToMetersDivider: () => number;
    public readonly maxSelections: () => number;
    public readonly runImmediately: () => Promise<boolean>;
    public readonly localize: (value: TranslatableString) => string;
    public readonly getState: (entity: string) => string;
    public readonly toggleEntity: (entity: string) => void;
    public readonly getCurrentMode: () => MapMode | undefined;
    public readonly activateRoomMode: () => void;
    public readonly activeTab: () => "room" | "all" | "zone";

    constructor(options: ContextOptions) {
        this.scale = options.scale;
        this.realScale = options.realScale;
        this.mousePositionCalculator = options.mousePositionCalculator;
        this.update = options.update;
        this.selectionChanged = options.selectionChanged;
        this.coordinatesConverter = options.coordinatesConverter;
        this.selectedManualRectangles = options.selectedManualRectangles;
        this.selectedPredefinedRectangles = options.selectedPredefinedRectangles;
        this.selectedRooms = options.selectedRooms;
        this.selectedPredefinedPoint = options.selectedPredefinedPoint;
        this.roundingEnabled = options.roundingEnabled;
        this.coordinatesToMetersDivider = options.coordinatesToMetersDivider;
        this.maxSelections = options.maxSelections;
        this.runImmediately = options.runImmediately;
        this.localize = options.localize;
        this.getState = options.getState;
        this.toggleEntity = options.toggleEntity;
        this.getCurrentMode = options.getCurrentMode;
        this.activateRoomMode = options.activateRoomMode;
        this.activeTab = options.activeTab;
    }

    public roundMap([x, y]: PointArrayNotation): PointArrayNotation {
        if (this.roundingEnabled()) {
            return [Math.round(x), Math.round(y)];
        }
        return [x, y];
    }
}
