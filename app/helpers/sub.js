/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { helper } from '@ember/component/helper';

/** Subtracts the following numbers from the first one. */
export function sub(params) {
	const [first = 0, ...rest] = params.flat(Infinity).map(Number);
	return rest.reduce((total, n) => total - n, first);
}

export default helper(sub);
