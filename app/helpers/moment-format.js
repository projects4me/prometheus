/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import MomentFormatHelper from 'ember-moment/helpers/moment-format';
import { EMPTY_VALUE } from 'prometheus/helpers/format-date';

/**
 * Overrides the ember-moment `moment-format` helper so an empty date renders
 * as '-' instead of 'Invalid date'.
 *
 * @class MomentFormatHelper
 * @namespace Prometheus.Helpers
 * @extends MomentFormatHelper
 */
export default MomentFormatHelper.extend({
	compute(params, hash) {
		const [value] = params;

		if (value === undefined || value === null || value === '') {
			return EMPTY_VALUE;
		}

		return this._super(params, hash);
	},
});
