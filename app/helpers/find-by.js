/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { helper } from '@ember/component/helper';
import { get } from '@ember/object';

/** {{find-by 'path' value array}}: first item whose path equals value; works on plain arrays, record arrays and proxies. */
export function findBy([path, value, array]) {
	if (!array) {
		return undefined;
	}
	const list = typeof array.toArray === 'function' ? array.toArray() : Array.from(array);
	return list.find((item) => get(item, path) === value);
}

export default helper(findBy);
