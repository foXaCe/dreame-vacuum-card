/**
 * Transformation perspective (homographie) à 4 points de correspondance.
 *
 * Vendorisé depuis le paquet npm `change-perspective` v1.0.1 (MIT), suite à la
 * décision actée dans `plans/README.md` (« Findings considered and rejected ») :
 * dépendance dormante depuis ~4 ans, un seul mainteneur, fonction utile ne
 * représentant qu'une quarantaine de lignes — on la rapatrie plutôt que de
 * garder une dépendance externe pour si peu.
 *
 * Source     : https://github.com/Volst/change-perspective (index.ts)
 * Licence    : MIT — Copyright (c) Kees Kluskens <kees@volst.nl>
 * Raison     : vendorisation d'une petite dépendance dormante (voir plans/README.md)
 *
 *   Permission is hereby granted, free of charge, to any person obtaining a copy
 *   of this software and associated documentation files (the "Software"), to deal
 *   in the Software without restriction, including without limitation the rights
 *   to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *   copies of the Software, and to permit persons to whom the Software is
 *   furnished to do so, subject to the following conditions:
 *
 *   The above copyright notice and this permission notice shall be included in
 *   all copies or substantial portions of the Software.
 *
 *   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *   IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *   FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *   AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *   LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *   OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *   THE SOFTWARE.
 *
 * Le paquet original empruntait lui-même à la bibliothèque `numeric.js`
 * (inversion de matrice générique, boucles déroulées/inversées pour la
 * performance). Ce module réécrit uniquement le sous-ensemble nécessaire à
 * notre cas d'usage fixe (4 points source -> 4 points destination, soit un
 * système linéaire 8x8), avec des boucles classiques ascendantes plutôt que
 * les micro-optimisations de l'original. L'algorithme (moindres carrés via
 * `inv(Aᵀ·A)·Aᵀ·b`, mathématiquement équivalent à résoudre `A·x = b` puisque
 * `A` est carrée) et le comportement de repli (transformation identité si la
 * matrice n'est pas inversible) sont préservés à l'identique ; seul l'ordre de
 * sommation de quelques produits scalaires diffère, avec un écart numérique de
 * l'ordre de 1e-13 sans aucune incidence pratique sur le rendu de la carte
 * (cf. test/coordinates.test.ts qui compare déjà avec des tolérances plus
 * larges, et perspective-transform.test.ts qui rejoue les valeurs de
 * référence produites par l'ancien paquet npm).
 */

/** 4 points, encodés à plat : [x0, y0, x1, y1, x2, y2, x3, y3]. */
export type QuadPoints = [number, number, number, number, number, number, number, number];

/** Un point 2D. */
export type SinglePoint = [number, number];

/** Matrice rectangulaire dense, représentée comme un tableau de lignes. */
type Matrix = number[][];

/** Construit la matrice identité n×n. */
function identityMatrix(n: number): Matrix {
    return Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));
}

/** Transposée d'une matrice. */
function transpose(matrix: Matrix): Matrix {
    const rows = matrix.length;
    const cols = matrix[0].length;
    const result: Matrix = Array.from({ length: cols }, () => Array(rows).fill(0));
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            result[j][i] = matrix[i][j];
        }
    }
    return result;
}

/** Produit matriciel classique A·B. */
function multiply(a: Matrix, b: Matrix): Matrix {
    const rows = a.length;
    const inner = b.length;
    const cols = b[0].length;
    const result: Matrix = Array.from({ length: rows }, () => Array(cols).fill(0));
    for (let i = 0; i < rows; i++) {
        for (let k = 0; k < inner; k++) {
            const aik = a[i][k];
            for (let j = 0; j < cols; j++) {
                result[i][j] += aik * b[k][j];
            }
        }
    }
    return result;
}

/** Produit matrice · vecteur. */
function multiplyVector(a: Matrix, v: number[]): number[] {
    return a.map((row) => row.reduce((sum, value, k) => sum + value * v[k], 0));
}

/**
 * Inverse une matrice carrée par élimination de Gauss-Jordan avec pivot partiel.
 *
 * Si aucun pivot exploitable n'est trouvé dans une colonne (matrice singulière,
 * ou entrées non finies suite à une calibration dégénérée), lève une erreur :
 * l'appelant retombe alors sur une transformation identité, exactement comme
 * le faisait (involontairement, via une exception JS sur accès de tableau)
 * l'implémentation d'origine.
 */
