/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { helper } from '@ember/component/helper';

/** {{queue fn1 fn2}}: a function running each in order, awaiting any promise. */
export function queue(fns) {
	return async function (...args) {
		let result;
		for (const fn of fns) {
			if (typeof fn === 'function') {
				result = await fn(...args);
			}
		}
		return result;
	};
}

export default helper(queue);
