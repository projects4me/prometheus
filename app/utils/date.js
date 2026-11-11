/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/**
 * The single place in the app that talks to moment / moment-timezone. Every other file works with the
 * functions below and with plain `Date` objects, strings and numbers, so the implementation can be
 * swapped without touching callers.
 *
 * Conventions:
 *  - Inputs may be a `Date`, a timestamp, or a string. Date-only strings (`YYYY-MM-DD`) are local calendar
 *    dates. Gaia timestamps (`YYYY-MM-DD HH:mm:ss`) are UTC: pass `{ zone: 'UTC' }` (or use `parseGaia`).
 *  - Every function takes an optional `{ zone }` (IANA name). Without it the machine's zone is used, so
 *    code that must not depend on the machine passes the zone explicitly.
 *  - Functions that produce a date return a `Date`; `format` and `toISOString` return strings.
 *
 * @module Utils.Date
 */

const UTC = 'UTC';

function toMoment(input, zone) {
	if (zone) {
		return input === undefined ? moment.tz(zone) : moment.tz(input, zone);
	}
	return moment(input);
}

/**
 * Current instant.
 *
 * @function now
 * @returns {Date}
 */
export function now() {
	return moment().toDate();
}

/**
 * Parses a value into a `Date` (an invalid `Date` for bad input). Strings are read in `zone`.
 *
 * @function parse
 * @param {Date|number|string} input
 * @param {Object} [options] `{ zone }`
 * @returns {Date}
 */
export function parse(input, { zone } = {}) {
	return toMoment(input, zone).toDate();
}

/**
 * Parses a Gaia timestamp (`YYYY-MM-DD HH:mm:ss`), which is UTC.
 *
 * @function parseGaia
 * @param {string} input
 * @returns {Date}
 */
export function parseGaia(input) {
	return parse(input, { zone: UTC });
}

/**
 * @function isValid
 * @param {Date|number|string} input
 * @param {Object} [options] `{ zone }`
 * @returns {boolean}
 */
export function isValid(input, { zone } = {}) {
	return toMoment(input, zone).isValid();
}

/**
 * Formats a date with the tokens in use in the app (`YYYY-MM-DD`, `YYYY-MM-DD HH:mm:ss`, `MMM DD, YYYY`,
 * `Do MMM. YYYY`, `ddd`, `HH:mm`, `Z`, ...).
 *
 * @function format
 * @param {Date|number|string} input
 * @param {string} [pattern] Defaults to ISO 8601.
 * @param {Object} [options] `{ zone }`: the zone to show the date in; also used to read string input.
 * @returns {string}
 */
export function format(input, pattern, { zone } = {}) {
	return toMoment(input, zone).format(pattern);
}

/**
 * Shows an instant in a user's timezone.
 *
 * @function toUserTimezone
 * @param {Date|number|string} input A Date, timestamp or UTC string
 * @param {string} zone IANA zone name
 * @param {string} [pattern='YYYY-MM-DD HH:mm:ss']
 * @returns {string}
 */
export function toUserTimezone(input, zone, pattern = 'YYYY-MM-DD HH:mm:ss') {
	return moment.utc(input).tz(zone).format(pattern);
}

/**
 * @function toISOString
 * @param {Date|number|string} input
 * @param {Object} [options] `{ zone }`
 * @returns {string}
 */
export function toISOString(input, { zone } = {}) {
	return toMoment(input, zone).toISOString();
}

/**
 * Adds an amount of `unit` ('days', 'weeks', 'months', ...). Month arithmetic clamps to month end.
 *
 * @function add
 * @param {Date|number|string} input
 * @param {number} amount
 * @param {string} unit
 * @param {Object} [options] `{ zone }`
 * @returns {Date}
 */
export function add(input, amount, unit, { zone } = {}) {
	return toMoment(input, zone).add(amount, unit).toDate();
}

/**
 * @function subtract
 * @param {Date|number|string} input
 * @param {number} amount
 * @param {string} unit
 * @param {Object} [options] `{ zone }`
 * @returns {Date}
 */
export function subtract(input, amount, unit, { zone } = {}) {
	return toMoment(input, zone).subtract(amount, unit).toDate();
}

/**
 * @function startOf
 * @param {Date|number|string} input
 * @param {string} unit 'day', 'week', 'isoWeek', 'month' or 'year'
 * @param {Object} [options] `{ zone }`
 * @returns {Date}
 */
export function startOf(input, unit, { zone } = {}) {
	return toMoment(input, zone).startOf(unit).toDate();
}

/**
 * @function endOf
 * @param {Date|number|string} input
 * @param {string} unit 'day', 'week', 'isoWeek', 'month' or 'year'
 * @param {Object} [options] `{ zone }`
 * @returns {Date}
 */
export function endOf(input, unit, { zone } = {}) {
	return toMoment(input, zone).endOf(unit).toDate();
}

/**
 * @function isBefore
 * @param {Date|number|string} a
 * @param {Date|number|string} b
 * @param {Object} [options] `{ unit, zone }`
 * @returns {boolean}
 */
export function isBefore(a, b, { unit, zone } = {}) {
	return toMoment(a, zone).isBefore(toMoment(b, zone), unit);
}

/**
 * @function isAfter
 * @param {Date|number|string} a
 * @param {Date|number|string} b
 * @param {Object} [options] `{ unit, zone }`
 * @returns {boolean}
 */
export function isAfter(a, b, { unit, zone } = {}) {
	return toMoment(a, zone).isAfter(toMoment(b, zone), unit);
}

/**
 * @function isSame
 * @param {Date|number|string} a
 * @param {Date|number|string} b
 * @param {Object} [options] `{ unit, zone }`
 * @returns {boolean}
 */
