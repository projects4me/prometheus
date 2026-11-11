/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { helper } from '@ember/component/helper';

/** {{keys object}}: the object's own keys. */
export function keys([object]) {
	return object ? Object.keys(object) : [];
}

export default helper(keys);
