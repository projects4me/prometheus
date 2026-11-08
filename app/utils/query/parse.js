/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { condition, group, normalize } from 'prometheus/utils/query/ast';
import { KINDS, lex } from 'prometheus/utils/query/lexer';
import { isValidFor, operator as findOperator } from 'prometheus/utils/query/operators';

/**
 * Read query text into an ezSearch tree (see `utils/query/ast`). The text is what someone typed in the
 * search bar, or a Gaia query from a saved search or a `?query=` URL.
 *
 * Grammar:
 * - brackets nest groups, and redundant brackets are allowed;
 * - AND / OR in any case join conditions, and AND is implied between two conditions;
 * - a group has one conjunction: AND and OR in the same group without brackets is an error, never
 *   read one way or the other. An implied AND counts as AND;
 * - a condition is `field operator value`. Inside brackets that hold only the condition, the value
 *   runs to the closing bracket (Gaia's format); elsewhere it is one word unless quoted with ' or ";
 * - IN and CONTAINS take a comma list, BETWEEN takes `a AND b`, NULL and EMPTY take no value;
 * - words that are not part of a condition form one `<textField> CONTAINS 'phrase'` condition.
 *
 * Fields, operators and values are bound through the schema: a field resolves as in `utils/query/schema`,
 * the operator must apply to its type, enum and user values resolve to their stored value, and dates
 * (`YYYY-MM-DD`, `MM/DD/YYYY` or `today`) are written as `YYYY-MM-DD`.
 *
 * Errors are `{code, params, start, end}`, with the offsets of the text they are about; their messages
 * are `components.ezSearch.errors.<code>`.
 *
 * @class Parse
 * @namespace Prometheus.Utils.Query
 * @module utils/query
 */

/**
 * Error codes the parser reports.
 *
 * @property ERRORS
 * @type Object
 * @final
 */
export const ERRORS = Object.freeze({
    missingOperator: 'missingOperator',
    missingValue: 'missingValue',
    mixedConjunction: 'mixedConjunction',
    misplacedConjunction: 'misplacedConjunction',
    unknownValue: 'unknownValue',
    ambiguousValue: 'ambiguousValue',
    invalidOperator: 'invalidOperator',
    badDate: 'badDate',
    betweenValues: 'betweenValues',
    unbalancedBracket: 'unbalancedBracket',
    unclosedQuote: 'unclosedQuote',
    unexpectedToken: 'unexpectedToken',
    excludedField: 'excludedField',
});

const VALUE_KINDS = [KINDS.value, KINDS.quoted];
// The types other than text whose CONTAINS means IN (text has its own CONTAINS).
const LIST_TYPES = ['number', 'enum', 'user'];

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
 * Two digits.
 *
 * @method pad
 * @private
 */
function pad(number) {
    return String(number).padStart(2, '0');
}

/**
 * A date as `YYYY-MM-DD`, or null when the parts are not a real date.
 *
 * @method isoDate
 * @private
 */
function isoDate(year, month, day) {
    let date = new Date(Date.UTC(year, month - 1, day));

    if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
        return null;
    }

    return `${year}-${pad(month)}-${pad(day)}`;
}

/**
 * Read a typed date: `YYYY-MM-DD`, `MM/DD/YYYY` or `today`.
 *
 * @method readDate
 * @param {String} text
 * @param {Date} today The current date
 * @return {String|null} The date as `YYYY-MM-DD`, or null when it is not a date
 * @private
 */
function readDate(text, today) {
    let typed = lower(text);

    if (typed === 'today') {
        return isoDate(today.getFullYear(), today.getMonth() + 1, today.getDate());
    }

    let iso = typed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);

    if (iso) {
        return isoDate(Number(iso[1]), Number(iso[2]), Number(iso[3]));
    }

    let us = typed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);

    if (us) {
        return isoDate(Number(us[3]), Number(us[1]), Number(us[2]));
    }

    return null;
}

/**
 * The operator a condition stores, given the typed operator and the number of values: a CONTAINS
 * list is IN, a one-value IN is `:`, and one value CONTAINS on a list field that is not text is `:`.
 *
 * @method storedOperator
 * @private
 */
function storedOperator(key, count, type) {
    let negated = key.startsWith('!') || key.startsWith('NOT');

    if (['CONTAINS', '!CONTAINS'].includes(key) && count > 1) {
        return negated ? 'NOT IN' : 'IN';
    }

    if (['IN', 'NOT IN'].includes(key) && count === 1) {
        return negated ? '!:' : ':';
    }

    if (['CONTAINS', '!CONTAINS'].includes(key) && LIST_TYPES.includes(type)) {
        return negated ? '!:' : ':';
    }

    return key;
}

/**
 * The values of a CONTAINS on a text field, with an unquoted comma value joined back into one value:
 * `hello,world`, or `hello, world` inside a Gaia condition. Gaia reads CONTAINS as IN only when the values
 * are quoted (`'a','b'`), so that value is one search text. A quoted list, or a typed list with spaces
 * after its commas, stays a list.
 *
 * @method scalarContains
 * @private
 */
