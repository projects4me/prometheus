/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { helper } from '@ember/component/helper';

/** Multiplies any number of numbers together. */
export function mult(params) {
	return params.flat(Infinity).reduce((total, n) => total * Number(n), 1);
}

export default helper(mult);
