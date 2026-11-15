/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/**
 * Reads what a component's template and class actually use (arguments, blocks, yielded values) and
 * compares it to its contract manifest (`public/ui-docs/<name>.json`, format in `public/ui-docs/README.md`).
 *
 * The sources are read with a small tokenizer, not the Glimmer parser, which is not available in the
 * test bundle. It understands what the components use: `{{@arg}}`, `this.args.arg`, `{{yield … to="x"}}`,
 * `(has-block "x")` and `(component "path" key=value)` in yield parameters. It skips Handlebars and JS
 * comments, and `@name=` on child component invocations (that passes an argument, it does not read one).
 *
 * @class ComponentContract
 * @author Agent Odysseus
 */

const IDENT = '[A-Za-z_][\\w]*';

/** Handlebars source without `{{!-- --}}` and `{{! }}` comments. */
function stripTemplateComments(source) {
	return source.replace(/\{\{!--[\s\S]*?--\}\}/g, '').replace(/\{\{![\s\S]*?\}\}/g, '');
}

/** JS source without block and line comments (docblocks mention `@arg` names in prose). */
function stripScriptComments(source) {
	return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:\\])\/\/.*$/gm, '$1');
}

/**
 * Splits a Handlebars expression body into its top-level tokens: words, quoted strings,
 * `key=value` pairs and `( … )` sub-expressions kept whole.
 */
export function tokenize(body) {
	let tokens = [];
	let current = '';
	let depth = 0;
	let quote = null;
	for (let char of body) {
		if (quote) {
			current += char;
			if (char === quote) {
				quote = null;
			}
		} else if (char === '"' || char === "'") {
			quote = char;
			current += char;
		} else if (char === '(') {
			depth++;
			current += char;
		} else if (char === ')') {
			depth--;
			current += char;
		} else if (/\s/.test(char) && depth === 0) {
			if (current) {
				tokens.push(current);
			}
			current = '';
		} else {
			current += char;
		}
	}
	if (current) {
		tokens.push(current);
	}
	return tokens;
}

