/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { isComplete, isCondition, isGroup, normalize } from 'prometheus/utils/query/ast';
import { operator as findOperator } from 'prometheus/utils/query/operators';

/**
 * Write an ezSearch tree in Gaia's query format, e.g.
 * `((Issue.priority : High) AND (Issue.status !: done))`.
 *
 * Errors are `{code, params, nodeId}`; their messages are `components.ezSearch.errors.<code>`.
 *
 * @class Serializer
 * @namespace Prometheus.Utils.Query
 * @module utils/query
 */

/**
 * Error codes the serializer reports.
 *
 * @property ERRORS
 * @type Object
 * @final
 */
export const ERRORS = Object.freeze({
    reservedCharacter: 'reservedCharacter',
    reservedWord: 'reservedWord',
    reservedApostrophe: 'reservedApostrophe',
    invalidField: 'invalidField',
    invalidTree: 'invalidTree',
});

const RESERVED_CHARACTER = /[()]/;
// Gaia trims ' from both ends of a value and splits an IN list on ',' until agaia-4303, so an apostrophe
// is only safe inside a single value.
const EDGE_APOSTROPHE = /^'|'$/;
// The lexer starts quoted text at an apostrophe after a word break, and closes a quote at the next apostrophe, so
// `a,'b` and a quoted value such as `'Rana's board'` do not read back.
const UNREADABLE_APOSTROPHE = /[,:=<>~]'/;
// Gaia's Clause matches these anywhere in a condition, not only as whole words.
const RESERVED_WORD = /NULL|EMPTY/;
// Gaia splits a range on ' AND ', so a bound cannot contain it.
const RANGE_SEPARATOR = /\sAND\s/;
// A lower bound ending in ' AND' would join the separator, e.g. 'x AND' + 'y' reads as 'x' + 'AND y'.
const RANGE_SEPARATOR_END = /\sAND$/;
// Module.field paths; Gaia splits a condition on spaces, so anything else would break the query.
const FIELD = /^[A-Za-z_]\w*(\.\w+)*$/;

/**
 * The values of a condition as a list of strings.
 *
 * @method valuesOf
 * @private
 */
function valuesOf(value) {
    let list = Array.isArray(value) ? value : value === null || value === undefined ? [] : [value];

    return list.map((item) => String(item).trim());
}

/**
 * The first error in a condition's field or values, or null. Gaia's Clause cannot read brackets, an apostrophe at the
 * edge of a value, in a list, in a value with spaces or after a comma, or the uppercase words NULL and EMPTY inside a value, or AND inside a range bound, yet.
 *
 * @method checkValues
 * @private
 */
function checkValues(node) {
    if (typeof node.field !== 'string' || !FIELD.test(node.field)) {
        return { code: ERRORS.invalidField, params: { field: String(node.field) }, nodeId: node.id };
    }

    let arity = findOperator(node.operator)?.arity;
    let isRange = arity === 2;
    let isList = arity === 'n' && valuesOf(node.value).length > 1;

    for (let [index, value] of valuesOf(node.value).entries()) {
        let character = value.match(RESERVED_CHARACTER);

        if (character) {
            return { code: ERRORS.reservedCharacter, params: { character: character[0], value }, nodeId: node.id };
        }

        if (EDGE_APOSTROPHE.test(value) || (isList && value.includes("'")) || (value.includes("'") && (/\s/.test(value) || UNREADABLE_APOSTROPHE.test(value)))) {
            return { code: ERRORS.reservedApostrophe, params: { value }, nodeId: node.id };
        }

        let word = value.match(RESERVED_WORD);

        if (word) {
            return { code: ERRORS.reservedWord, params: { word: word[0], value }, nodeId: node.id };
        }

        if (isRange && (RANGE_SEPARATOR.test(value) || (index === 0 && RANGE_SEPARATOR_END.test(value)))) {
            return { code: ERRORS.reservedWord, params: { word: 'AND', value }, nodeId: node.id };
        }
    }

    return null;
}

/**
 * Quote a value that has spaces.
 *
 * @method quote
 * @private
 */
function quote(value) {
    return /\s/.test(value) ? `'${value}'` : value;
}

/**
 * Write one complete, accepted condition.
 *
 * @method writeCondition
 * @private
 */
function writeCondition(node) {
    let entry = findOperator(node.operator);
    let values = valuesOf(node.value);

    switch (entry.arity) {
        case 0:
            return `(${node.field} ${entry.symbol})`;
        case 2:
            // Gaia splits a range on ' AND ' and only trims the quotes around the whole value, so the
            // bounds are written as they are.
            return `(${node.field} ${entry.symbol} ${values[0]} AND ${values[1]})`;
        case 'n':
            if (values.length === 1) {
                return `(${node.field} ${node.operator === 'IN' ? ':' : '!:'} ${quote(values[0])})`;
            }

            return `(${node.field} ${entry.symbol} ${values.map((value) => `'${value}'`).join(',')})`;
        default:
            return `(${node.field} ${entry.symbol} ${quote(values[0])})`;
    }
}

/**
 * Write a normalized node.
 *
 * @method write
 * @private
 */
function write(node) {
    if (isCondition(node)) {
        return writeCondition(node);
    }

    return `(${node.children.map(write).join(` ${node.conjunction} `)})`;
}

/**
 * Drop the conditions that are incomplete or refused, collecting the refusals.
 *
 * @method prune
 * @private
 */
function prune(node, errors) {
    if (isGroup(node)) {
        let children = node.children.map((child) => prune(child, errors)).filter(Boolean);

        return { ...node, children };
    }

    if (!isComplete(node)) {
        return null;
    }

    let error = checkValues(node);

    if (error) {
        errors.push(error);
        return null;
    }

    return node;
}

/**
 * Serialize a tree. Incomplete conditions are left out; refused conditions are left out and reported.
 * It never throws.
 *
 * @method serialize
 * @param {Object} tree
 * @return {Object} `{query, errors}`; `query` is '' when nothing is left
 */
export function serialize(tree) {
    let errors = [];

    try {
        if (!isGroup(tree) && !isCondition(tree)) {
            return { query: '', errors };
        }

        let pruned = prune(tree, errors);
        let normalized = pruned ? normalize(pruned) : null;

        if (!normalized || normalized.children.length === 0) {
            return { query: '', errors };
        }

        return { query: write(normalized), errors };
    } catch (error) {
        errors.push({ code: ERRORS.invalidTree, params: { message: String(error && error.message) } });

        return { query: '', errors };
    }
}
