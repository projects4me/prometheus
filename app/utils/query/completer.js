/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { KINDS, lex } from 'prometheus/utils/query/lexer';
import { byAlias, forType } from 'prometheus/utils/query/operators';

/**
 * The ezSearch completer: the pure logic behind the search bar's suggestion menu. Given the text, the
 * cursor and a schema it says what comes next and what to suggest. It does not touch the UI.
 *
 * `complete(text, cursor, schema)` returns `{context, replaceStart, replaceEnd, suggestions}`:
 * - `context`: `field`, `operator`, `value` or `connector`;
 * - `replaceStart`, `replaceEnd`: the range of `text` a suggestion replaces when accepted (the word under
 *   the cursor, to its end; an empty range at the cursor when no word is being typed);
 * - `suggestions`: at most `MAX_SUGGESTIONS` of `{kind, label, insert, detail}`. `kind` is `field`,
 *   `text`, `operator`, `value`, `keyword` or `bracket`; `label` is a translation key for operators and
 *   the free-text item (with `params`) and plain text otherwise.
 *
 * The state is read from the lexer's tokens of the text before the cursor. A group never mixes AND and
 * OR, and an implied AND (two conditions with nothing between) counts as AND.
 *
 * @class Completer
 * @namespace Prometheus.Utils.Query
 * @module utils/query
 */

/**
 * The most suggestions returned.
 *
 * @property MAX_SUGGESTIONS
 * @type Number
 * @final
 */
export const MAX_SUGGESTIONS = 8;

export const SEARCH_TEXT_KEY = 'components.ezSearch.completer.searchText';