function scalarContains(key, values, type, source) {
    if (!['CONTAINS', '!CONTAINS'].includes(key) || LIST_TYPES.includes(type) || values.length < 2) {
        return values;
    }

    let unquoted = values.every((value) => value.kind === KINDS.value);
    let wire = values.every((value) => value.wire);
    let contiguous = values.every((value, index) => index === 0 || value.start === values[index - 1].end + 1);

    if (!unquoted || !(wire || contiguous)) {
        return values;
    }

    let start = values[0].start;
    let end = values[values.length - 1].end;
    let text = source.slice(start, end);

    return [{ kind: KINDS.value, text, value: text, start, end }];
}

/**
 * Read the tokens of one text.
 *
 * @class Reader
 * @private
 */
class Reader {
    constructor(tokens, schema, today, source) {
        this.source = source;
        this.tokens = tokens;
        this.schema = schema;
        this.today = today;
        this.position = 0;
        this.errors = [];
    }

    peek() {
        return this.tokens[this.position];
    }

    take() {
        let token = this.tokens[this.position];

        this.position += 1;

        return token;
    }

    error(code, params, start, end) {
        this.errors.push({ code, params, start, end });

        return null;
    }

    isBracket(token, text) {
        return Boolean(token) && token.kind === KINDS.bracket && token.text === text;
    }

    /**
     * The name to show for a field: its label, or what was typed.
     */
    labelOf(field, typed) {
        return (field && field.label) || typed;
    }

    /**
     * Whether a typed word names a field the schema knows, without being a prefix of its name.
     */
    namesField(word) {
        let field = this.schema.resolveField(word);

        if (!field || !this.schema.fields.includes(field)) {
            return null;
        }

        let dot = field.id.indexOf('.');
        let names = [field.id, field.id.slice(dot + 1), field.label, ...(field.aliases || [])].map(lower);

        return names.includes(lower(word)) ? field : null;
    }

    /**
     * Read a group up to its closing bracket (or the end of the text for the root). A group that mixes
     * AND and OR is reported and read as null.
     */
    group(open) {
        let children = [];
        let conjunction = null;
        let mixed = false;
        let operands = 0;
        let pending = null;
        let lastEnd = open ? open.end : 0;

        for (;;) {
            let token = this.peek();

            if (!token) {
                if (open) {
                    this.error(ERRORS.unbalancedBracket, { bracket: '(' }, open.start, open.end);
                }
                break;
            }

            if (this.isBracket(token, ')')) {
                this.take();

                if (open) {
                    break;
                }

                this.error(ERRORS.unbalancedBracket, { bracket: ')' }, token.start, token.end);
                continue;
            }

            if (token.kind === KINDS.keyword) {
                this.take();

                if (operands === 0 || pending) {
                    this.error(ERRORS.misplacedConjunction, { conjunction: token.value }, token.start, token.end);
                } else {
                    pending = { value: token.value, start: token.start, end: token.end };
                }
                continue;
            }

            if (operands > 0) {
                // Two conditions next to each other are joined by an implied AND, between them.
                let joint = pending || { value: 'AND', start: lastEnd, end: token.start };

                if (conjunction === null) {
                    conjunction = joint.value;
                } else if (joint.value !== conjunction && !mixed) {
                    mixed = true;
                    this.error(ERRORS.mixedConjunction, { conjunction: joint.value }, joint.start, joint.end);
                }
            }

            pending = null;
            operands += 1;

            let node = this.operand();

            lastEnd = this.tokens[this.position - 1].end;

            if (node) {
                children.push(node);
            }
        }

        if (pending) {
            this.error(ERRORS.misplacedConjunction, { conjunction: pending.value }, pending.start, pending.end);
        }

        return mixed ? null : group(conjunction || 'AND', children);
    }

    operand() {
        let token = this.peek();

        if (this.isBracket(token, '(')) {
            return this.group(this.take());
        }

        if (token.kind === KINDS.field) {
            return this.condition();
        }

        if (token.kind === KINDS.word || token.kind === KINDS.quoted) {
            return this.phrase();
        }

        this.take();

        return this.error(ERRORS.unexpectedToken, { text: token.text }, token.start, token.end);
    }

    /**
     * Consecutive free-text words: one condition on the schema's text field.
     */
    phrase() {
        let words = [];

        while (this.peek() && [KINDS.word, KINDS.quoted].includes(this.peek().kind)) {
            words.push(this.take());
        }

        let unclosed = words.find((word) => word.unterminated);

        if (unclosed) {
            return this.error(ERRORS.unclosedQuote, { quote: unclosed.text[0] }, unclosed.start, unclosed.end);
        }

        let first = words[0];
        let last = words[words.length - 1];
        let field = words.length === 1 && first.kind === KINDS.word ? this.namesField(first.value) : null;

        if (field || !this.schema.textField) {
            return this.error(ERRORS.missingOperator, { field: this.labelOf(field, first.value) }, first.start, last.end);
        }

        return condition(this.schema.textField, 'CONTAINS', words.map((word) => word.value.trim()).join(' '));
    }

