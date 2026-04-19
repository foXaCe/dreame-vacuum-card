// eslint-disable-next-line @typescript-eslint/no-explicit-any
if (!(String.prototype as any).replaceAll) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (String.prototype as any).replaceAll = function (
        str: string | RegExp,
        newStr: string | ((substring: string, ...args: unknown[]) => string)
    ): string {
        if (Object.prototype.toString.call(str).toLowerCase() === "[object regexp]") {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return this.replace(str as RegExp, newStr as any);
        }
        if (typeof newStr === "function") {
            // Fallback with replacer function : use a literal global regex escaping str.
            const escaped = (str as string).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return this.replace(new RegExp(escaped, "g"), newStr as any);
        }
        // String needle: split/join avoids any pattern interpretation entirely.
        return this.split(str as string).join(newStr);
    };
}
