/**
 * Déclaration idempotente des custom elements.
 *
 * `customElements.define` lève une `DOMException` si le nom est déjà pris. Levée au
 * top-level d'un module, elle AVORTE l'évaluation du bundle entier : tout ce qui est
 * déclaré plus loin dans le fichier — dont `dreame-vacuum-card` — n'existe jamais, et
 * Lovelace affiche « Custom element doesn't exist » jusqu'au prochain rechargement.
 * Deux causes réelles :
 *   - une autre carte custom déclare le même nom (les ressources se chargent en
 *     parallèle : l'ordre, donc la panne, change d'un chargement à l'autre) ;
 *   - la carte chargée deux fois sous deux URL (`/hacsfiles/…` et `/local/community/…`).
 * On garde la première déclaration et on ignore les suivantes.
 */
export function defineElementOnce(tag: string, ctor: CustomElementConstructor): void {
    if (!customElements.get(tag)) {
        customElements.define(tag, ctor);
    }
}

/** Équivalent idempotent du décorateur `@customElement` de Lit. */
export const safeCustomElement =
    (tag: string) =>
    (ctor: CustomElementConstructor): void => {
        defineElementOnce(tag, ctor);
    };
