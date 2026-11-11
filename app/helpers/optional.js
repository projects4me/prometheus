/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { helper } from '@ember/component/helper';

/** {{optional fn}}: the function, or a no-op when it is not one. */
export function optional([fn]) {
	return typeof fn === 'function' ? fn : () => {};
}

export default helper(optional);
