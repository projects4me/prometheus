/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { helper } from '@ember/component/helper';

/** {{call fn arg1 arg2}}: calls fn with the arguments and renders the result. */
export function call([fn, ...args]) {
	if (typeof fn !== 'function') {
		return undefined;
	}
	return fn(...args);
}

export default helper(call);
