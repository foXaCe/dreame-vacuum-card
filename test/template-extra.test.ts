import { describe, it, expect, vi, afterEach } from "vitest";
import {
    replaceInStr,
    replaceInTarget,
    getReplacedValue,
    getFilledTemplate,
    evaluateJinjaTemplate,
} from "../src/template-utils";
import { Modifier } from "../src/model/map_mode/modifier";
import type { ReplacedKey, VariablesStorage } from "../src/types/types";
import type { HomeAssistantFixed } from "../src/types/fixes";

// Replacer générique : renvoie la variable depuis le storage, sinon null.
const krFrom =
    (vars: VariablesStorage) =>
    (key: string): ReplacedKey | null =>
        key in vars ? vars[key] : null;

describe("replaceInStr — Modifier.JSONIFY", () => {
    it("produit un JSON valide (objet) et le parse réellement", () => {
        const value = `[[obj]]${Modifier.JSONIFY}`;
        const vars: VariablesStorage = { "[[obj]]": { a: 1, b: "x" } };
        const out = replaceInStr(value, vars, krFrom(vars));
        // JSON.parse a bien été appliqué : on récupère un objet, pas une chaîne.
        expect(out).toEqual({ a: 1, b: "x" });
        expect(typeof out).toBe("object");
    });

    it("produit un JSON valide (tableau) et le parse", () => {
        const value = `[[arr]]${Modifier.JSONIFY}`;
        const vars: VariablesStorage = { "[[arr]]": [1, 2, 3] };
        const out = replaceInStr(value, vars, krFrom(vars));
        expect(out).toEqual([1, 2, 3]);
        expect(Array.isArray(out)).toBe(true);
    });

    it("parse un littéral JSON valide écrit directement dans la chaîne (sans variable)", () => {
        const value = `{"k":42}${Modifier.JSONIFY}`;
        const out = replaceInStr(value, {}, krFrom({}));
        expect(out).toEqual({ k: 42 });
    });

    it("retourne la chaîne nettoyée (sans le marqueur) quand le JSON est INVALIDE, sans throw", () => {
        const value = `{ceci n'est pas du json}${Modifier.JSONIFY}`;
        const vars: VariablesStorage = {};
        // Correctif récent : pas d'exception, on renvoie la chaîne nettoyée.
        let out: ReplacedKey | undefined;
        expect(() => {
            out = replaceInStr(value, vars, krFrom(vars));
        }).not.toThrow();
        expect(out).toBe("{ceci n'est pas du json}");
        // Le marqueur a bien été retiré.
        expect(out as string).not.toContain(Modifier.JSONIFY);
    });

    it("renvoie la chaîne nettoyée quand une variable mal formée casse le JSON", () => {
        // La variable injecte une valeur qui produit un JSON syntaxiquement invalide.
        const value = `{"k": [[bad]]}${Modifier.JSONIFY}`;
        const vars: VariablesStorage = { "[[bad]]": "oops" }; // -> {"k": oops} invalide
        const out = replaceInStr(value, vars, krFrom(vars));
        expect(out).toBe('{"k": oops}');
    });

    it("ne jsonifie pas quand le marqueur n'est pas en fin de chaîne", () => {
        const value = `${Modifier.JSONIFY} en plein milieu`;
        const vars: VariablesStorage = {};
        const out = replaceInStr(value, vars, krFrom(vars));
        // endsWith est faux : la chaîne est renvoyée telle quelle (avec le marqueur).
        expect(out).toBe(`${Modifier.JSONIFY} en plein milieu`);
    });

    it("sans marqueur : remplace les variables et renvoie une chaîne", () => {
        const value = "valeur=[[v]]";
        const vars: VariablesStorage = { "[[v]]": "ok" };
        const out = replaceInStr(value, vars, krFrom(vars));
        expect(out).toBe("valeur=ok");
    });

    it("sérialise un objet en JSON quand il est inliné dans une chaîne plus longue", () => {
        const value = "prefix [[o]] suffix";
        const vars: VariablesStorage = { "[[o]]": { n: 1 } };
        const out = replaceInStr(value, vars, krFrom(vars));
        // L'objet est JSON.stringify-é puis interpolé via template string.
        expect(out).toBe('prefix {"n":1} suffix');
    });

    it("interpole null/undefined renvoyés par le replacer via String()", () => {
        // kr renvoie null pour une clé connue : `${null}` -> "null".
        const value = "x=[[n]]";
        const out = replaceInStr(value, { "[[n]]": "ignored" }, () => null);
        expect(out).toBe("x=null");
    });
});

