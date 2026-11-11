/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { helper } from '@ember/component/helper';

/** {{lowercase value}} */
export function lowercase([value]) {
	return String(value ?? '').toLowerCase();
}

export default helper(lowercase);
