/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/**
 * The plain text of an HTML fragment: entities decoded and tags dropped. DOMParser runs no script. The fragment
 * follows a `<body>` tag because the parser drops whitespace that comes before the body.
 *
 * @method textOf
 * @param {String} html
 * @return {String}
 * @private
 */
function textOf(html) {
	return new DOMParser().parseFromString(`<body>${html}`, 'text/html').body.textContent ?? '';
}

/**
 * Splits a Gaia search snippet into text parts, so a template can render the matches without trusting the HTML.
 * Gaia escapes the record's text and wraps each match in `<mark>`; the record text of a rich-text field is itself
 * HTML, so each part is read as text twice: once to undo Gaia's escaping and once to drop the field's own tags.
 *
 * @method snippetParts
 * @param {String|null} snippet the snippet as Gaia sends it
 * @return {Array<Object>} `[{ text, match }]`, empty for no snippet
 */
export default function snippetParts(snippet) {
	if (!snippet) {
		return [];
	}
	return String(snippet)
		.split(/<mark>|<\/mark>/)
		.map((html, index) => ({ text: textOf(textOf(html)), match: index % 2 === 1 }))
		.filter((part) => part.text.length);
}