describe("getReplacedValue — cas imbriqués / limites", () => {
    it("full-string match conserve le type d'origine (objet)", () => {
        const obj = { deep: { v: 1 } };
        const out = getReplacedValue("[[o]]", { o: obj });
        expect(out).toBe(obj); // même référence, non sérialisée
    });

    it("full-string match conserve un nombre", () => {
        expect(getReplacedValue("[[n]]", { n: 7 })).toBe(7);
    });

    it("remplace plusieurs variables dans une même chaîne", () => {
        expect(getReplacedValue("[[a]]-[[b]]", { a: "x", b: "y" })).toBe("x-y");
    });

    it("gère un storage vide / null sans planter", () => {
        expect(getReplacedValue("rien", {} as VariablesStorage)).toBe("rien");
        expect(getReplacedValue("rien", null as unknown as VariablesStorage)).toBe("rien");
    });

    it("applique JSONIFY via getReplacedValue (chaîne inline + marqueur)", () => {
        const out = getReplacedValue(`[[o]]${Modifier.JSONIFY}`, { o: { k: 1 } });
        expect(out).toEqual({ k: 1 });
    });

    it("renvoie la chaîne nettoyée si JSONIFY invalide via getReplacedValue", () => {
        const out = getReplacedValue(`pas-du-json${Modifier.JSONIFY}`, {});
        expect(out).toBe("pas-du-json");
    });
});

describe("replaceInTarget — imbrication profonde et types non-string", () => {
    it("descend récursivement et ne touche pas les nombres/booléens/null", () => {
        const target: Record<string, unknown> = {
            a: "[[a]]",
            level1: { b: "[[b]]", num: 1, flag: true, nothing: null, level2: { c: "[[c]]" } },
        };
        replaceInTarget(target, (s) => s.replace(/\[\[(\w+)\]\]/g, (_, k) => `<${k}>`));
        expect(target).toEqual({
            a: "<a>",
            level1: { b: "<b>", num: 1, flag: true, nothing: null, level2: { c: "<c>" } },
        });
    });

    it("traverse les tableaux (typeof array === object) et remplace leurs chaînes", () => {
        const target: Record<string, unknown> = { list: ["[[x]]", "static", "[[y]]"] };
        replaceInTarget(target, (s) => s.replace(/\[\[(\w+)\]\]/g, (_, k) => k.toUpperCase()));
        expect(target).toEqual({ list: ["X", "static", "Y"] });
    });

    it("ne plante pas sur un objet sans aucune chaîne", () => {
        const target: Record<string, unknown> = { only: { numbers: 1, more: [2, 3] } };
        expect(() => replaceInTarget(target, (s) => s)).not.toThrow();
        expect(target).toEqual({ only: { numbers: 1, more: [2, 3] } });
    });
});

describe("getFilledTemplate — cas imbriqués", () => {
    it("remplit un template profondément imbriqué (objets + tableaux)", () => {
        const tmpl = {
            service: "[[svc]]",
            data: { entity_id: "[[ent]]", rooms: ["[[r1]]", "[[r2]]"], nested: { flag: "[[f]]" } },
        };
        const out = getFilledTemplate(
            tmpl,
            { svc: "vacuum.start", ent: "vacuum.foo" },
            { r1: 1, r2: 2, f: "[[f]]" }
        );
        // r1/r2 sont des nombres en full-string match -> type préservé.
        expect(out).toEqual({
            service: "vacuum.start",
            data: { entity_id: "vacuum.foo", rooms: [1, 2], nested: { flag: "[[f]]" } },
        });
        // Pas de mutation de l'original.
        expect(tmpl.data.rooms).toEqual(["[[r1]]", "[[r2]]"]);
    });

    it("applique JSONIFY au sein d'un template imbriqué", () => {
        const tmpl = { data: { payload: `[[obj]]${Modifier.JSONIFY}` } };
        const out = getFilledTemplate(tmpl, { obj: { a: 1, b: [2, 3] } });
        expect(out).toEqual({ data: { payload: { a: 1, b: [2, 3] } } });
    });

    it("le premier storage a priorité sur les suivants (clé en conflit, imbriqué)", () => {
        const tmpl = { wrap: { v: "[[k]]" } };
        const out = getFilledTemplate(tmpl, { k: "win" }, { k: "lose" });
        expect(out).toEqual({ wrap: { v: "win" } });
    });

    it("laisse intactes les variables non résolues", () => {
        const out = getFilledTemplate({ a: "[[unknown]]", b: "[[k]]" }, { k: "v" });
        expect(out).toEqual({ a: "[[unknown]]", b: "v" });
    });
});

