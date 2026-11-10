/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/**
 * A small ICU MessageFormat formatter on the browser's Intl APIs. Supports what
 * Prometheus translations use: `{arg}`, `{n, plural, =0 {..} one {..} other {..}}`
 * (with `offset:` and `#`), `{x, select, a {..} other {..}}` and ICU apostrophe
 * quoting (`''` is a quote, `'{literal}'` is literal text). HTML tags are plain
 * text, as with ember-intl's `ignoreTag: true`.
 *
 * Like formatjs, a placeholder whose name is missing from `values` throws.
 *
 * @module prometheus/utils/intl/message-format
 */

const cache = new Map();

/**
 * @method formatMessage
 * @param {String} message The ICU message
 * @param {Object} [values] The placeholder values
 * @param {String} [locale] Used for plural rules and `#`
 * @return {String}
 */
export function formatMessage(message, values, locale) {
    let ast = cache.get(message);
    if (!ast) {
        ast = new Parser(message).parse();
        cache.set(message, ast);
    }
    return render(ast, values || {}, locale, null, message);
}

function render(nodes, values, locale, pluralValue, message) {
    let out = '';
    for (const node of nodes) {
        if (typeof node === 'string') {
            out += node;
        } else if (node.type === 'pound') {
            out += pluralValue === null ? '#' : new Intl.NumberFormat(locale).format(pluralValue);
        } else {
            if (!(node.name in values)) {
                throw new Error(`The intl string context variable "${node.name}" was not provided to the string "${message}"`);
            }
            const value = values[node.name];
            if (node.type === 'arg') {
                out += typeof value === 'string' || typeof value === 'number' ? String(value) : value ? String(value) : '';
            } else if (node.type === 'plural') {
                const number = Number(value);
                const exact = node.options[`=${number}`];
                const shifted = number - node.offset;
                const branch =
                    exact ||
                    node.options[new Intl.PluralRules(locale).select(shifted)] ||
                    node.options.other;
                out += render(branch, values, locale, shifted, message);
            } else {
                const branch = node.options[String(value)] || node.options.other;
                out += render(branch, values, locale, pluralValue, message);
            }
        }
    }
    return out;
}

class Parser {
    constructor(message) {
        this.s = message;
        this.i = 0;
    }

    parse() {
        const nodes = this.nodes(false);
        if (this.i < this.s.length) {
            throw new Error(`Unexpected "${this.s[this.i]}" in "${this.s}"`);
        }
        return nodes;
    }

    /** Parses until an unmatched `}` (left for the caller) or the end. */
    nodes(inPlural) {
        const nodes = [];
        let text = '';
        const flush = () => {
            if (text) {
                nodes.push(text);
                text = '';
            }
        };
        while (this.i < this.s.length) {
            const c = this.s[this.i];
            if (c === "'") {
                text += this.quoted(inPlural);
            } else if (c === '{') {
                flush();
                nodes.push(this.argument());
            } else if (c === '}') {
                break;
            } else if (c === '#' && inPlural) {
                flush();
                nodes.push({ type: 'pound' });
                this.i++;
            } else {
                text += c;
                this.i++;
            }
        }
        flush();
        return nodes;
    }

    /** ICU apostrophe rules, starting at a `'`. */
    quoted(inPlural) {
        const next = this.s[this.i + 1];
        if (next === "'") {
            this.i += 2;
            return "'";
        }
        if (next === '{' || next === '}' || (inPlural && next === '#')) {
            this.i++;
            let text = '';
            while (this.i < this.s.length) {
                const c = this.s[this.i];
                if (c === "'") {
                    if (this.s[this.i + 1] === "'") {
                        text += "'";
                        this.i += 2;
                        continue;
                    }
                    this.i++;
                    return text;
                }
                text += c;
                this.i++;
            }
            return text;
        }
        this.i++;
        return "'";
    }

    argument() {
        this.i++; // {
        const name = this.word();
        this.space();
        if (this.s[this.i] === '}') {
            this.i++;
            return { type: 'arg', name };
        }
        this.expect(',');
        const kind = this.word();
        this.space();
        if (kind !== 'plural' && kind !== 'select') {
            throw new Error(`Unsupported argument type "${kind}" in "${this.s}"`);
        }
        this.expect(',');
        let offset = 0;
        const options = {};
        this.space();
        if (this.s.startsWith('offset:', this.i)) {
            this.i += 'offset:'.length;
            this.space();
            offset = Number(this.word());
        }
        for (;;) {
            this.space();
            if (this.s[this.i] === '}') {
                this.i++;
                break;
            }
            const key = this.word();
            this.space();
            this.expect('{', false);
            const branch = this.nodes(kind === 'plural');
            this.expect('}', false);
            options[key] = branch;
        }
        if (!options.other) {
            throw new Error(`Missing "other" option in "${this.s}"`);
        }
        return { type: kind, name, offset, options };
    }

    word() {
        this.space();
        const start = this.i;
        while (this.i < this.s.length && !/[\s,{}]/.test(this.s[this.i])) {
            this.i++;
        }
        if (start === this.i) {
            throw new Error(`Expected a name at ${start} in "${this.s}"`);
        }
        return this.s.slice(start, this.i);
    }

    space() {
        while (this.i < this.s.length && /\s/.test(this.s[this.i])) {
            this.i++;
        }
    }

    expect(c, skipSpace = true) {
        if (skipSpace) {
            this.space();
        }
        if (this.s[this.i] !== c) {
            throw new Error(`Expected "${c}" at ${this.i} in "${this.s}"`);
        }
        this.i++;
    }
}
