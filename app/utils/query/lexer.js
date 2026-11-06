/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { byAlias } from 'prometheus/utils/query/operators';

/**
 * The ezSearch lexer: splits typed or Gaia-format query text into tokens. The parser reads the tokens,
 * and the search bar uses them to colour the query, so the token kinds are part of the contract.
 *
 * A token is `{kind, text, value, start, end}`:
 * - `kind`: one of `KINDS`;
 * - `text`: the source text of the token (`text === source.slice(start, end)`);
 * - `value`: the text the token stands for: a quoted value without its quotes, a keyword or an
 *   operator in capitals, otherwise the text;
 * - `start`, `end`: the offsets in the source, end exclusive.
 *
 * A quoted value that is not closed carries `unterminated: true`.
 *
 * Which word is a field, an operator, a value or a free-text word depends on its neighbours:
 * - a word is a field when an operator follows it. A symbol operator (`:`, `!=`, `~` …) always makes
 *   the word before it a field; a word operator (`in`, `between` …) only when the word is a field the
 *   schema knows or a `Module.field` path, so that free text such as `crash in login` stays free text;
 * - after an operator come its values: none for NULL and EMPTY, two joined by `and` for BETWEEN, a
 *   comma list for IN and CONTAINS, and one word or quoted text otherwise;
 * - inside brackets, a condition that fills its brackets is Gaia's wire format: its value runs to the
 *   closing bracket (or the next comma in a list, or ` AND ` in a range), spaces included, e.g.
 *   `(assignedTo.name : Hammad Hassan)`;
 * - `and` / `or` in any case between conditions is a keyword;
 * - any other word is a free-text word.
 *
 * @class Lexer
 * @namespace Prometheus.Utils.Query
 * @module utils/query
 */

/**
 * The token kinds.
 *
 * @property KINDS
 * @type Object
 * @final
 */
export const KINDS = Object.freeze({
    field: 'field',
    operator: 'operator',
    value: 'value',
    quoted: 'quoted',
    comma: 'comma',
    keyword: 'keyword',
    bracket: 'bracket',
    word: 'word',
});

// Longest first, so that `<:` is read before `<`.
const SYMBOLS = ['!:', '!=', '<:', '<=', '>:', '>=', ':', '=', '<', '>', '~'];
const SYMBOL_START = /[:=<>~]/;
// Quotes start quoted text only at the start of a word, so `don't` stays one word.
const WORD_BREAK = /[\s(),:=<>~]/;
const CONJUNCTIONS = ['AND', 'OR'];

/**
 * Split the text into pieces: brackets, commas, quoted text, operator symbols and words.
 *
 * @method scan
 * @private
 */
function scan(text) {
    let pieces = [];
    let i = 0;

    while (i < text.length) {
        let char = text[i];

        if (/\s/.test(char)) {
            i += 1;
            continue;
        }

        if (char === '(' || char === ')' || char === ',') {
            pieces.push({ type: char, start: i, end: i + 1 });
            i += 1;
            continue;
        }

        if (char === "'" || char === '"') {
            let close = text.indexOf(char, i + 1);
            let end = close === -1 ? text.length : close + 1;

            pieces.push({ type: 'quoted', start: i, end, unterminated: close === -1 });
            i = end;
            continue;
        }

        let symbol = SYMBOLS.find((candidate) => text.startsWith(candidate, i));

        if (symbol && (SYMBOL_START.test(char) || char === '!')) {
            pieces.push({ type: 'symbol', start: i, end: i + symbol.length });
            i += symbol.length;
            continue;
        }

        let end = i + 1;

        while (end < text.length && !WORD_BREAK.test(text[end]) && !(text[end] === '!' && /[:=]/.test(text[end + 1] || ''))) {
            end += 1;
        }

        pieces.push({ type: 'word', start: i, end });
        i = end;
    }

    return pieces.map((piece) => ({ ...piece, text: text.slice(piece.start, piece.end) }));
}

/**
 * Whether a word piece is `and` / `or`.
 *
 * @method isConjunction
 * @private
 */
function isConjunction(piece) {
    return Boolean(piece) && piece.type === 'word' && CONJUNCTIONS.includes(piece.text.toUpperCase());
}