export function isSame(a, b, { unit, zone } = {}) {
	return toMoment(a, zone).isSame(toMoment(b, zone), unit);
}

/**
 * @function isSameOrBefore
 * @param {Date|number|string} a
 * @param {Date|number|string} b
 * @param {Object} [options] `{ unit, zone }`
 * @returns {boolean}
 */
export function isSameOrBefore(a, b, { unit, zone } = {}) {
	return toMoment(a, zone).isSameOrBefore(toMoment(b, zone), unit);
}

/**
 * @function isSameOrAfter
 * @param {Date|number|string} a
 * @param {Date|number|string} b
 * @param {Object} [options] `{ unit, zone }`
 * @returns {boolean}
 */
export function isSameOrAfter(a, b, { unit, zone } = {}) {
	return toMoment(a, zone).isSameOrAfter(toMoment(b, zone), unit);
}

/**
 * `a - b` in whole `unit`s (truncated towards zero), milliseconds by default.
 *
 * @function diff
 * @param {Date|number|string} a
 * @param {Date|number|string} b
 * @param {string} [unit]
 * @param {Object} [options] `{ zone }`
 * @returns {number}
 */
export function diff(a, b, unit, { zone } = {}) {
	return toMoment(a, zone).diff(toMoment(b, zone), unit);
}

/**
 * A calendar part of a date: 'year', 'month' (0-11), 'date' (1-31) or 'day' (0 = Sunday).
 *
 * @function part
 * @param {Date|number|string} input
 * @param {string} unit
 * @param {Object} [options] `{ zone }`
 * @returns {number}
 */
export function part(input, unit, { zone } = {}) {
	return toMoment(input, zone).get(unit);
}

/**
 * Relative time such as "3 hours ago".
 *
 * @function fromNow
 * @param {Date|number|string} input
 * @param {Object} [options] `{ zone }`
 * @returns {string}
 */
export function fromNow(input, { zone } = {}) {
	return toMoment(input, zone).fromNow();
}

/**
 * Humanizes a duration, e.g. `humanizeDuration(90, 'minutes')` is "2 hours".
 *
 * @function humanizeDuration
 * @param {number} amount
 * @param {string} [unit='milliseconds']
 * @returns {string}
 */
export function humanizeDuration(amount, unit = 'milliseconds') {
	return moment.duration(amount, unit).humanize();
}

/**
 * Splits a duration into whole hours and the remaining minutes.
 *
 * @function durationParts
 * @param {number} minutes
 * @returns {{hours: number, minutes: number}}
 */
export function durationParts(minutes) {
	const duration = moment.duration(minutes, 'minutes');
	return { hours: Math.floor(duration.asHours()), minutes: duration.minutes() };
}

/**
 * The machine's IANA timezone.
 *
 * @function guessTimezone
 * @returns {string}
 */
export function guessTimezone() {
	return moment.tz.guess(true);
}

/**
 * Offset (minutes), `+HH:mm` offset text and abbreviation of one zone, right now.
 *
 * @function timezoneInfo
 * @param {string} name IANA zone name
 * @returns {{name: string, offset: number, offsetText: string, abbr: string}}
 */
export function timezoneInfo(name) {
	const zone = moment.tz(name);
	return { name, offset: zone.utcOffset(), offsetText: zone.format('Z'), abbr: zone.zoneAbbr() };
}

/**
 * Every known zone with its offset and abbreviation (see `timezoneInfo`).
 *
 * @function timezoneList
 * @returns {Array<{name: string, offset: number, offsetText: string, abbr: string}>}
 */
export function timezoneList() {
	return moment.tz.names().map((name) => timezoneInfo(name));
}

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
		const startOfWeek = subtract(startOf(now(), 'isoWeek'), weekOffset, 'weeks');
		const endOfWeek = subtract(endOf(now(), 'isoWeek'), weekOffset, 'weeks');
		return {
			startOfWeek: format(startOfWeek, 'YYYY-MM-DD HH:mm:ss.0'),
			endOfWeek: format(endOfWeek, 'YYYY-MM-DD HH:mm:ss.0')
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
		return durationParts(mins);
	}

	/**
	 * Returns the current date and time in 'YYYY-MM-DD HH:mm:ss' format (UTC).
	 *
	 * @method getNow
	 * @static
	 * @returns {string} The current date and time in 'YYYY-MM-DD HH:mm:ss' format.
	 * @public
	 */
	static getNow() {
		return format(now(), 'YYYY-MM-DD HH:mm:ss', { zone: UTC });
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
		const zone = { zone: UTC };
		const current = now();
		const lastMonth = subtract(current, 1, 'month', zone);
		const threeMonthsAgo = subtract(current, 2, 'months', zone);
		const ranges = {
			today: [startOf(current, 'day', zone), endOf(current, 'day', zone)],
			thisWeek: [startOf(current, 'isoWeek', zone), endOf(current, 'isoWeek', zone)],
			thisMonth: [startOf(current, 'month', zone), endOf(current, 'month', zone)],
			lastMonth: [startOf(lastMonth, 'month', zone), endOf(lastMonth, 'month', zone)],
			last3Months: [startOf(threeMonthsAgo, 'month', zone), endOf(current, 'month', zone)],
			thisYear: [startOf(current, 'year', zone), endOf(current, 'year', zone)]
		};
		const [start, end] = ranges[context] || ranges.today;

		return {
			startDate: format(start, 'YYYY-MM-DD HH:mm:ss.0', zone),
			endDate: format(end, 'YYYY-MM-DD HH:mm:ss.0', zone)
		};
	}
}
