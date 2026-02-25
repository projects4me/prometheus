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

	/**
	 * Returns a date range based on the given context.
	 *
	 * @method getRangeByContext
	 * @static
	 * @param {string} context - One of:
	 *  'today' | 'thisWeek' | 'thisMonth' | 'lastMonth' | 'last3Months' | 'thisYear'
	 * @returns {Object} An object with `startDate` and `endDate`
	 * @public
	 *
	 * @example
	 * DateUtils.getRangeByContext('today');
	 * DateUtils.getRangeByContext('thisWeek');
	 */
	static getRangeByContext(context) {
		const now = moment().utc();

		let start;
		let end;

		switch (context) {
			case 'today':
				start = now.clone().startOf('day');
				end = now.clone().endOf('day');
				break;

			case 'thisWeek':
				start = now.clone().startOf('isoWeek');
				end = now.clone().endOf('isoWeek');
				break;

			case 'thisMonth':
				start = now.clone().startOf('month');
				end = now.clone().endOf('month');
				break;

			case 'lastMonth':
				start = now.clone().subtract(1, 'month').startOf('month');
				end = now.clone().subtract(1, 'month').endOf('month');
				break;

			case 'last3Months':
				start = now.clone().subtract(2, 'months').startOf('month');
				end = now.clone().endOf('month');
				break;

			case 'thisYear':
				start = now.clone().startOf('year');
				end = now.clone().endOf('year');
				break;

			default:
				start = now.clone().startOf('day');
				end = now.clone().endOf('day');
		}

		return {
			startDate: start.format('YYYY-MM-DD HH:mm:ss.0'),
			endDate: end.format('YYYY-MM-DD HH:mm:ss.0')
		};
	}	
}
