/**
 * Télécommande du robot : commandes de déplacement et disponibilité, en logique pure.
 *
 * Le service `dreame_vacuum.vacuum_remote_control_move_step` envoie un pas de déplacement :
 * `velocity` (vitesse linéaire, -600..600, positive = en avant) et `rotation` (vitesse
 * angulaire, -360..360, positive = vers la gauche). La croix directionnelle répète ce pas
 * tant qu'une flèche est maintenue, puis envoie un pas nul pour arrêter le robot.
 */

export const REMOTE_SERVICE = "vacuum_remote_control_move_step";

export type RemoteDirection = "forward" | "backward" | "left" | "right";
export type RemoteSpeed = "slow" | "normal" | "fast";

export const REMOTE_SPEEDS: readonly RemoteSpeed[] = ["slow", "normal", "fast"];

export interface RemoteStep {
    readonly rotation: number;
    readonly velocity: number;
}

/** Vitesse linéaire et angulaire par réglage : les rotations restent douces pour garder
 *  le contrôle au doigt, même en rapide. */
const SPEED_PROFILE: Record<RemoteSpeed, RemoteStep> = {
    slow: { velocity: 120, rotation: 25 },
    normal: { velocity: 200, rotation: 40 },
    fast: { velocity: 300, rotation: 60 },
};

export const REMOTE_STOP: RemoteStep = { rotation: 0, velocity: 0 };

/** Pas envoyé pour une direction maintenue à une vitesse donnée. */
export function remoteStep(direction: RemoteDirection, speed: RemoteSpeed): RemoteStep {
    const { velocity, rotation } = SPEED_PROFILE[speed];
    switch (direction) {
        case "forward":
            return { rotation: 0, velocity };
        case "backward":
            return { rotation: 0, velocity: -velocity };
        case "left":
            return { rotation, velocity: 0 };
        case "right":
            return { rotation: -rotation, velocity: 0 };
    }
}

/** Direction associée à une flèche du clavier (pilotage au clavier de la croix). */
export function directionForKey(key: string): RemoteDirection | undefined {
    switch (key) {
        case "ArrowUp":
            return "forward";
        case "ArrowDown":
            return "backward";
        case "ArrowLeft":
            return "left";
        case "ArrowRight":
            return "right";
        default:
            return undefined;
    }
}

/** États détaillés (capteur « état » de l'intégration) où le robot refuse d'être piloté :
 *  station occupée (lavage, séchage, vidange…), cartographie rapide, mise à jour. */
const BLOCKING_ROBOT_STATES = new Set([
    "washing",
    "washing_paused",
    "drying",
    "building",
    "upgrading",
    "station_reset",
    "station_cleaning",
    "clean_add_water",
    "auto_emptying",
    "emptying",
    "draining",
    "auto_water_draining",
    "returning_to_drain",
    "returning_auto_empty",
    "returning_to_wash",
    "water_check",
    "sanitizing",
    "sanitizing_with_dry",
]);

/**
 * Le robot accepte-t-il la télécommande ? Pas s'il est indisponible, si sa station
 * l'occupe, ni pendant une tâche (nettoyage, retour à la base) — sauf si la tâche en cours
 * est justement le pilotage, que l'intégration présente comme un nettoyage.
 */
export function isRemoteAvailable(vacuumState: string | undefined, robotState: string | undefined): boolean {
    if (!vacuumState || vacuumState === "unavailable" || vacuumState === "unknown") return false;
    if (robotState === "remote_control") return true;
    if (robotState && BLOCKING_ROBOT_STATES.has(robotState)) return false;
    return vacuumState !== "cleaning" && vacuumState !== "returning";
}