/**
 * The operator entry a word piece stands for, when it is an operator written as a word.
 *
 * @method wordOperator
 * @private
 */
function wordOperator(piece) {
    if (!piece || piece.type !== 'word' || !/^!?[A-Za-z]+$/.test(piece.text)) {
        return undefined;
    }

    return byAlias(piece.text);
}

/**
 * The operator that starts at `pieces[i]`: `{entry, length}` (in pieces), or null.
 *
 * @method operatorAt
 * @private
 */
function operatorAt(pieces, i) {
    let piece = pieces[i];

    if (!piece) {
        return null;
    }

    if (piece.type === 'symbol') {
        return { entry: byAlias(piece.text), length: 1 };
    }

    let next = pieces[i + 1];

    if (piece.type === 'word' && piece.text.toUpperCase() === 'NOT' && next && next.type === 'word' && next.text.toUpperCase() === 'IN') {
        return { entry: byAlias('NOT IN'), length: 2 };
    }

    let entry = wordOperator(piece);

    return entry ? { entry, length: 1 } : null;
}

/**
 * How many values an operator reads: 0, 1, 2 (a range) or 'n' (a list). CONTAINS and !CONTAINS read
 * a list, because a comma list after them is Gaia's IN.
 *
 * @method arityOf
 * @private
 */
function arityOf(entry) {
    if (['CONTAINS', '!CONTAINS'].includes(entry.key)) {
        return 'n';
    }

    return entry.arity;
}

/**
 * Create the lexer state for one text.
 *
 * @method tokenizer
 * @private
 */
