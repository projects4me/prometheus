/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { helper } from '@ember/component/helper';
import { toArray } from 'prometheus/utils/array/to-array';

/** {{slice start end array}} (or {{slice start array}}). */
export function slice(params) {
	const array = params[params.length - 1];
	const [start = 0, end] = params.slice(0, -1);
	const list = toArray(array);
	return Array.from(list || []).slice(start, end);
}

export default helper(slice);