const unquote = (token) => token.replace(/^["']|["']$/g, '');
const isPair = (token) => new RegExp(`^${IDENT}=`).test(token);

/** A positional yield parameter: `{ component, curried }` for `(component "path" k=v)`, else `{ expression }`. */
function describeParam(token) {
	let inner = token.startsWith('(') && token.endsWith(')') ? tokenize(token.slice(1, -1)) : null;
	if (inner && inner[0] === 'component' && /^["']/.test(inner[1] ?? '')) {
		return {
			component: unquote(inner[1]),
			curried: inner
				.slice(2)
				.filter(isPair)
				.map((pair) => pair.split('=')[0])
				.sort(),
		};
	}
	return { expression: token };
}

/** The body of every `{{yield …}}` in a template (the text between `yield` and the closing `}}`). */
function yieldBodies(template) {
	let bodies = [];
	let pattern = /\{\{~?\s*yield\b/g;
	let match;
	while ((match = pattern.exec(template))) {
		let start = match.index + match[0].length;
		let depth = 0;
		let quote = null;
		let end = start;
		for (; end < template.length; end++) {
			let char = template[end];
			if (quote) {
				quote = char === quote ? null : quote;
			} else if (char === '"' || char === "'") {
				quote = char;
			} else if (char === '(') {
				depth++;
			} else if (char === ')') {
				depth--;
			} else if (depth === 0 && template.startsWith('}}', end)) {
				break;
			}
		}
		bodies.push(template.slice(start, end).replace(/~$/, ''));
	}
	return bodies;
}

/**
 * What a template uses.
 *
 * @method templateUsage
 * @param {String} source the `.hbs` source
 * @return {Object} `{ args: Set, blocks: Set, yields: { block: [[param, …], …] } }`; `yields` has one
 *   entry per `{{yield}}` of a block, each the list of its positional parameters (see describeParam).
 */
export function templateUsage(source) {
	let template = stripTemplateComments(source ?? '');
	let args = new Set();
	for (let [, name] of template.matchAll(new RegExp(`(?<![\\w.@])@(${IDENT})\\b(?!\\s*=)`, 'g'))) {
		args.add(name);
	}
	let blocks = new Set();
	let yields = {};
	for (let body of yieldBodies(template)) {
		let tokens = tokenize(body);
		let to = tokens.find((t) => t.startsWith('to='));
		let block = to ? unquote(to.slice(3)) : 'default';
		blocks.add(block);
		(yields[block] ??= []).push(tokens.filter((t) => !isPair(t)).map(describeParam));
	}
	for (let [, name] of template.matchAll(/\(has-block(?:-params)?(?:\s+["']([\w-]+)["'])?\s*\)/g)) {
		blocks.add(name ?? 'default');
	}
	return { args, blocks, yields };
}

/**
 * The arguments a component class reads (`this.args.name`, `this.args?.name`, `args.name`).
 *
 * @method scriptUsage
 * @param {String} source the `.js` source
 * @return {Set} argument names
 */
export function scriptUsage(source) {
	let script = stripScriptComments(source ?? '');
	let args = new Set();
	for (let [, name] of script.matchAll(new RegExp(`\\bargs\\??\\.(${IDENT})`, 'g'))) {
		args.add(name);
	}
	return args;
}

const sorted = (values) => [...values].sort();

/** Problems in the shape of a manifest (fields the format requires). */
function shapeProblems(file, manifest) {
	let problems = [];
	for (let field of ['name', 'component', 'doc', 'description']) {
		if (typeof manifest[field] !== 'string' || !manifest[field]) {
			problems.push(`${file}: "${field}" must be a non-empty string`);
		}
	}
	for (let field of ['arguments', 'events', 'blocks']) {
		if (!manifest[field] || typeof manifest[field] !== 'object' || Array.isArray(manifest[field])) {
			problems.push(`${file}: "${field}" must be an object keyed by name`);
		}
	}
	for (let [name, arg] of Object.entries(manifest.arguments ?? {})) {
		if (typeof arg.type !== 'string' || typeof arg.required !== 'boolean' || typeof arg.description !== 'string') {
			problems.push(`${file}: argument @${name} needs type, required and description`);
		}
		if (arg.required && 'default' in arg) {
			problems.push(`${file}: argument @${name} is required and has a default`);
		}
	}
	for (let [name, event] of Object.entries(manifest.events ?? {})) {
		if (!/^on[A-Z]/.test(name)) {
			problems.push(`${file}: event @${name} must be named on<Something>`);
		}
		if (!Array.isArray(event.payload) || typeof event.description !== 'string') {
			problems.push(`${file}: event @${name} needs a payload array and a description`);
		}
		if (name in (manifest.arguments ?? {})) {
			problems.push(`${file}: @${name} is both an argument and an event`);
		}
	}
	for (let [name, block] of Object.entries(manifest.blocks ?? {})) {
		if (typeof block.description !== 'string' || !Array.isArray(block.yields)) {
			problems.push(`${file}: block ${name} needs a description and a yields array`);
		}
	}
	return problems;
}

/** Declared names that are missing from `used`, and used names that are not declared. */
function diff(label, declared, used) {
	let problems = [];
	for (let name of sorted(used)) {
		if (!declared.has(name)) {
			problems.push(`${label} uses ${name} but the manifest does not declare it`);
		}
	}
	for (let name of sorted(declared)) {
		if (!used.has(name)) {
			problems.push(`${label} declares ${name} but does not use it`);
		}
	}
	return problems;
}

/** Problems with a yielded contextual component: its curried args, its own arguments and blocks. */
function yieldedComponentProblems(label, value, param, sources) {
	let problems = [];
	if (param.component !== value.component) {
		return [`${label} yields ${param.component ?? param.expression}, the manifest says component ${value.component}`];
	}
	if (sorted(value.curried ?? []).join() !== param.curried.join()) {
		problems.push(`${label} curries ${param.curried.join(', ') || 'nothing'}, the manifest says ${sorted(value.curried ?? []).join(', ') || 'nothing'}`);
	}
	let source = sources[value.component];
	if (!source || (!source.template && !source.script)) {
		return [...problems, `${label}: component ${value.component} not found`];
	}
	let usage = templateUsage(source.template);
	let used = new Set([...usage.args, ...scriptUsage(source.script)]);
	let declared = new Set([...(value.curried ?? []), ...Object.keys(value.arguments ?? {})].map((n) => `@${n}`));
	problems.push(...diff(`${value.component}`, declared, new Set(sorted(used).map((n) => `@${n}`))));
	problems.push(...diff(`${value.component} blocks:`, new Set(value.blocks ?? []), usage.blocks));
	return problems;
}

/** Every argument and event name the manifest declares, without the `@`. */
function declaredNames(manifest) {
	return new Set([...Object.keys(manifest.arguments), ...Object.keys(manifest.events)]);
}

/** Arguments and blocks the component uses but the manifest doesn't declare, and the reverse. */
function usageProblems(label, manifest, declared, source, usage) {
	let declaredArgs = new Set(sorted(declared).map((n) => `@${n}`));
	let usedArgs = new Set([...usage.args, ...scriptUsage(source.script)].map((n) => `@${n}`));
	return [
		...diff(label, declaredArgs, usedArgs),
		...diff(`${label} block`, new Set(Object.keys(manifest.blocks)), usage.blocks),
	];
}

/** Yield counts per block, and each yielded contextual component against its own source. */
function yieldProblems(label, manifest, usage, sources) {
	let problems = [];
	for (let [name, block] of Object.entries(manifest.blocks)) {
		for (let params of usage.yields[name] ?? []) {
			if (params.length !== block.yields.length) {
				problems.push(`${label} block ${name} yields ${params.length} values, the manifest lists ${block.yields.length}`);
				continue;
			}
			block.yields.forEach((value, index) => {
				if (value.component) {
					problems.push(...yieldedComponentProblems(`${label} block ${name}`, value, params[index], sources));
				}
			});
		}
	}
	return problems;
}

/** `data` and `variants` entries that name arguments or blocks the manifest doesn't declare. */
function referenceProblems(file, manifest, declared) {
	let problems = [];
	for (let name of Object.keys(manifest.data ?? {})) {
		if (!(name in manifest.arguments)) {
			problems.push(`${file}: data describes @${name}, which is not a declared argument`);
		}
	}
	for (let variant of manifest.variants ?? []) {
		for (let name of variant.arguments ?? []) {
			if (!declared.has(name)) {
				problems.push(`${file}: variant ${variant.name} uses @${name}, which is not declared`);
			}
		}
		for (let name of variant.blocks ?? []) {
			if (!(name in manifest.blocks)) {
				problems.push(`${file}: variant ${variant.name} uses block ${name}, which is not declared`);
			}
		}
	}
	return problems;
}

/**
 * Compares a manifest to the component it describes.
 *
 * @method contractProblems
 * @param {String} file the manifest file name, for the messages
 * @param {Object} manifest the parsed manifest
 * @param {Object} sources `{ 'component/path': { template, script } }`
 * @param {Array} docs the `.md` file names in ui-docs
 * @return {Array} one message per problem; empty when the manifest matches
 */
export function contractProblems(file, manifest, sources, docs = []) {
	if (manifest.parseError) {
		return [`${file}: not valid JSON (${manifest.parseError})`];
	}
	let problems = shapeProblems(file, manifest);
	if (problems.length) {
		return problems;
	}
	if (!docs.includes(manifest.doc)) {
		problems.push(`${file}: doc ${manifest.doc} not found in public/ui-docs`);
	}
	let source = sources[manifest.component];
	if (!source || (!source.template && !source.script)) {
		return [...problems, `${file}: component ${manifest.component} not found in app/components`];
	}
	let label = `${file} (${manifest.component})`;
	let usage = templateUsage(source.template);
	let declared = declaredNames(manifest);
	return [
		...problems,
		...usageProblems(label, manifest, declared, source, usage),
		...yieldProblems(label, manifest, usage, sources),
		...referenceProblems(file, manifest, declared),
	];
}
