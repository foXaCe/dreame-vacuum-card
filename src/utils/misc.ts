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
