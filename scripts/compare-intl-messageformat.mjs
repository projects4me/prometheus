/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/**
 * Formats every translation message with Prometheus' formatter
 * (app/utils/intl/message-format.js) and with formatjs' intl-messageformat,
 * and reports where the outputs differ. A dev tool for checking the formatter;
 * intl-messageformat is not a project dependency.
 *
 * Usage (from the prometheus folder):
 *   npm install --no-save intl-messageformat@9.13
 *   node scripts/compare-intl-messageformat.mjs [file.json ...]
 *
 * With no files it reads translations/*.json. A file can also be a Gaia
 * translation document saved from GET /api/v1/translations/<locale>; its locale
 * is the file name (e.g. de-de.json). Exits 1 when an output differs.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const formatjs = await import('intl-messageformat').catch(() => {
    console.error('intl-messageformat is missing: npm install --no-save intl-messageformat@9.13');
    process.exit(2);
});
// intl-messageformat is CommonJS: Node exposes its exports as the default export
const IntlMessageFormat = formatjs.IntlMessageFormat || formatjs.default.IntlMessageFormat;

// The app module has no imports, so it loads as a data URL without a build.
const source = fs.readFileSync(path.join(root, 'app/utils/intl/message-format.js'), 'utf8');
const { formatMessage } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);

// formatjs AST node types
const ARGUMENT = 1;
const SELECT = 5;
const PLURAL = 6;

/** Collects the arguments of a formatjs AST: name => { plural?, options? }. */
function collect(nodes, args = {}) {
    for (const node of nodes) {
        if (node.type === ARGUMENT) {
            args[node.value] = args[node.value] || {};
        } else if (node.type === PLURAL || node.type === SELECT) {
            const arg = (args[node.value] = args[node.value] || {});
            if (node.type === PLURAL) {
                arg.plural = true;
            } else {
                arg.options = [...(arg.options || []), ...Object.keys(node.options)];
            }
            Object.values(node.options).forEach((option) => collect(option.value, args));
        }
    }
    return args;
}

/** One base set of values, then one set per plural count and select option. */
function valueSets(args) {
    const base = {};
    for (const [name, arg] of Object.entries(args)) {
        base[name] = arg.plural ? 2 : arg.options ? arg.options[0] : `<${name}>`;
    }
    const sets = [base];
    for (const [name, arg] of Object.entries(args)) {
        const values = arg.plural ? [0, 1, 2, 3, 5, 11, 21, 1234] : arg.options ? [...arg.options, 'zz-unknown'] : [];
        values.forEach((value) => sets.push({ ...base, [name]: value }));
    }
    return sets;
}

function flatten(object, prefix = '', out = {}) {
    for (const [key, value] of Object.entries(object)) {
        const name = prefix ? `${prefix}.${key}` : key;
        if (value && typeof value === 'object') {
            flatten(value, name, out);
        } else if (typeof value === 'string') {
            out[name] = value;
        }
    }
    return out;
}

function run(fn) {
    try {
        return fn();
    } catch (error) {
        return `[throws] ${error.message.split('\n')[0]}`;
    }
}

const files = process.argv.length > 2
    ? process.argv.slice(2)
    : fs.readdirSync(path.join(root, 'translations')).filter((f) => f.endsWith('.json')).map((f) => path.join(root, 'translations', f));

let total = 0;
let mismatches = 0;
for (const file of files) {
    const locale = path.basename(file, '.json').toLowerCase();
    const messages = flatten(JSON.parse(fs.readFileSync(file, 'utf8')));
    let fileTotal = 0;
    let fileMismatches = 0;
    for (const [key, message] of Object.entries(messages)) {
        let ast;
        try {
            ast = new IntlMessageFormat(message, locale, undefined, { ignoreTag: true }).getAst();
        } catch (error) {
            ast = [];
        }
        for (const values of valueSets(collect(ast))) {
            fileTotal++;
            const ours = run(() => formatMessage(message, values, locale));
            const theirs = run(() => String(new IntlMessageFormat(message, locale, undefined, { ignoreTag: true }).format(values)));
            const same = ours === theirs || (ours.startsWith('[throws]') && theirs.startsWith('[throws]'));
            if (!same) {
                fileMismatches++;
                console.log(`${locale} ${key} ${JSON.stringify(values)}\n  ours:   ${ours}\n  formatjs: ${theirs}`);
            }
        }
    }
    console.log(`${path.relative(root, file)}: ${fileTotal - fileMismatches}/${fileTotal} outputs match`);
    total += fileTotal;
    mismatches += fileMismatches;
}
console.log(`total: ${total - mismatches}/${total} outputs match, ${mismatches} differ`);
process.exit(mismatches ? 1 : 0);
