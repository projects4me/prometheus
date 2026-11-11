/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { helper } from '@ember/component/helper';
import { fromNow } from 'prometheus/utils/date';

/** {{date-from-now date}}: relative time such as '3 hours ago'; '-' when empty. */
export function dateFromNow([value]) {
	if (value === undefined || value === null || value === '') {
		return '-';
	}
	return fromNow(value);
}

export default helper(dateFromNow);
