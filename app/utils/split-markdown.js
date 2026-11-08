/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/**
 * Splits markdown on its "## " headings. Text before the first heading is dropped, and headings inside
 * code fences (``` or ~~~, optionally indented) are ignored.
 *
 * @method splitMarkdown
 * @param {String} text
 * @return {Array} sections, each with a title and a markdown body
 */
export default function splitMarkdown(text) {
    let sections = [];
    let fence = null;
    for (let line of text.split(/\r?\n/)) {
        let marker = line.match(/^\s*(```|~~~)/);
        if (marker) {
            if (!fence) {
                fence = marker[1];
            } else if (fence === marker[1]) {
                fence = null;
            }
        }
        let heading = !fence && line.match(/^##\s+(.+?)\s*$/);
        if (heading) {
            sections.push({ title: heading[1], lines: [] });
        } else if (sections.length) {
            sections[sections.length - 1].lines.push(line);
        }
    }
    return sections.map(section => ({ title: section.title, body: section.lines.join('\n').trim() }));
}
