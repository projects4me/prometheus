/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { helper } from '@ember/component/helper';

/** Sums any number of numbers (arrays are flattened), like ember-math-helpers. */
export function add(params) {
	return params.flat(Infinity).reduce((total, n) => total + Number(n), 0);
}

export default helper(add);
