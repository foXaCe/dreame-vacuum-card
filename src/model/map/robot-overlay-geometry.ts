import { HassEntity } from "home-assistant-js-websocket";
import { CoordinatesConverter } from "../map_objects/coordinates-converter";
import { unwrapAngleDeg } from "../../utils";

/**
 * État minimal à faire persister d'un rendu à l'autre pour dérouler le cap du robot
 * (évite qu'une transition CSS `rotate()` fasse un tour complet dans le mauvais sens)
 * et lisser la cadence de glisse du marqueur. Remplace les champs épars
 * `_lastRobotPosKey` / `_lastRobotPosTs` / `_robotGlideMs` / `_lastRobotHeadingDeg`
 * du composant par un unique champ `_robotSample`.
 */
export interface RobotSample {
    posKey?: string;
    posTs: number;
    glideMs: number;
    headingDeg?: number;
}

/** Valeurs initiales identiques aux anciens champs de classe (`_robotGlideMs = 400`,
 *  `_lastRobotPosTs = 0`, le reste `undefined`). */
export const INITIAL_ROBOT_SAMPLE: RobotSample = {
    posKey: undefined,
    posTs: 0,
    glideMs: 400,
    headingDeg: undefined,
};

export interface RobotOverlayGeometryInput {
    /** État de l'entité caméra du preset (`this.hass.states[preset.map_source.camera]`),
     *  ou `undefined` si aucune caméra n'est configurée / l'entité est absente. */
    camState: HassEntity | undefined;
    converter: CoordinatesConverter | undefined;
    /** Dimensions naturelles de l'image de carte (déjà mises en cache par le composant). */
    natW: number | undefined;
    natH: number | undefined;
    /** Résolution (préset/config/auto) déjà effectuée par l'appelant. */
    robotOverlayEnabled: boolean;
    prevSample: RobotSample;
    /** Horodatage figé par l'appelant (AUCUN `Date.now()` dans ce module). */
    nowMs: number;
}

export interface RobotOverlayGeometryResult {
    xPct: number;
    yPct: number;
    headingDeg: number;
    visible: boolean;
    iconUrl: string | undefined;
    glideMs: number;
    nextSample: RobotSample;
}

/**
 * Calcule la position/cap/visibilité du marqueur robot en overlay (option anti-flash)
 * à partir de `vacuum_position` (attribut caméra), de la calibration courante et des
 * dimensions naturelles de l'image. Fonction pure : aucun accès à `this`/DOM/horloge —
 * tout est fourni par l'appelant (voir `render()` dans le composant).
 */
export function computeRobotOverlayGeometry({
    camState,
    converter,
    natW,
    natH,
    robotOverlayEnabled,
    prevSample,
    nowMs,
}: RobotOverlayGeometryInput): RobotOverlayGeometryResult {
    let xPct = -1;
    let yPct = -1;
    let headingDeg = 0;
    let visible = false;
    let iconUrl: string | undefined;
    let nextSample = prevSample;

    if (robotOverlayEnabled && converter?.calibrated && camState) {
        // Icône robot réelle exposée par l'intégration (contrat §5.I) — fallback SVG sinon.
        iconUrl = camState.attributes?.robot_icon as string | undefined;
        const robotPos = camState.attributes?.vacuum_position;
        if (robotPos && robotPos.x != null && robotPos.y != null) {
            const p0 = converter.vacuumToMap(robotPos.x, robotPos.y);
            if (natW && natH) {
                xPct = (p0[0] / natW) * 100;
                yPct = (p0[1] / natH) * 100;
                // Cap exprimé en angle ÉCRAN : on transforme un petit vecteur de direction
                // par la même calibration que la position, puis atan2 -> correct quelle que
                // soit la rotation/perspective de la carte, sans connaître la convention interne.
                const aRad = ((robotPos.a ?? 0) * Math.PI) / 180;
                const p1 = converter.vacuumToMap(robotPos.x + Math.cos(aRad), robotPos.y + Math.sin(aRad));
                headingDeg = (Math.atan2(p1[1] - p0[1], p1[0] - p0[0]) * 180) / Math.PI;
                // Déroule le cap : évite qu'une transition CSS `rotate()` fasse un tour
                // complet dans le mauvais sens quand le cap réel franchit ±180°.
                headingDeg = unwrapAngleDeg(prevSample.headingDeg, headingDeg);
                visible = true;

                // Cadence mesurée des échantillons de position (~3 s, push cloud Dreame,
                // cf. contrat §5.D) : le marqueur glisse sur ~90 % de l'intervalle mesuré
                // pour un mouvement continu (au lieu de 0,4 s de glisse puis une pause).
                const posKey = `${robotPos.x},${robotPos.y}`;
                let glideMs = prevSample.glideMs;
                let posTs = prevSample.posTs;
                if (posKey !== prevSample.posKey) {
                    if (prevSample.posKey !== undefined) {
                        const interval = nowMs - prevSample.posTs;
                        glideMs = Math.min(4000, Math.max(400, Math.round(interval * 0.9)));
                    }
                    posTs = nowMs;
                }
                nextSample = { posKey, posTs, glideMs, headingDeg };
            }
        }
    }

    return { xPct, yPct, headingDeg, visible, iconUrl, glideMs: nextSample.glideMs, nextSample };
}
