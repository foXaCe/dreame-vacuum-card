export function deleteFromArray<T>(array: T[], entry: T): number {
    const index = array.indexOf(entry, 0);
    if (index > -1) {
        array.splice(index, 1);
    }
    return index;
}

export function conditional<T>(condition: boolean, content: () => T): T | null {
    return condition ? content() : null;
}

export async function delay(ms: number): Promise<void> {
    await new Promise<void>((resolve) => setTimeout(() => resolve(), ms));
}

/** Déroule un angle en degrés : retourne la valeur continue la plus proche de `prev`
 *  équivalente à `next` modulo 360. Évite qu'une transition CSS `rotate()` parte
 *  dans le mauvais sens au franchissement de ±180°. */
export function unwrapAngleDeg(prev: number | undefined, next: number): number {
    if (prev === undefined || !Number.isFinite(prev)) return next;
    const delta = ((((next - prev) % 360) + 540) % 360) - 180;
    return prev + delta;
}
