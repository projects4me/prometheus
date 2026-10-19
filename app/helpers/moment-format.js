/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import MomentFormatHelper from 'ember-moment/helpers/moment-format';

/**
 * Overrides the ember-moment `moment-format` helper so an empty date renders
 * as '-' instead of 'Invalid date'.
 *
 * @class MomentFormatHelper
 * @namespace Prometheus.Helpers
 * @extends MomentFormatHelper
 */
export default MomentFormatHelper.extend({
	/**
	 * The text shown in place of an empty date.
	 *
	 * @property emptyValue
	 * @type string
	 * @for MomentFormatHelper
	 */
	emptyValue: '-',

	compute(params, hash) {
		const [value] = params;

		if (value === undefined || value === null || value === '') {
			return this.emptyValue;
		}

		return this._super(params, hash);
	},
});
