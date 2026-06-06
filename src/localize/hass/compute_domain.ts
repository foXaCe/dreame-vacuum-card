// home-assistant/frontend/src/common/entity/compute_domain.ts

export const computeDomain = (entityId: string): string => {
    const dot = entityId.indexOf(".");
    // Sans point (id malformé), indexOf renvoie -1 : on retourne "" plutôt que de
    // tronquer le dernier caractère (substring(0, -1)).
    return dot === -1 ? "" : entityId.substring(0, dot);
};
