/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/**
 * The ezSearch operator registry: the one place that lists the operators a condition can use.
 *
 * Each entry has:
 * - `key`: what a condition stores as its operator. It is the Gaia symbol for Gaia's operators, and
 *   `IN` / `NOT IN` for the list operators;
 * - `symbol`: the Gaia symbol written on the wire (IN is written as CONTAINS, NOT IN as !CONTAINS);
 * - `aliases`: the text accepted when typing, matched without case;
 * - `labelKey`: the translation key of its label;
 * - `arity`: 0 (no value), 1, 2 (a range) or 'n' (a list);
 * - `types`: the field types it applies to.
 *
 * @class Operators
 * @namespace Prometheus.Utils.Query
 * @module utils/query
 */

/**
 * The field types a schema field can have.
 *
 * @property FIELD_TYPES
 * @type Array
 * @final
 */
export const FIELD_TYPES = Object.freeze(['text', 'number', 'enum', 'user', 'date']);

const ALL = FIELD_TYPES;
const ORDERED = ['number', 'date'];
const TEXT = ['text'];
const LISTS = ['text', 'number', 'enum', 'user'];
const EMPTIABLE = ['text', 'enum', 'user'];

/**
 * Build a frozen registry entry.
 *
 * @method entry
 * @private
 */
function entry(key, symbol, name, arity, types, aliases = []) {
    return Object.freeze({
        key,
        symbol,
        aliases: Object.freeze(aliases),
        labelKey: `components.ezSearch.operators.${name}`,
        arity,
        types: Object.freeze([...types]),
    });
}

/**
 * Every operator, in the order a picker lists them.
 *
 * @property OPERATORS
 * @type Array
 * @final
 */
export const OPERATORS = Object.freeze([
    entry(':', ':', 'equal', 1, ALL, ['=']),
    entry('!:', '!:', 'notEqual', 1, ALL, ['!=']),
    entry('IN', 'CONTAINS', 'in', 'n', LISTS, ['IN']),
    entry('NOT IN', '!CONTAINS', 'notIn', 'n', LISTS),
    entry('<', '<', 'less', 1, ORDERED),
    entry('<:', '<:', 'lessOrEqual', 1, ORDERED, ['<=']),
    entry('>', '>', 'greater', 1, ORDERED),
    entry('>:', '>:', 'greaterOrEqual', 1, ORDERED, ['>=']),
    entry('BETWEEN', 'BETWEEN', 'between', 2, ORDERED),
    entry('!BETWEEN', '!BETWEEN', 'notBetween', 2, ORDERED),
    entry('CONTAINS', 'CONTAINS', 'contains', 1, TEXT, ['~']),
    entry('!CONTAINS', '!CONTAINS', 'notContains', 1, TEXT),
    entry('STARTS', 'STARTS', 'startsWith', 1, TEXT),
    entry('!STARTS', '!STARTS', 'notStartsWith', 1, TEXT),
    entry('ENDS', 'ENDS', 'endsWith', 1, TEXT),
    entry('!ENDS', '!ENDS', 'notEndsWith', 1, TEXT),
    entry('NULL', 'NULL', 'isNull', 0, ALL),
    entry('!NULL', '!NULL', 'isNotNull', 0, ALL),
    entry('EMPTY', 'EMPTY', 'isEmpty', 0, EMPTIABLE),
    entry('!EMPTY', '!EMPTY', 'isNotEmpty', 0, EMPTIABLE),
]);

const DEFAULTS = Object.freeze({ text: 'CONTAINS', number: ':', enum: ':', user: ':', date: ':' });

/**
 * The operator with this key.
 *
 * @method operator
 * @param {String} key
 * @return {Object|undefined}
 */
export function operator(key) {
    return OPERATORS.find((op) => op.key === key);
}

/**
 * The operator a Gaia symbol stands for. CONTAINS and !CONTAINS give the text operators, not IN and
 * NOT IN, because a list is told apart by its value, not its symbol.
 *
 * @method bySymbol
 * @param {String} symbol
 * @return {Object|undefined}
 */
export function bySymbol(symbol) {
    let upper = String(symbol).toUpperCase();

    return OPERATORS.find((op) => op.symbol === upper && op.arity !== 'n');
}

/**
 * The operator typed as `text`: an alias or a key, without case.
 *
 * @method byAlias
 * @param {String} text
 * @return {Object|undefined}
 */
export function byAlias(text) {
    let upper = String(text).trim().toUpperCase();

    if (upper === '') {
        return undefined;
    }

    return OPERATORS.find((op) => op.aliases.includes(upper)) || OPERATORS.find((op) => op.key === upper);
}

/**
 * The operators that apply to a field type.
 *
 * @method forType
 * @param {String} type
 * @return {Array}
 */
export function forType(type) {
    return OPERATORS.filter((op) => op.types.includes(type));
}

/**
 * Whether an operator applies to a field type.
 *
 * @method isValidFor
 * @param {String} key The operator key
 * @param {String} type The field type
 * @return {Boolean}
 */
export function isValidFor(key, type) {
    let op = operator(key);

    return Boolean(op) && op.types.includes(type);
}

/**
 * The operator a new condition on a field of this type starts with.
 *
 * @method defaultFor
 * @param {String} type
 * @return {Object}
 */
export function defaultFor(type) {
    return operator(DEFAULTS[type] || ':');
}
