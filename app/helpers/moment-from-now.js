/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { helper } from '@ember/component/helper';
import moment from 'moment';

/** {{moment-from-now date}}: relative time such as '3 hours ago'; '-' when empty. */
export function momentFromNow([value]) {
	if (value === undefined || value === null || value === '') {
		return '-';
	}
	return moment(value).fromNow();
}

export default helper(momentFromNow);
