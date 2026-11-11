/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { helper } from '@ember/component/helper';
import moment from 'moment';

/** {{moment-format date 'format'}}: formats a date with moment; '-' for empty values. */
export function momentFormat([value, format]) {
	if (value === undefined || value === null || value === '') {
		return '-';
	}
	return moment(value).format(format);
}

export default helper(momentFormat);
