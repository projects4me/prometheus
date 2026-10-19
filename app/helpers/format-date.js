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
	 * The text shown in place of an empty date.
	 *
	 * @property emptyValue
	 * @type string
	 * @for FormatDateHelper
	 */
	emptyValue = '-';

	/**
	 * Computes the formatted date string
	 *
	 * @param {Array} _positional - Unused positional parameters.
	 * @param {Object} options - The options object.
	 * @param {string|Date} options.date - The date to format.
	 * @param {string} [options.format] - The format string to use (follows Moment.js format).
	 * @returns {string} The formatted date string or '-' if the date is empty.
	 */
	compute([], { date, format }) {
		format = format || this.format; // prefer the format passed in, otherwise use the default

		if (date === undefined || date === null || date === '') {
			return this.emptyValue;
		}

		return moment(date).format(format);
	}
}
