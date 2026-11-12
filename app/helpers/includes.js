/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { helper } from '@ember/component/helper';
import { toArray } from 'prometheus/utils/array/to-array';

/** {{includes value array}}: when value is an array, all of its items must be included. */
export function includes([needle, haystack]) {
	if (!haystack) {
		return false;
	}
	const list = Array.isArray(haystack) ? haystack : toArray(haystack);
	if (typeof list.includes !== 'function') {
		return false;
	}
	return Array.isArray(needle) ? needle.every((n) => list.includes(n)) : list.includes(needle);
}

export default helper(includes);
