/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { helper } from '@ember/component/helper';

/** {{noop}}: a function that does nothing. */
export function noop() {
	return () => {};
}

export default helper(noop);
