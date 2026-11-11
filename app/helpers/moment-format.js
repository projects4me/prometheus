/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { helper } from '@ember/component/helper';
import { format } from 'prometheus/utils/date';

/** {{moment-format date 'format'}}: formats a date with moment; '-' for empty values. */
export function momentFormat([value, pattern]) {
	if (value === undefined || value === null || value === '') {
		return '-';
	}
	return format(value, pattern);
}

export default helper(momentFormat);
