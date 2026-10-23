import { css } from "lit";

/**
 * Mode barre latérale (`panel_position: left`) : la carte place ses panneaux dans une
 * grille (voir `.layout.side` dans card-styles.ts). Les hôtes étant en `display: contents`,
 * le bouton et le contenu de chaque panneau sont directement des cellules de cette grille :
 * le bouton va dans la colonne de gauche, le contenu ouvert sous la carte, pleine largeur.
 */
export const sidePanelStyles = css`
    :host([tab][side]) .toggle {
        grid-column: 1;
        flex: none;
        width: 100%;
        align-self: start;
    }
    :host([tab][side]) .content {
        grid-column: 1 / -1;
        grid-row: 6;
    }
`;