    /**
     * The value tokens after an operator, by how many it reads. Reports a list that ends in a comma.
     */
    values(arity, label) {
        let values = [];
        let isValue = (token) => Boolean(token) && VALUE_KINDS.includes(token.kind);

        if (arity === 0 || !isValue(this.peek())) {
            return values;
        }

        values.push(this.take());

        if (arity === 2) {
            let separator = this.peek();

            if (separator && separator.kind === KINDS.keyword && separator.value === 'AND' && isValue(this.tokens[this.position + 1])) {
                this.take();
                values.push(this.take());
            }
        }

        while (arity === 'n' && this.peek() && this.peek().kind === KINDS.comma) {
            let comma = this.take();

            if (!isValue(this.peek())) {
                this.error(ERRORS.missingValue, { field: label, operator: ',' }, comma.start, comma.end);
                values.invalid = true;
                break;
            }

            values.push(this.take());
        }

        return values;
    }

    condition() {
        let fieldToken = this.take();
        let operatorToken = this.take();
        let typed = findOperator(operatorToken.value);
        let readsList = typed.arity === 'n' || ['CONTAINS', '!CONTAINS'].includes(typed.key);
        let field = this.schema.resolveField(fieldToken.text);
        let label = this.labelOf(field, fieldToken.text);
        let seen = this.errors.length;
        let values = this.values(readsList ? 'n' : typed.arity, label);

        if (field.excluded) {
            // The values are read only to keep the parser in sync; the excluded field is the one error to report.
            this.errors.length = seen;

            return this.error(ERRORS.excludedField, { field: label, reason: field.reason || '' }, fieldToken.start, fieldToken.end);
        }

        if (values.invalid) {
            return null;
        }

        let unclosed = values.find((value) => value.unterminated);

        if (unclosed) {
            return this.error(ERRORS.unclosedQuote, { quote: unclosed.text[0] }, unclosed.start, unclosed.end);
        }

        values = scalarContains(typed.key, values, field.type, this.source);

        let key = storedOperator(typed.key, values.length, field.type);
        let entry = findOperator(key);

        if (!isValidFor(key, field.type)) {
            return this.error(ERRORS.invalidOperator, { operator: operatorToken.text, field: label }, operatorToken.start, operatorToken.end);
        }

        if (entry.arity === 2 && values.length > 0 && values.length < 2) {
            let end = values[values.length - 1].end;

            return this.error(ERRORS.betweenValues, { operator: operatorToken.text, field: label }, operatorToken.start, end);
        }

        if (entry.arity !== 0 && values.length === 0) {
            return this.error(ERRORS.missingValue, { field: label, operator: operatorToken.text }, operatorToken.start, operatorToken.end);
        }

        let bound = values.map((token) => this.bind(field, label, token));

        if (bound.includes(null)) {
            return null;
        }

        switch (entry.arity) {
            case 0:
                return condition(field.id, key, null);
            case 1:
                return condition(field.id, key, bound[0]);
            default:
                return condition(field.id, key, bound);
        }
    }

    /**
     * The stored value of one value token, or null after reporting why it can't be read.
     */
    bind(field, label, token) {
        let typed = token.value.trim();

        if (field.type === 'date') {
            let date = readDate(typed, this.today);

            return date || this.error(ERRORS.badDate, { value: typed, field: label }, token.start, token.end);
        }

        if (!['enum', 'user'].includes(field.type)) {
            return typed;
        }

        let { value, candidates } = this.schema.resolveValue(field, typed);

        if (value !== null) {
            return value;
        }

        let names = (options) => options.map((option) => option.label || option.value).join(', ');

        if (candidates.length > 1) {
            return this.error(ERRORS.ambiguousValue, { value: typed, field: label, choices: names(candidates) }, token.start, token.end);
        }

        return this.error(ERRORS.unknownValue, { value: typed, field: label, choices: names(this.schema.valuesFor(field)) }, token.start, token.end);
    }
}

/**
 * Parse query text. It never throws.
 *
 * @method parse
 * @param {String} text Typed text or a Gaia query
 * @param {Object} schema A schema from `createSchema`
 * @param {Object} [options]
 * @param {Date} [options.today] The date `today` stands for; now by default
 * @return {Object} `{tree, errors}`: the normalized tree of the conditions that could be read (a group
 *   that mixes AND and OR is left out), and the errors in the order of the text
 */
export function parse(text, schema, { today = new Date() } = {}) {
    let source = String(text ?? '');
    let reader = new Reader(lex(source, schema), schema, today, source);
    let root = reader.group(null);
    let errors = reader.errors.sort((a, b) => a.start - b.start);

    return { tree: normalize(root || group('AND', [])), errors };
}
