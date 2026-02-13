/**
 * Utility class for date-related operations.
 * Provides static methods for calculating week ranges and formatting dates.
 *
 * @class DateUtils
 * @namespace Prometheus.Utils
 * @module Utils.Date
 * @author Rana Nouman <ranamnouman@gmail.com>
 *
 * @example
 * const { startOfWeek, endOfWeek } = DateUtils.getWeekRangeForPage(1);
 * const { startOfWeek, endOfWeek } = DateUtils.getWeekRangeForPage(2);
 */
export default class DateUtils {
	/**
	 * Returns the start and end date/time for the ISO week corresponding to the given page number.
	 * Page 1 = current week, Page 2 = previous week, etc.
	 *
	 * @method getWeekRangeForPage
	 * @static
	 * @param {number} page - The week index (1 = current week, 2 = previous week, etc.)
	 * @returns {Object} An object with `startOfWeek` and `endOfWeek` in 'YYYY-MM-DD HH:mm:ss.0' format.
	 * @public
	 */
	static getWeekRangeForPage(page) {
		const weekOffset = page - 1;
		const startOfWeek = moment()
			.startOf('isoWeek')
			.subtract(weekOffset, 'weeks');
		const endOfWeek = moment()
			.endOf('isoWeek')
			.subtract(weekOffset, 'weeks');
		return {
			startOfWeek: startOfWeek.format('YYYY-MM-DD HH:mm:ss.0'),
			endOfWeek: endOfWeek.format('YYYY-MM-DD HH:mm:ss.0')
		};
	}

	/**
	 * Converts a float value representing hours into an object containing hours and minutes.
	 *
	 * @method getHoursAndMinutes
	 * @static
	 * @param {number} floatHours - The number of hours as a float (e.g., 2.5)
	 * @returns {Object} An object with `hours` and `minutes` properties
	 * @public
	 * @example
	 *   DateUtils.getHoursAndMinutes(2.75); // { hours: 2, minutes: 45 }
	 */
	static getHoursAndMinutes(floatHours) {
		if (typeof floatHours !== 'number' || isNaN(floatHours)) {
			return { hours: 0, minutes: 0 };
		}
		const hours = Math.floor(floatHours);
		const minutes = Math.round((floatHours - hours) * 60);
		return { hours, minutes };
	}

	/**
	 * Normalizes minutes to hours and minutes.
	 *
	 * @method normalizeMinutes
	 * @static
	 * @param {number} mins - The number of minutes to normalize
	 * @returns {Object} An object with `hours` and `minutes` properties
	 * @public
	 * @example
	 *   DateUtils.normalizeMinutes(135); // { hours: 2, minutes: 15 }
	 *   DateUtils.normalizeMinutes(1000); // { hours: 16, minutes: 40 }
	 */
	static normalizeMinutes(mins) {
		const duration = moment.duration(mins, "minutes");
		const hours = Math.floor(duration.asHours());
		const minutes = duration.minutes();
		return { hours, minutes };
	}

	/**
	 * Returns the current date and time in 'YYYY-MM-DD HH:mm:ss.0' format.
	 *
	 * @method getNow
	 * @static
	 * @returns {string} The current date and time in 'YYYY-MM-DD HH:mm:ss.0' format.
	 * @public
	 */
	static getNow() {
		return moment().utc().format('YYYY-MM-DD HH:mm:ss');
	}
}
