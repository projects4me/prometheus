/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { helper } from '@ember/component/helper';
import { toArray } from 'prometheus/utils/array/to-array';

/** {{join ', ' array}}: joins the array with the separator. */
export function join([separator, array]) {
	if (array === undefined || array === null) {
		return '';
	}
	const list = toArray(array);
	return Array.from(list).join(separator);
}

export default helper(join);
