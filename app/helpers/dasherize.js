/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { helper } from '@ember/component/helper';
import { dasherize as dasherizeString } from '@ember/string';

/** {{dasherize value}} */
export function dasherize([value]) {
	return dasherizeString(String(value ?? ''));
}

export default helper(dasherize);
