/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { helper } from '@ember/component/helper';
import { format } from 'prometheus/utils/date';

/** {{date-format date 'format'}}: formats a date with utils/date; '-' for empty values. */
export function dateFormat([value, pattern]) {
	if (value === undefined || value === null || value === '') {
		return '-';
	}
	return format(value, pattern);
}

export default helper(dateFormat);