function invert(source: Matrix): Matrix {
    const n = source.length;
    const working = source.map((row) => [...row]);
    const inverse = identityMatrix(n);

    for (let col = 0; col < n; col++) {
        // Pivot partiel : la plus grande valeur absolue restante dans la colonne.
        // Une comparaison `>` avec NaN est toujours fausse, donc les colonnes
        // entièrement non finies ne sélectionnent aucun pivot (pivotRow reste -1).
        let pivotRow = -1;
        let pivotValue = -1;
        for (let row = col; row < n; row++) {
            const candidate = Math.abs(working[row][col]);
            if (candidate > pivotValue) {
                pivotValue = candidate;
                pivotRow = row;
            }
        }
        if (pivotRow === -1) {
            throw new Error("Matrice non inversible (calibration dégénérée)");
        }

        [working[col], working[pivotRow]] = [working[pivotRow], working[col]];
        [inverse[col], inverse[pivotRow]] = [inverse[pivotRow], inverse[col]];

        const pivot = working[col][col];
        for (let k = 0; k < n; k++) {
            working[col][k] /= pivot;
            inverse[col][k] /= pivot;
        }
        for (let row = 0; row < n; row++) {
            if (row === col) continue;
            const factor = working[row][col];
            if (factor === 0) continue;
            for (let k = 0; k < n; k++) {
                working[row][k] -= factor * working[col][k];
                inverse[row][k] -= factor * inverse[col][k];
            }
        }
    }
    return inverse;
}

/** Arrondit à 10 décimales pour éponger le bruit numérique résiduel (comme l'original). */
function roundToTenDecimals(value: number): number {
    return Math.round(value * 1e10) / 1e10;
}

/**
 * Coefficients h0..h7 de l'homographie 2D reliant `srcPts` à `dstPts`
 * (h8 est fixé à 1, cf. `applyHomography`).
 *
 * Construit le système linéaire 8x8 `A·h = b` (2 équations par point de
 * correspondance) puis le résout via `inv(Aᵀ·A)·Aᵀ·b` — équivalent à une
 * résolution directe de `A·h = b` puisque `A` est carrée et inversible, mais
 * c'est la formulation utilisée par la bibliothèque d'origine.
 */
function getHomographyCoefficients(srcPts: QuadPoints, dstPts: QuadPoints): number[] {
    const rows: Matrix = [];
    const b: number[] = [];
    for (let i = 0; i < 4; i++) {
        const sx = srcPts[2 * i];
        const sy = srcPts[2 * i + 1];
        const dx = dstPts[2 * i];
        const dy = dstPts[2 * i + 1];
        rows.push([sx, sy, 1, 0, 0, 0, -dx * sx, -dx * sy]);
        rows.push([0, 0, 0, sx, sy, 1, -dy * sx, -dy * sy]);
        b.push(dx, dy);
    }

    let coeffs: number[];
    try {
        const a = rows;
        const aT = transpose(a);
        const aTa = multiply(aT, a);
        const aTaInv = invert(aTa);
        const solver = multiply(aTaInv, aT);
        coeffs = multiplyVector(solver, b);
    } catch {
        // Calibration dégénérée : repli sur la transformation identité, comme
        // le faisait l'ancien paquet (cf. en-tête du fichier).
        return [1, 0, 0, 0, 1, 0, 0, 0];
    }
    return coeffs.map(roundToTenDecimals);
}

/** Applique les coefficients d'homographie à un point (x, y). */
function applyHomography(coeffs: number[], x: number, y: number): SinglePoint {
    const denominator = coeffs[6] * x + coeffs[7] * y + 1;
    return [
        (coeffs[0] * x + coeffs[1] * y + coeffs[2]) / denominator,
        (coeffs[3] * x + coeffs[4] * y + coeffs[5]) / denominator,
    ];
}

/**
 * Crée une fonction de transformation perspective qui projette un point
 * `(x, y)` du quadrilatère `srcPts` vers son homologue dans `dstPts`.
 */
export function fixPerspective(srcPts: QuadPoints, dstPts: QuadPoints): (x: number, y: number) => SinglePoint {
    const coeffs = getHomographyCoefficients(srcPts, dstPts);
    return (x: number, y: number) => applyHomography(coeffs, x, y);
}
