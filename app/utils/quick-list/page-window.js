/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/**
 * Whether a Gaia list response has a next page. Gaia reads one row more than the page size, drops it from
 * the response and only then adds `meta.links.next`, so the link is the whole answer: Prometheus never asks
 * for totals or runs count queries to page. See docs/architecture/lists/decisions.md.
 *
 * @method hasNextPage
 * @param {Object} [meta] The `meta` of a list response
 * @returns {Boolean}
 */
export function hasNextPage(meta) {
	return Boolean(meta?.links?.next);
}
