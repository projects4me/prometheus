/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/**
 * Gaia's answer to a list export (`?export=true`): the address of the CSV to download. The address carries
 * the rows asked for (`ids`, or `selectAll` with `query`) so tests can check what was exported.
 *
 * @param {String} module the module exported
 * @param {Object} request the Mirage request
 * @return {Object} `{ download_url }`
 */
export default function exportResponse(module, request) {
	let { ids, selectAll, query } = request.queryParams;
	let params = selectAll ? `selectAll=true&query=${encodeURIComponent(query ?? '')}` : `ids=${ids ?? ''}`;

	return { download_url: `/download/${module}.csv?${params}` };
}
