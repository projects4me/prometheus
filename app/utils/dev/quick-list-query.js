/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { isCondition, isGroup } from 'prometheus/utils/query/ast';

const FIELDS = { 'Issue.title': 'title', 'Issue.status': 'status', 'Issue.creator': 'creator', 'Issue.tag': 'tags' };

/**
 * @method textsOf
 * @private
 */
function textsOf(value) {
	return (Array.isArray(value) ? value : [value])
		.filter((v) => v !== null && v !== undefined && v !== '')
		.map((v) => String(v).toLowerCase());
}

/**
 * Whether a record satisfies one condition of an ezSearch tree. Incomplete or unknown fields match.
 *
 * @method matchesCondition
 * @param {Object} record a fixture record
 * @param {Object} node a condition node
 * @return {Boolean}
 */
function matchesCondition(record, node) {
	let property = FIELDS[node.field];
	if (!property) {
		return true;
	}
	let have = textsOf(record[property]);
	let want = textsOf(node.value);
	let any = (test) => want.some((w) => have.some((h) => test(h, w)));
	switch (node.operator) {
		case ':':
		case 'IN':
			return any((h, w) => h === w);
		case '!:':
		case 'NOT IN':
			return !any((h, w) => h === w);
		case 'CONTAINS':
			return any((h, w) => h.includes(w));
		case '!CONTAINS':
			return !any((h, w) => h.includes(w));
		case 'STARTS':
			return any((h, w) => h.startsWith(w));
		case '!STARTS':
			return !any((h, w) => h.startsWith(w));
		case 'ENDS':
			return any((h, w) => h.endsWith(w));
		case '!ENDS':
			return !any((h, w) => h.endsWith(w));
		case 'NULL':
		case 'EMPTY':
			return have.length === 0;
		case '!NULL':
		case '!EMPTY':
			return have.length > 0;
		default:
			return true;
	}
}

/**
 * Whether a record satisfies an ezSearch tree (the fixture has no Gaia behind it, so the demo filters in memory).
 *
 * @method matchesTree
 * @param {Object} record a fixture record
 * @param {Object} node the tree or one of its nodes
 * @return {Boolean}
 */
export function matchesTree(record, node) {
	if (isCondition(node)) {
		return matchesCondition(record, node);
	}
	if (isGroup(node)) {
		let test = (child) => matchesTree(record, child);
		return node.conjunction === 'OR' ? node.children.length === 0 || node.children.some(test) : node.children.every(test);
	}
	return true;
}