function tokenizer(text, schema) {
    let pieces = scan(text);
    let tokens = [];

    function isKnownField(word) {
        if (!schema) {
            return true;
        }

        if (word.includes('.')) {
            return true;
        }

        let field = schema.resolveField(word);

        return Boolean(field) && schema.fields.includes(field);
    }

    function push(kind, first, last = first, value, extra = {}) {
        let start = first.start;
        let end = last.end;
        let source = text.slice(start, end);

        let token = { kind, text: source, value: value === undefined ? source : value, start, end, ...extra };

        if (first.unterminated) {
            token.unterminated = true;
        }

        tokens.push(Object.freeze(token));
    }

    function pushValue(piece) {
        if (piece.type === 'quoted') {
            let inner = piece.text.slice(1, piece.unterminated ? undefined : -1);

            push(KINDS.quoted, piece, piece, inner);
        } else {
            push(KINDS.value, piece);
        }
    }

    function isValuePiece(piece) {
        return Boolean(piece) && (piece.type === 'quoted' || (piece.type === 'word' && !isConjunction(piece)));
    }

    /**
     * Read the values of a condition that fills its brackets, in Gaia's wire format. Returns the index
     * after the values, or -1 when the brackets hold more than one condition.
     *
     * A Module.field condition is read as Gaia's Clause reads it: the value runs to the closing bracket,
     * whatever words or symbols it holds, e.g. `(Issue.subject CONTAINS error: timeout AND retry)`. Only a
     * range splits, on `AND`. Its unquoted list values are marked `wire`, so the parser can join them back
     * into one text on a text field.
     */
    function wireValues(i, arity, dotted) {
        let close = i;

        while (close < pieces.length && pieces[close].type !== ')') {
            let piece = pieces[close];

            if (piece.type === '(' || (piece.type === 'symbol' && !dotted)) {
                return -1;
            }

            close += 1;
        }

        if (close >= pieces.length || close === i) {
            return -1;
        }

        let inside = pieces.slice(i, close);
        let rangeSplit = false;

        if (dotted) {
            rangeSplit = arity === 2 && inside.filter((piece) => piece.type === 'word' && piece.text === 'AND').length === 1;
        } else {
            // A lowercase `and` / `or` is part of the value, unless a condition follows it. A range bound
            // separator may be typed in either case.
            let firstConjunction = inside.findIndex(isConjunction);
            let startsCondition =
                firstConjunction !== -1 &&
                inside.some(
                    (piece, k) =>
                        k > firstConjunction &&
                        piece.type === 'word' &&
                        i + k + 1 < close &&
                        Boolean(operatorAt(pieces, i + k + 1)) &&
                        isKnownField(piece.text)
                );

            if (startsCondition) {
                return -1;
            }

            let conjunctions = inside.filter((piece) => isConjunction(piece) && (arity === 2 || piece.text === piece.text.toUpperCase()));

            rangeSplit = arity === 2 && conjunctions.length === 1 && conjunctions[0].text.toUpperCase() === 'AND';

            if (conjunctions.length > 0 && !rangeSplit) {
                return -1;
            }
        }

        let isSeparator = (piece) => rangeSplit && isConjunction(piece) && piece.text.toUpperCase() === 'AND' && (!dotted || piece.text === 'AND');
        let wire = dotted && arity === 'n' ? { wire: true } : {};
        let segment = [];
        let flush = () => {
            if (segment.length === 1 && segment[0].type === 'quoted') {
                pushValue(segment[0]);
            } else if (segment.length > 0) {
                push(KINDS.value, segment[0], segment[segment.length - 1], undefined, wire);
            }

            segment = [];
        };

        for (let piece of inside) {
            if (piece.type === ',' && arity === 'n') {
                flush();
                push(KINDS.comma, piece);
            } else if (isSeparator(piece)) {
                flush();
                push(KINDS.keyword, piece, piece, 'AND');
            } else {
                segment.push(piece);
            }
        }

        flush();

        return close;
    }

    /**
     * Read the values of a typed condition. Returns the index after them.
     */
    function looseValues(i, arity) {
        if (arity === 0) {
            return i;
        }

        if (!isValuePiece(pieces[i])) {
            return i;
        }

        pushValue(pieces[i]);
        i += 1;

        if (arity === 2) {
            if (isConjunction(pieces[i]) && pieces[i].text.toUpperCase() === 'AND' && isValuePiece(pieces[i + 1])) {
                push(KINDS.keyword, pieces[i], pieces[i], 'AND');
                pushValue(pieces[i + 1]);
                i += 2;
            }

            return i;
        }

        while (arity === 'n' && pieces[i] && pieces[i].type === ',') {
            push(KINDS.comma, pieces[i]);
            i += 1;

            if (!isValuePiece(pieces[i])) {
                break;
            }

            pushValue(pieces[i]);
            i += 1;
        }

        return i;
    }

    function run() {
        let i = 0;

        while (i < pieces.length) {
            let piece = pieces[i];

            if (piece.type === '(' || piece.type === ')') {
                push(KINDS.bracket, piece);
                i += 1;
                continue;
            }

            if (piece.type === ',') {
                push(KINDS.comma, piece);
                i += 1;
                continue;
            }

            if (piece.type === 'symbol') {
                push(KINDS.operator, piece, piece, byAlias(piece.text).key);
                i += 1;
                continue;
            }

            if (piece.type === 'quoted') {
                pushValue(piece);
                i += 1;
                continue;
            }

            if (isConjunction(piece)) {
                push(KINDS.keyword, piece, piece, piece.text.toUpperCase());
                i += 1;
                continue;
            }

            let op = operatorAt(pieces, i + 1);
            let isField = Boolean(op) && (pieces[i + 1].type === 'symbol' || isKnownField(piece.text));

            if (!isField) {
                push(KINDS.word, piece);
                i += 1;
                continue;
            }

            let fillsBrackets = i > 0 && pieces[i - 1].type === '(';

            push(KINDS.field, piece);
            push(KINDS.operator, pieces[i + 1], pieces[i + op.length], op.entry.key);
            i += 1 + op.length;

            let arity = arityOf(op.entry);
            let after = fillsBrackets && arity !== 0 ? wireValues(i, arity, piece.text.includes('.')) : -1;

            i = after === -1 ? looseValues(i, arity) : after;
        }

        return tokens;
    }

    return { run };
}

/**
 * Split query text into tokens.
 *
 * @method lex
 * @param {String} text The typed text or a Gaia query
 * @param {Object} [schema] A schema from `createSchema`; without one, any word before a word operator
 *   is a field
 * @return {Array} The tokens, in source order
 */
export function lex(text, schema = null) {
    return tokenizer(String(text ?? ''), schema).run();
}