const WORD_BREAK = /[\s(),:=<>~]/;
const NEEDS_QUOTES = /[\s(),:=<>~'"]/;
const FRAGMENT_KINDS = [KINDS.word, KINDS.keyword, KINDS.value, KINDS.quoted];

/**
 * @method lower
 * @private
 */
function lower(text) {
    return String(text ?? '').toLowerCase();
}

/**
 * How well a typed fragment matches an item: 0 exact, 1 label prefix, 2 name prefix, 3 word start inside
 * the label, 4 substring, null for no match.
 *
 * @method score
 * @private
 */
function score(fragment, label, names) {
    let key = lower(fragment);
    let text = lower(label);
    let all = names.map(lower);

    if (key === text || all.includes(key)) {
        return 0;
    }

    if (text.startsWith(key)) {
        return 1;
    }

    if (all.some((name) => name.startsWith(key))) {
        return 2;
    }

    if (text.split(/[\s_\-.]+/).some((word) => word.startsWith(key))) {
        return 3;
    }

    if ([text, ...all].some((name) => name.includes(key))) {
        return 4;
    }

    return null;
}

/**
 * Keep the items that match the fragment, best first, ties in their original order.
 *
 * @method rank
 * @private
 */
function rank(fragment, items) {
    if (fragment === '') {
        return items.map((item) => item.suggestion);
    }

    return items
        .map((item, index) => ({ item, index, rating: score(fragment, item.label, item.names) }))
        .filter((entry) => entry.rating !== null)
        .sort((a, b) => a.rating - b.rating || a.index - b.index)
        .map((entry) => entry.item.suggestion);
}

/**
 * @method shortName
 * @private
 */
function shortName(id) {
    let dot = id.indexOf('.');

    return dot === -1 ? id : id.slice(dot + 1);
}

/**
 * Quote a value that would not read back as one word.
 *
 * @method quoteValue
 * @private
 */
function quoteValue(value) {
    let text = String(value);

    if (!NEEDS_QUOTES.test(text)) {
        return text;
    }

    return text.includes('"') ? `'${text}'` : `"${text}"`;
}

/**
 * Read where the typed query stands: the group stack and what the next token is.
 *
 * @method readState
 * @private
 */
function readState(tokens, schema) {
    let groups = [{ count: 0, conjunction: null }];
    let state = 'field';
    let current = null;
    let values = 0;
    let group = () => groups[groups.length - 1];
    let begin = () => {
        if (state === 'connector' && !group().conjunction) {
            group().conjunction = 'AND';
        }
    };
    let complete = () => {
        group().count += 1;
        state = 'connector';
    };

    tokens.forEach((token, index) => {
        if (token.kind === KINDS.bracket && token.value === '(') {
            begin();
            groups.push({ count: 0, conjunction: null });
            state = 'field';
        } else if (token.kind === KINDS.bracket) {
            if (groups.length > 1) {
                groups.pop();
                complete();
            }
        } else if (token.kind === KINDS.field) {
            begin();
            current = { field: schema.resolveField(token.value), arity: null };
            state = 'operator';
        } else if (token.kind === KINDS.operator) {
            let entry = byAlias(token.value);

            current = current || { field: null };
            current.arity = ['CONTAINS', '!CONTAINS'].includes(entry.key) ? 'n' : entry.arity;
            values = 0;

            if (current.arity === 0) {
                complete();
            } else {
                state = 'value';
            }
        } else if (token.kind === KINDS.value || token.kind === KINDS.quoted) {
            values += 1;

            if (current && current.arity === 2 && values === 1) {
                state = 'between';
            } else {
                complete();
            }
        } else if (token.kind === KINDS.comma) {
            if (current && current.arity === 'n') {
                if (state === 'connector') {
                    // A list is one condition: it was counted when its first value completed.
                    group().count -= 1;
                }

                state = 'value';
            }
        } else if (token.kind === KINDS.keyword) {
            if (state === 'between') {
                state = 'value';
            } else if (state === 'connector') {
                group().conjunction = group().conjunction || token.value;
                state = 'field';
            }
        } else if (token.kind === KINDS.word) {
            let field = schema.resolveField(token.text);
            let last = index === tokens.length - 1;

            begin();

            if (last && field && schema.fields.includes(field)) {
                current = { field, arity: null };
                state = 'operator';
            } else {
                complete();
            }
        }
    });

    return { state, field: current && current.field, group: group(), depth: groups.length };
}

/**
 * The fragment being typed at the cursor, as the last token of the text before it.
 *
 * @method fragmentOf
 * @private
 */
function fragmentOf(tokens, cursor) {
    let last = tokens[tokens.length - 1];

    if (!last || last.end !== cursor) {
        return null;
    }

    let isWordOperator = last.kind === KINDS.operator && /^[A-Za-z]/.test(last.text);

    return FRAGMENT_KINDS.includes(last.kind) || isWordOperator ? last : null;
}

/**
 * The end of the word the cursor is in.
 *
 * @method wordEnd
 * @private
 */
function wordEnd(text, cursor, fragment) {
    if (!fragment) {
        return cursor;
    }

    let quote = text[fragment.start];

    if (fragment.kind === KINDS.quoted && (quote === '"' || quote === "'")) {
        if (!fragment.unterminated) {
            return cursor;
        }

        let close = text.indexOf(quote, cursor);

        return close === -1 ? text.length : close + 1;
    }

    let end = cursor;

    while (end < text.length && !WORD_BREAK.test(text[end]) && !(text[end] === '!' && /[:=]/.test(text[end + 1] || ''))) {
        end += 1;
    }

    return end;
}

/**
 * @method fieldItems
 * @private
 */
function fieldItems(schema, fragment, literal = fragment) {
    let items = schema.fields.map((field) => ({
        label: field.label || shortName(field.id),
        names: [...(field.aliases || []), field.id, shortName(field.id)],
        suggestion: { kind: 'field', label: field.label || field.labelKey || shortName(field.id), insert: (field.aliases || [])[0] || shortName(field.id), detail: field.id },
    }));
    let ranked = rank(fragment, items);
    let textField = schema.textField && schema.fields.find((field) => field.id === schema.textField);

    if (fragment === '' || !textField) {
        return ranked.slice(0, MAX_SUGGESTIONS);
    }

    let search = {
        kind: 'text',
        label: SEARCH_TEXT_KEY,
        params: { field: textField.label || shortName(textField.id), word: fragment },
        insert: literal,
        detail: textField.id,
    };

    return [...ranked.slice(0, MAX_SUGGESTIONS - 1), search];
}

/**
 * @method operatorItems
 * @private
 */
function operatorItems(field, fragment) {
    let items = forType(field ? field.type : 'text').map((op) => {
        let name = op.labelKey.split('.').pop();

        return {
            label: name,
            names: [op.key, ...op.aliases],
            suggestion: { kind: 'operator', label: op.labelKey, insert: op.key, detail: op.symbol },
        };
    });

    return rank(fragment, items).slice(0, MAX_SUGGESTIONS);
}

/**
 * @method valueItems
 * @private
 */
function valueItems(schema, field, fragment) {
    if (!field) {
        return [];
    }

    let options = [];

    if (field.type === 'date') {
        options = [{ value: 'today', label: 'today' }];
    } else if (field.type === 'user') {
        options = [...schema.valuesFor(field)].sort((a, b) => String(a.label).localeCompare(String(b.label)));
    } else if (field.type === 'enum') {
        options = schema.valuesFor(field);
    }

    let items = options.map((option) => ({
        label: option.label,
        names: [option.value],
        suggestion: { kind: 'value', label: option.label, insert: quoteValue(option.value), detail: field.id },
    }));

    return rank(fragment, items).slice(0, MAX_SUGGESTIONS);
}

/**
 * @method connectorItems
 * @private
 */
function connectorItems({ state, group, depth }, fragment) {
    if (state === 'between') {
        return rank(fragment, [{ label: 'AND', names: [], suggestion: { kind: 'keyword', label: 'AND', insert: 'AND', detail: '' } }]);
    }

    let words = group.conjunction ? [group.conjunction] : group.count > 1 ? [] : ['AND', 'OR'];
    let items = words.map((word) => ({ label: word, names: [], suggestion: { kind: 'keyword', label: word, insert: word, detail: '' } }));

    if (depth > 1 && fragment === '') {
        items.push({ label: ')', names: [], suggestion: { kind: 'bracket', label: ')', insert: ')', detail: '' } });
    }

    return rank(fragment, items);
}

/**
 * Say what comes next at the cursor and what to suggest.
 *
 * @method complete
 * @param {String} text The query text
 * @param {Number} cursor The cursor offset in `text`
 * @param {Object} schema A schema from `createSchema`
 * @return {Object} `{context, replaceStart, replaceEnd, suggestions}`
 */
export function complete(text, cursor, schema) {
    let source = String(text ?? '');
    let at = Math.max(0, Math.min(cursor ?? source.length, source.length));
    let tokens = lex(source.slice(0, at), schema);
    let fragment = fragmentOf(tokens, at);
    let rest = fragment ? tokens.slice(0, -1) : tokens;
    let typed = fragment ? String(fragment.kind === KINDS.quoted ? fragment.value : fragment.text) : '';
    let state = readState(rest, schema);
    let literal = typed;

    if (fragment && fragment.kind === KINDS.quoted) {
        // Keep the quotes so the text stays one phrase (or one text search) when inserted.
        let raw = source.slice(fragment.start, at);

        literal = fragment.unterminated ? raw + raw[0] : raw;
    }
    let context = state.state === 'between' ? 'connector' : state.state;
    let suggestions;

    if (context === 'field') {
        suggestions = fieldItems(schema, typed, literal);
    } else if (context === 'operator') {
        suggestions = operatorItems(state.field, typed);
    } else if (context === 'value') {
        suggestions = valueItems(schema, state.field, typed);
    } else {
        suggestions = connectorItems(state, typed);

        if (typed !== '' && suggestions.length === 0) {
            // Words that continue the query without a conjunction start a new condition (an implied AND).
            context = 'field';
            suggestions = fieldItems(schema, typed, literal);
        }
    }

    return {
        context,
        replaceStart: fragment ? fragment.start : at,
        replaceEnd: wordEnd(source, at, fragment),
        suggestions,
    };
}
