/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { inject as service } from '@ember/service';
import Helper from '@ember/component/helper';

/**
 * Formats a date string according to the specified format.
 *
 * @class FormatDateHelper
 * @namespace Prometheus.Helpers
 * @extends Helper
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default class FormatDateHelper extends Helper {
	/**
	 * The current authenticated user of the application.
	 *
	 * @property currentUser
	 * @type Ember.Service
	 * @for FormatDateHelper
	 */
	@service currentUser;

	/**
	 * Computes the formatted date string
	 *
	 * @param {Array} _positional - Unused positional parameters.
	 * @param {Object} options - The options object.
	 * @param {string|Date} options.date - The date to format.
	 * @param {string} [options.format="DD MMM 'YY"] - The format string to use (follows Moment.js format).
	 * @param {boolean} [options.localTime=false] - If true, converts UTC date to local timezone before formatting.
	 * @returns {string} The formatted date string or empty string if date is undefined.
	 */
	compute([], { date, format = "DD MMM 'YY", localTime = false }) {
		let formattedDate = '';
		let userTimezone = this.currentUser.user.timezone;

		if (date !== undefined) {
			formattedDate = moment(date).format(format);
			if (localTime) {
				formattedDate = moment
					.utc(date)
					.tz(userTimezone)
					.format(format);
			}
		}

		return formattedDate;
	}
}
