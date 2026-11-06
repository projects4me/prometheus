/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/**
 * An ezSearch schema: the fields a module can be searched by and how typed words resolve to them.
 * It is pure: the fields and the values of enum and user fields are passed in, nothing is loaded here.
 *
 * A field is `{id, aliases, labelKey, label, type, valueSource}`:
 * - `id`: the Gaia field, e.g. `Issue.startDate`;
 * - `aliases`: other words it is typed as;
 * - `labelKey`: the translation key of its label, and `label`, the translated label when the caller
 *   has it (only `label` takes part in resolution);
 * - `type`: one of `text`, `number`, `enum`, `user`, `date`;
 * - `valueSource`: the key in `values` that lists its values, for enum and user fields.
 *
 * `values` maps a value source to its values, each `{value, label}`.
 *
 * @class Schema
 * @namespace Prometheus.Utils.Query
 * @module utils/query
 */

/**
 * @method lower
 * @private
 */
function lower(text) {
    return String(text ?? '')
        .trim()
        .toLowerCase();
}

/**
 * The part of a field id after its module prefix.
 *
 * @method shortName
 * @private
 */
function shortName(id) {
    let dot = id.indexOf('.');

    return dot === -1 ? id : id.slice(dot + 1);
}

/**
 * The words other than the id a field is known by: its aliases and its label.
 *
 * @method names
 * @private
 */
function names(field) {
    return [...(field.aliases || []), field.label].filter((name) => typeof name === 'string' && name.trim() !== '').map(lower);
}

/**
 * The single item `matches` picks, or null when none or several do.
 *
 * @method only
 * @private
 */
function only(items, matches) {
    let found = items.filter(matches);

    return found.length === 1 ? found[0] : null;
}

/**
 * Create a schema.
 *
 * @method createSchema
 * @param {Object} options
 * @param {String} options.module The module name, e.g. `Issue`
 * @param {Array} options.fields The fields
 * @param {String} [options.textField] The field free text searches, e.g. `Issue.subject`
 * @param {Object} [options.values] The values of each value source
 * @return {Object} The schema
 */
export function createSchema({ module, fields = [], textField = null, values = {} }) {
    let frozenFields = Object.freeze(fields.map((field) => Object.freeze({ type: 'text', ...field })));

    /**
     * Resolve a typed word to a field. In order, without case: the id, the id without its module
     * prefix, an alias or the label, and a unique prefix of an alias or label. Any other word is a text
     * field: `<module>.<word>` when it has no module prefix, the word itself otherwise.
     *
     * @method resolveField
     * @param {String} word
     * @return {Object|null} The field, or null for an empty word
     */
    function resolveField(word) {
        let typed = String(word ?? '').trim();
        let key = typed.toLowerCase();

        if (key === '') {
            return null;
        }

        let field =
            frozenFields.find((f) => lower(f.id) === key) ||
            only(frozenFields, (f) => lower(shortName(f.id)) === key) ||
            only(frozenFields, (f) => names(f).includes(key)) ||
            only(frozenFields, (f) => names(f).some((name) => name.startsWith(key)));

        if (field) {
            return field;
        }

        return Object.freeze({ id: typed.includes('.') ? typed : `${module}.${typed}`, type: 'text' });
    }

    /**
     * The values a field can take, for enum and user fields.
     *
     * @method valuesFor
     * @param {Object} field
     * @return {Array}
     */
    function valuesFor(field) {
        return (field && field.valueSource && values[field.valueSource]) || [];
    }

    /**
     * Resolve typed text to a stored value. Enum and user fields look for an exact value or label
     * first, then a unique prefix; an ambiguous prefix gives the candidates and no value. Other fields
     * keep the text.
     *
     * @method resolveValue
     * @param {Object} field
     * @param {String} text
     * @return {Object} `{value, candidates}`; `value` is null when nothing or several match
     */
    function resolveValue(field, text) {
        let typed = String(text ?? '').trim();

        if (!field || !['enum', 'user'].includes(field.type)) {
            return { value: typed, candidates: [] };
        }

        let key = typed.toLowerCase();
        let options = valuesFor(field);
        let exact = options.find((option) => lower(option.value) === key || lower(option.label) === key);

        if (exact) {
            return { value: exact.value, candidates: [] };
        }

        let candidates = key === '' ? [] : options.filter((option) => lower(option.value).startsWith(key) || lower(option.label).startsWith(key));

        if (candidates.length === 1) {
            return { value: candidates[0].value, candidates: [] };
        }

        return { value: null, candidates };
    }

    return Object.freeze({
        module,
        fields: frozenFields,
        textField,
        resolveField,
        resolveValue,
        valuesFor,
    });
}
