/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { helper } from '@ember/component/helper';

/** {{inc number}} or {{inc step number}}: adds the step (default 1). */
export function inc(params) {
	const [step, value] = params.length > 1 ? params : [1, params[0]];
	return Number(value) + Number(step);
}

export default helper(inc);
