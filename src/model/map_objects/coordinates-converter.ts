import { applyToPoint, fromTriangles, Matrix } from "transformation-matrix";
import { default as transformer, QuadPoints } from "change-perspective";

import { CalibrationPoint, PointType } from "../../types/types";

enum TransformMode {
    AFFINE,
    PERSPECTIVE,
}

export class CoordinatesConverter {
    public readonly calibrated: boolean;
    public readonly transformMode?: TransformMode;
    public readonly mapToVacuumMatrix?: Matrix;
    public readonly vacuumToMapMatrix?: Matrix;
    private readonly mapToVacuumTransformer: ((x: number, y: number) => [number, number]) | undefined;
    private readonly vacuumToMapTransformer: ((x: number, y: number) => [number, number]) | undefined;

    constructor(calibrationPoints: CalibrationPoint[] | undefined) {
        const mapPoints = calibrationPoints?.map((cp) => cp.map);
        const vacuumPoints = calibrationPoints?.map((cp) => cp.vacuum);
        if (mapPoints && vacuumPoints) {
            if (mapPoints.length === 3) {
                this.transformMode = TransformMode.AFFINE;
                this.mapToVacuumMatrix = fromTriangles(mapPoints, vacuumPoints);
                this.vacuumToMapMatrix = fromTriangles(vacuumPoints, mapPoints);
            } else {
                this.transformMode = TransformMode.PERSPECTIVE;
                const mapMerged = mapPoints.flatMap((p) => [p.x, p.y]);
                const vacuumMerged = vacuumPoints.flatMap((p) => [p.x, p.y]);
                this.mapToVacuumTransformer = transformer(mapMerged as QuadPoints, vacuumMerged as QuadPoints);
                this.vacuumToMapTransformer = transformer(vacuumMerged as QuadPoints, mapMerged as QuadPoints);
            }
            this.calibrated = this.selfCheck(mapPoints, vacuumPoints);
        } else {
            // For platforms with default calibration (no calibration points needed),
            // use identity transformation (map coordinates = vacuum coordinates)
            this.calibrated = true;
        }
    }

    /** Une calibration dégénérée (points colinéaires ou dupliqués) ne lève PAS
     *  d'erreur dans les bibliothèques sous-jacentes : `fromTriangles` renvoie des
     *  composantes `null` (→ NaN à l'application) et `change-perspective` peut
     *  retomber sur une quasi-identité silencieusement fausse. On revérifie donc la
     *  transformation sur les points de calibration eux-mêmes, dans les deux sens :
     *  chaque point doit se projeter sur son homologue, à une tolérance relative à
     *  l'étendue du nuage de points. Sinon → `calibrated = false`, et la carte
     *  affiche l'avertissement « calibration invalide » au lieu de casser en silence. */
    private selfCheck(mapPoints: { x: number; y: number }[], vacuumPoints: { x: number; y: number }[]): boolean {
        const diagonal = (pts: { x: number; y: number }[]): number => {
            const xs = pts.map((p) => p.x);
            const ys = pts.map((p) => p.y);
            return Math.hypot(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
        };
        const closeEnough = (a: PointType, b: { x: number; y: number }, tolerance: number): boolean =>
            Number.isFinite(a[0]) && Number.isFinite(a[1]) && Math.hypot(a[0] - b.x, a[1] - b.y) <= tolerance;
        // 0.5 % de la diagonale : les résolutions exactes tombent à ~1e-10 près, les
        // dégénérescences donnent NaN ou des écarts de l'ordre du nuage entier.
        const vacuumTolerance = Math.max(0.5, diagonal(vacuumPoints) * 0.005);
        const mapTolerance = Math.max(0.5, diagonal(mapPoints) * 0.005);
        try {
            return mapPoints.every((mapPoint, i) => {
                const forward = this.mapToVacuum(mapPoint.x, mapPoint.y);
                const backward = this.vacuumToMap(vacuumPoints[i].x, vacuumPoints[i].y);
                return (
                    closeEnough(forward, vacuumPoints[i], vacuumTolerance) &&
                    closeEnough(backward, mapPoint, mapTolerance)
                );
            });
        } catch {
            return false;
        }
    }

    public mapToVacuum(x: number, y: number): PointType {
        if (this.transformMode === TransformMode.AFFINE && this.mapToVacuumMatrix) {
            return applyToPoint(this.mapToVacuumMatrix, [x, y]);
        }
        if (this.transformMode === TransformMode.PERSPECTIVE && this.mapToVacuumTransformer) {
            return this.mapToVacuumTransformer(x, y);
        }
        // Identity transformation for platforms with default calibration
        if (!this.transformMode) {
            return [x, y];
        }
        throw Error("Missing calibration");
    }

    public vacuumToMap(x: number, y: number): PointType {
        if (this.transformMode === TransformMode.AFFINE && this.vacuumToMapMatrix) {
            return applyToPoint(this.vacuumToMapMatrix, [x, y]);
        }
        if (this.transformMode === TransformMode.PERSPECTIVE && this.vacuumToMapTransformer) {
            return this.vacuumToMapTransformer(x, y);
        }
        // Identity transformation for platforms with default calibration
        if (!this.transformMode) {
            return [x, y];
        }
        throw Error("Missing calibration");
    }
}