describe("evaluateJinjaTemplate", () => {
    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it("résout avec msg.result quand le backend répond (chaîne)", async () => {
        const unsub = vi.fn();
        const subscribeMessage = vi.fn(
            (cb: (msg: { result: string | Record<string, unknown> }) => void) => {
                cb({ result: "rendu" });
                return Promise.resolve(unsub);
            }
        );
        const hass = { connection: { subscribeMessage } } as unknown as HomeAssistantFixed;

        const out = await evaluateJinjaTemplate(hass, "{{ states('x') }}");
        expect(out).toBe("rendu");
        // Le bon type de message a été envoyé.
        expect(subscribeMessage).toHaveBeenCalledWith(expect.any(Function), {
            type: "render_template",
            template: "{{ states('x') }}",
        });
        // unsub appelé après résolution (le callback a réglé avant le .then).
        expect(unsub).toHaveBeenCalledTimes(1);
    });

    it("résout avec un objet quand msg.result est un objet", async () => {
        const subscribeMessage = vi.fn(
            (cb: (msg: { result: string | Record<string, unknown> }) => void) => {
                cb({ result: { foo: "bar" } });
                return Promise.resolve(() => {});
            }
        );
        const hass = { connection: { subscribeMessage } } as unknown as HomeAssistantFixed;
        const out = await evaluateJinjaTemplate(hass, "tmpl");
        expect(out).toEqual({ foo: "bar" });
    });

    it("rejette après le délai quand le backend ne répond jamais (timeout)", async () => {
        vi.useFakeTimers();
        const unsub = vi.fn();
        // subscribeMessage n'appelle jamais le callback ; sa promesse se résout
        // (donnant unsubscribe) mais aucun résultat n'arrive => le timer doit déclencher.
        const subscribeMessage = vi.fn(() => Promise.resolve(unsub));
        const hass = { connection: { subscribeMessage } } as unknown as HomeAssistantFixed;

        const promise = evaluateJinjaTemplate(hass, "tmpl", 1000);
        // Attache le rejet avant d'avancer le temps pour éviter un unhandled rejection.
        const assertion = expect(promise).rejects.toThrow(/Délai dépassé \(1000 ms\)/);

        // Laisse la microtask du .then(unsub) s'exécuter, puis déclenche le timer.
        await vi.advanceTimersByTimeAsync(1000);
        await assertion;
        // Après timeout, unsubscribe doit avoir été appelé pour nettoyer l'abonnement.
        expect(unsub).toHaveBeenCalledTimes(1);
    });

    it("rejette si subscribeMessage échoue (promesse rejetée)", async () => {
        const subscribeMessage = vi.fn(() => Promise.reject(new Error("connexion perdue")));
        const hass = { connection: { subscribeMessage } } as unknown as HomeAssistantFixed;
        await expect(evaluateJinjaTemplate(hass, "tmpl", 5000)).rejects.toThrow("connexion perdue");
    });

    it("ne résout qu'une seule fois même si le callback est rappelé", async () => {
        let captured: ((msg: { result: string }) => void) | undefined;
        const subscribeMessage = vi.fn((cb: (msg: { result: string }) => void) => {
            captured = cb;
            return Promise.resolve(() => {});
        });
        const hass = { connection: { subscribeMessage } } as unknown as HomeAssistantFixed;
        const promise = evaluateJinjaTemplate(hass, "tmpl");
        captured?.({ result: "premier" });
        captured?.({ result: "second" });
        await expect(promise).resolves.toBe("premier");
    });
});
