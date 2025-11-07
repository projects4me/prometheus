/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

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
	 * The default format for the date.
	 *
	 * @property format
	 * @type string
	 * @for FormatDateHelper
	 */
	format = "DD MMM 'YY";

	/**
	 * Computes the formatted date string
	 *
	 * @param {Array} _positional - Unused positional parameters.
	 * @param {Object} options - The options object.
	 * @param {string|Date} options.date - The date to format.
	 * @param {string} [options.format] - The format string to use (follows Moment.js format).
	 * @returns {string} The formatted date string or empty string if date is undefined.
	 */
	compute([], { date, format }) {
		let formattedDate = '';
		format = format || this.format; // prefer the format passed in, otherwise use the default
		let momentDate;

		if (date !== undefined) {
			momentDate = moment(date);
			formattedDate = momentDate.format(format);
		}

		return formattedDate;
	}
}
