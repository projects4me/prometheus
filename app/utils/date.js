/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import window from 'ember-window-mock';
import TIMEZONE_NAMES from 'prometheus/utils/timezone-names';

/**
 * The single place in the app that works out dates, on the browser's own `Date` and `Intl` (no date
 * library). Every other file works with the functions below and with plain `Date` objects, strings and
 * numbers.
 *
 * Conventions:
 *  - Inputs may be a `Date`, a timestamp, or a string. Strings are read by a strict parser for
 *    `YYYY-MM-DD` and `YYYY-MM-DD[T ]HH:mm[:ss[.SSS]]`, with an optional `Z` or `±HH:mm` offset; never with
 *    `new Date(string)`, which reads date-only strings as UTC. Without an offset a string is a wall-clock
 *    time in the zone: date-only strings are calendar dates, Gaia timestamps (`YYYY-MM-DD HH:mm:ss`) are
 *    UTC, so pass `{ zone: 'UTC' }` (or use `parseGaia`).
 *  - Every function takes an optional `{ zone }` (IANA name). Without it the machine's zone is used, so
 *    code that must not depend on the machine passes the zone explicitly. An unknown zone reads as UTC.
 *  - Functions that produce a date return a `Date`; `format` and `toISOString` return strings.
 *  - Timezone conversion goes through `Intl.DateTimeFormat#formatToParts`; month and day names, relative
 *    times and durations come from `Intl` in the locale set with `setLocale` (the app's language).
 *
 * @module Utils.Date
 */

const UTC = 'UTC';
const INVALID_DATE = 'Invalid date';
const DEFAULT_PATTERN = 'YYYY-MM-DDTHH:mm:ssZ';
const DEFAULT_LOCALE = 'en-US';
const MS = { millisecond: 1, second: 1e3, minute: 6e4, hour: 36e5, day: 864e5, week: 6048e5 };
const DAYS_PER_MONTH = 146097 / 4800;
const DAYS_PER_YEAR = 146097 / 400;

const UNITS = {
	y: 'year', year: 'year', years: 'year',
	Q: 'quarter', quarter: 'quarter', quarters: 'quarter',
	M: 'month', month: 'month', months: 'month',
	w: 'week', week: 'week', weeks: 'week',
	W: 'isoWeek', isoweek: 'isoWeek', isoweeks: 'isoWeek',
	d: 'day', day: 'day', days: 'day',
	D: 'date', date: 'date', dates: 'date',
	h: 'hour', hour: 'hour', hours: 'hour',
	m: 'minute', minute: 'minute', minutes: 'minute',
	s: 'second', second: 'second', seconds: 'second',
	ms: 'millisecond', millisecond: 'millisecond', milliseconds: 'millisecond',
	E: 'isoWeekday', isoweekday: 'isoWeekday', isoweekdays: 'isoWeekday',
	GG: 'isoWeekYear', isoweekyear: 'isoWeekYear', isoweekyears: 'isoWeekYear'
};

const PART_FIELDS = { year: 'year', month: 'month', day: 'date', hour: 'hour', minute: 'minute', second: 'second' };

const ISO_STRING =
	/^(\d{4})-(\d\d)-(\d\d)(?:[T ](\d\d):(\d\d)(?::(\d\d)(?:[.,](\d+))?)?)?\s*(Z|[+-]\d\d(?::?\d\d)?)?$/i;

const FORMAT_TOKENS =
	/\[([^\]]*)\]|YYYY|YY|Q|MMMM|MMM|MM|Mo|M|Do|DD|D|dddd|ddd|dd|d|E|GGGG|WW|W|HH|H|hh|h|kk|k|mm|m|ss|s|SSS|SS|S|A|a|ZZ|Z|zz|z|X|x/g;

let locale = DEFAULT_LOCALE;
let localeNames = null;
const partFormatters = new Map();
const nameFormatters = new Map();
const zoneValidity = new Map();

/* --- zones ------------------------------------------------------------------------------------- */

function partFormatter(zone) {
	let formatter = partFormatters.get(zone);
	if (!formatter) {
		formatter = new Intl.DateTimeFormat('en-US', {
			timeZone: zone,
			hourCycle: 'h23',
			year: 'numeric',
			month: 'numeric',
			day: 'numeric',
			hour: 'numeric',
			minute: 'numeric',
			second: 'numeric'
		});
		partFormatters.set(zone, formatter);
	}
	return formatter;
}

function isKnownZone(zone) {
	if (!zoneValidity.has(zone)) {
		try {
			partFormatter(zone);
			zoneValidity.set(zone, true);
		} catch (e) {
			zoneValidity.set(zone, false);
		}
	}
	return zoneValidity.get(zone);
}

/** `undefined` for the machine's zone, the zone itself when Intl knows it, otherwise UTC. */
function resolveZone(zone) {
	if (!zone) {
		return undefined;
	}
	return isKnownZone(zone) ? zone : UTC;
}

/** The wall-clock fields of an instant in a zone (month 0-11). */
function wall(time, zone) {
	const d = new Date(time);
	if (!zone) {
		return {
			year: d.getFullYear(), month: d.getMonth(), date: d.getDate(),
			hour: d.getHours(), minute: d.getMinutes(), second: d.getSeconds(), millisecond: d.getMilliseconds()
		};
	}
	if (zone === UTC) {
		return {
			year: d.getUTCFullYear(), month: d.getUTCMonth(), date: d.getUTCDate(),
			hour: d.getUTCHours(), minute: d.getUTCMinutes(), second: d.getUTCSeconds(), millisecond: d.getUTCMilliseconds()
		};
	}
	const fields = { millisecond: d.getUTCMilliseconds() };
	for (const { type, value } of partFormatter(zone).formatToParts(d)) {
		if (PART_FIELDS[type]) {
			fields[PART_FIELDS[type]] = Number(value);
		}
	}
	fields.month -= 1;
	if (fields.hour === 24) {
		fields.hour = 0;
	}
	return fields;
}

function wallAsUTC(w) {
	return Date.UTC(w.year, w.month, w.date, w.hour, w.minute, w.second, w.millisecond);
}

/** The zone's offset from UTC at an instant, in minutes (east is positive). */
function offsetAt(time, zone) {
	if (!zone) {
		return -new Date(time).getTimezoneOffset();
	}
	if (zone === UTC) {
		return 0;
	}
	return Math.round((wallAsUTC(wall(time, zone)) - time) / MS.minute);
}

/**
 * The instant of wall-clock fields in a zone. Fields may overflow (day 32 is the next month's 1st). A time
 * skipped by a DST change moves forward; a repeated time takes the earlier instant.
 */
function fromWall(w, zone) {
	if (!zone) {
		return new Date(w.year, w.month, w.date, w.hour, w.minute, w.second, w.millisecond).getTime();
	}
	const local = wallAsUTC(w);
	if (zone === UTC) {
		return local;
	}
	const first = local - offsetAt(local, zone) * MS.minute;
	const second = local - offsetAt(first, zone) * MS.minute;
	if (first === second) {
		return first;
	}
	const matching = [first, second].filter((time) => time + offsetAt(time, zone) * MS.minute === local);
	return matching.length ? Math.min(...matching) : Math.max(first, second);
}

/* --- parsing ----------------------------------------------------------------------------------- */

function daysInMonth(year, month) {
	return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

function parseOffset(text) {
	if (text.toUpperCase() === 'Z') {
		return 0;
	}
	const digits = text.slice(1).replace(':', '');
	const minutes = Number(digits.slice(0, 2)) * 60 + Number(digits.slice(2, 4) || 0);
	return text[0] === '-' ? -minutes : minutes;
}

function parseString(text, zone) {
	const trimmed = text.trim();
	const match = ISO_STRING.exec(trimmed);
	if (!match) {
		// Other formats (none of them Gaia's) keep moment's fallback to the browser's parser.
		return trimmed === '' ? NaN : Date.parse(trimmed);
	}
	const [, year, month, date, hour = '0', minute = '0', second = '0', fraction = '0', offset] = match;
	const w = {
		year: Number(year),
		month: Number(month) - 1,
		date: Number(date),
		hour: Number(hour),
		minute: Number(minute),
		second: Number(second),
		millisecond: Number(fraction.padEnd(3, '0').slice(0, 3))
	};
	const endOfDay = w.hour === 24 && w.minute === 0 && w.second === 0 && w.millisecond === 0;
	const valid =
		w.month >= 0 && w.month <= 11 &&
		w.date >= 1 && w.date <= daysInMonth(w.year, w.month) &&
		(w.hour <= 23 || endOfDay) && w.minute <= 59 && w.second <= 59;
	if (!valid) {
		return NaN;
	}
	return offset ? wallAsUTC(w) - parseOffset(offset) * MS.minute : fromWall(w, zone);
}

/** A value as a timestamp (NaN when invalid); string input is read in `zone`. */
function toTime(input, zone) {
	if (input === undefined) {
		return Date.now();
	}
	if (input instanceof Date) {
		return input.getTime();
	}
	if (typeof input === 'number') {
		return input;
	}
	if (typeof input === 'string') {
		return parseString(input, zone);
	}
	return NaN;
}

/* --- calendar helpers -------------------------------------------------------------------------- */

function normalizeUnit(unit) {
	if (!unit) {
		return undefined;
	}
	return UNITS[unit] || UNITS[String(unit).toLowerCase()];
}

/** 0 = Sunday. */
function weekdayOf(w) {
	return new Date(Date.UTC(w.year, w.month, w.date)).getUTCDay();
}

function isoWeekOf(w) {
	const day = Date.UTC(w.year, w.month, w.date);
	const mondayBased = (weekdayOf(w) + 6) % 7;
	const thursday = new Date(day + (3 - mondayBased) * MS.day);
	const year = thursday.getUTCFullYear();
	return { year, week: 1 + Math.floor((thursday.getTime() - Date.UTC(year, 0, 1)) / MS.week) };
}

function absRound(value) {
	return Math.sign(value) * Math.round(Math.abs(value));
}

function shift(time, amount, unit, zone) {
	if (Number.isNaN(time)) {
		return NaN;
	}
	const name = normalizeUnit(unit) || 'millisecond';
	if (['millisecond', 'second', 'minute', 'hour'].includes(name)) {
		return time + amount * MS[name];
	}
	const steps = absRound(amount);
	const w = wall(time, zone);
	if (name === 'day' || name === 'date') {
		w.date += steps;
	} else if (name === 'week' || name === 'isoWeek') {
		w.date += 7 * steps;
	} else {
		const months = { month: 1, quarter: 3, year: 12 }[name];
		if (!months) {
			return time;
		}
		const target = w.month + months * steps;
		w.year += Math.floor(target / 12);
		w.month = ((target % 12) + 12) % 12;
		w.date = Math.min(w.date, daysInMonth(w.year, w.month));
	}
	return fromWall(w, zone);
}

function startTime(time, unit, zone) {
	const name = normalizeUnit(unit);
	if (Number.isNaN(time) || !name || name === 'millisecond') {
		return time;
	}
	if (['second', 'minute', 'hour'].includes(name)) {
		const size = MS[name];
		const local = time + offsetAt(time, zone) * MS.minute;
		return time - (((local % size) + size) % size);
	}
	const w = wall(time, zone);
	const midnight = { hour: 0, minute: 0, second: 0, millisecond: 0 };
	switch (name) {
		case 'year':
			Object.assign(w, { month: 0, date: 1 }, midnight);
			break;
		case 'quarter':
			Object.assign(w, { month: w.month - (w.month % 3), date: 1 }, midnight);
			break;
		case 'month':
			Object.assign(w, { date: 1 }, midnight);
			break;
		case 'week':
			Object.assign(w, { date: w.date - weekdayOf(w) }, midnight);
			break;
		case 'isoWeek':
			Object.assign(w, { date: w.date - ((weekdayOf(w) + 6) % 7) }, midnight);
			break;
		case 'day':
		case 'date':
			Object.assign(w, midnight);
			break;
		default:
			return time;
	}
	return fromWall(w, zone);
}

function endTime(time, unit, zone) {
	const name = normalizeUnit(unit);
	if (Number.isNaN(time) || !name || name === 'millisecond') {
		return time;
	}
	const step = { isoWeek: 'week', date: 'day' }[name] || name;
	return shift(startTime(time, name, zone), 1, step, zone) - 1;
}

/** moment's month difference: whole months plus the fraction of the month around `b`. */
function monthDiff(a, b, zone) {
	const wa = wall(a, zone);
	const wb = wall(b, zone);
	if (wa.date < wb.date) {
		return -monthDiff(b, a, zone);
	}
	const whole = (wb.year - wa.year) * 12 + (wb.month - wa.month);
	const anchor = shift(a, whole, 'month', zone);
	let adjust;
	if (b - anchor < 0) {
		adjust = (b - anchor) / (anchor - shift(a, whole - 1, 'month', zone));
	} else {
		adjust = (b - anchor) / (shift(a, whole + 1, 'month', zone) - anchor);
	}
	return -(whole + adjust) || 0;
}

/* --- names and formatting ---------------------------------------------------------------------- */

function names() {
	if (!localeNames) {
		const list = (count, toTime, options) => {
			const formatter = new Intl.DateTimeFormat(locale, { timeZone: UTC, ...options });
			return Array.from({ length: count }, (_, i) => formatter.format(toTime(i)));
		};
		const month = (i) => Date.UTC(2021, i, 1);
		const weekday = (i) => Date.UTC(2021, 0, 3 + i); // 2021-01-03 is a Sunday
		localeNames = {
			months: list(12, month, { month: 'long' }),
			monthsShort: list(12, month, { month: 'short' }),
			weekdays: list(7, weekday, { weekday: 'long' }),
			weekdaysShort: list(7, weekday, { weekday: 'short' })
		};
	}
	return localeNames;
}

function pad(value, length = 2) {
	const sign = value < 0 ? '-' : '';
	return sign + String(Math.abs(value)).padStart(length, '0');
}

function ordinal(value) {
	if (!locale.toLowerCase().startsWith('en')) {
		return `${value}.`;
	}
	const tens = value % 100;
	const suffix = tens >= 11 && tens <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][value % 10] || 'th';
	return `${value}${suffix}`;
}

function offsetText(minutes, separator) {
	const sign = minutes < 0 ? '-' : '+';
	const abs = Math.abs(minutes);
	return `${sign}${pad(Math.floor(abs / 60))}${separator}${pad(abs % 60)}`;
}

function abbreviation(time, zone) {
	const key = zone || '';
	let formatter = nameFormatters.get(key);
	if (!formatter) {
		formatter = new Intl.DateTimeFormat(locale, { timeZone: zone, timeZoneName: 'short' });
		nameFormatters.set(key, formatter);
	}
	const part = formatter.formatToParts(time).find(({ type }) => type === 'timeZoneName');
	return part ? part.value : '';
}

function renderToken(token, time, zone, w) {
	const weekday = () => weekdayOf(w);
	const hour12 = w.hour % 12 || 12;
	switch (token) {
		case 'YYYY': return pad(w.year, 4);
		case 'YY': return pad(w.year % 100);
		case 'Q': return String(Math.floor(w.month / 3) + 1);
		case 'MMMM': return names().months[w.month];
		case 'MMM': return names().monthsShort[w.month];
		case 'MM': return pad(w.month + 1);
		case 'Mo': return ordinal(w.month + 1);
		case 'M': return String(w.month + 1);
		case 'Do': return ordinal(w.date);
		case 'DD': return pad(w.date);
		case 'D': return String(w.date);
		case 'dddd': return names().weekdays[weekday()];
		case 'ddd': return names().weekdaysShort[weekday()];
		case 'dd': return names().weekdaysShort[weekday()].slice(0, 2);
		case 'd': return String(weekday());
		case 'E': return String(weekday() || 7);
		case 'GGGG': return pad(isoWeekOf(w).year, 4);
		case 'WW': return pad(isoWeekOf(w).week);
		case 'W': return String(isoWeekOf(w).week);
		case 'HH': return pad(w.hour);
		case 'H': return String(w.hour);
		case 'hh': return pad(hour12);
		case 'h': return String(hour12);
		case 'kk': return pad(w.hour || 24);
		case 'k': return String(w.hour || 24);
		case 'mm': return pad(w.minute);
		case 'm': return String(w.minute);
		case 'ss': return pad(w.second);
		case 's': return String(w.second);
		case 'SSS': return pad(w.millisecond, 3);
		case 'SS': return pad(Math.floor(w.millisecond / 10));
		case 'S': return String(Math.floor(w.millisecond / 100));
		case 'A': return w.hour < 12 ? 'AM' : 'PM';
		case 'a': return w.hour < 12 ? 'am' : 'pm';
		case 'ZZ': return offsetText(offsetAt(time, zone), '');
		case 'Z': return offsetText(offsetAt(time, zone), ':');
		case 'zz':
		case 'z': return abbreviation(time, zone);
		case 'X': return String(Math.floor(time / 1000));
		case 'x': return String(time);
		default: return token;
	}
}

function formatTime(time, pattern, zone) {
	if (Number.isNaN(time)) {
		return INVALID_DATE;
	}
	const w = wall(time, zone);
	return (pattern || DEFAULT_PATTERN).replace(FORMAT_TOKENS, (token, literal) =>
		literal !== undefined ? literal : renderToken(token, time, zone, w)
	);
}

/** moment's rounding thresholds: the unit and whole amount to say a duration in. */
function humanUnit(milliseconds) {
	const abs = Math.abs(milliseconds);
	const days = abs / MS.day;
	const amounts = [
		['second', Math.round(abs / MS.second), 45],
		['minute', Math.round(abs / MS.minute), 45],
		['hour', Math.round(abs / MS.hour), 22],
		['day', Math.round(days), 26],
		['month', Math.round(days / DAYS_PER_MONTH), 11]
	];
	for (const [unit, value, limit] of amounts) {
		if (value < limit) {
			return { unit, value: unit === 'second' ? value : Math.max(value, 1) };
		}
	}
	return { unit: 'year', value: Math.max(Math.round(days / DAYS_PER_YEAR), 1) };
}

/* --- public API -------------------------------------------------------------------------------- */

/**
 * Sets the locale for month and day names, relative times and durations (default `en-US`). An unknown
 * locale keeps the current one.
 *
 * @function setLocale
 * @param {string} value BCP 47 tag, e.g. 'en-us'
 */
export function setLocale(value) {
	const next = value || DEFAULT_LOCALE;
	try {
		new Intl.DateTimeFormat(next);
	} catch (e) {
		return;
	}
	if (next !== locale) {
		locale = next;
		localeNames = null;
		nameFormatters.clear();
	}
}

/**
 * Current instant.
 *
 * @function now
 * @returns {Date}
 */
export function now() {
	return new Date();
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
	return new Date(toTime(input, resolveZone(zone)));
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
	return !Number.isNaN(toTime(input, resolveZone(zone)));
}

/**
 * Formats a date with moment-style tokens (`YYYY-MM-DD`, `YYYY-MM-DD HH:mm:ss`, `MMM DD, YYYY`,
 * `Do MMM. YYYY`, `ddd`, `h:mm a`, `Z`, ...); text in `[brackets]` is literal. 'Invalid date' for bad input.
 *
 * @function format
 * @param {Date|number|string} input
 * @param {string} [pattern] Defaults to ISO 8601.
 * @param {Object} [options] `{ zone }`: the zone to show the date in; also used to read string input.
 * @returns {string}
 */
export function format(input, pattern, { zone } = {}) {
	const name = resolveZone(zone);
	return formatTime(toTime(input, name), pattern, name);
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
	return formatTime(toTime(input, UTC), pattern, resolveZone(zone));
}

/**
 * @function toISOString
 * @param {Date|number|string} input
 * @param {Object} [options] `{ zone }`
 * @returns {string|null} null for invalid input
 */
export function toISOString(input, { zone } = {}) {
	const time = toTime(input, resolveZone(zone));
	return Number.isNaN(time) ? null : new Date(time).toISOString();
}

/**
 * Adds an amount of `unit` ('days', 'weeks', 'months', ...). Day and larger units keep the wall-clock
 * time across DST changes; month arithmetic clamps to month end.
 *
 * @function add
 * @param {Date|number|string} input
 * @param {number} amount
 * @param {string} unit
 * @param {Object} [options] `{ zone }`
 * @returns {Date}
 */
export function add(input, amount, unit, { zone } = {}) {
	const name = resolveZone(zone);
	return new Date(shift(toTime(input, name), amount, unit, name));
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
	return add(input, -amount, unit, { zone });
}

/**
 * @function startOf
 * @param {Date|number|string} input
 * @param {string} unit 'day', 'week' (from Sunday), 'isoWeek' (from Monday), 'month', 'quarter' or 'year'
 * @param {Object} [options] `{ zone }`
 * @returns {Date}
 */
export function startOf(input, unit, { zone } = {}) {
	const name = resolveZone(zone);
	return new Date(startTime(toTime(input, name), unit, name));
}

/**
 * @function endOf
 * @param {Date|number|string} input
 * @param {string} unit 'day', 'week', 'isoWeek', 'month', 'quarter' or 'year'
 * @param {Object} [options] `{ zone }`
 * @returns {Date}
 */
export function endOf(input, unit, { zone } = {}) {
	const name = resolveZone(zone);
	return new Date(endTime(toTime(input, name), unit, name));
}

function compare(a, b, unit, zone, test) {
	const name = resolveZone(zone);
	const x = toTime(a, name);
	const y = toTime(b, name);
	if (Number.isNaN(x) || Number.isNaN(y)) {
		return false;
	}
	const granularity = normalizeUnit(unit);
	if (!granularity || granularity === 'millisecond') {
		return test(x, y, x, x);
	}
	return test(x, y, startTime(x, granularity, name), endTime(x, granularity, name));
}

/**
 * @function isBefore
 * @param {Date|number|string} a
 * @param {Date|number|string} b
 * @param {Object} [options] `{ unit, zone }`
 * @returns {boolean}
 */
export function isBefore(a, b, { unit, zone } = {}) {
	return compare(a, b, unit, zone, (x, y, start, end) => end < y);
}

/**
 * @function isAfter
 * @param {Date|number|string} a
 * @param {Date|number|string} b
 * @param {Object} [options] `{ unit, zone }`
 * @returns {boolean}
 */
export function isAfter(a, b, { unit, zone } = {}) {
	return compare(a, b, unit, zone, (x, y, start) => y < start);
}

/**
 * @function isSame
 * @param {Date|number|string} a
 * @param {Date|number|string} b
 * @param {Object} [options] `{ unit, zone }`
 * @returns {boolean}
 */
export function isSame(a, b, { unit, zone } = {}) {
	return compare(a, b, unit, zone, (x, y, start, end) => start <= y && y <= end);
}

/**
 * @function isSameOrBefore
 * @param {Date|number|string} a
 * @param {Date|number|string} b
 * @param {Object} [options] `{ unit, zone }`
 * @returns {boolean}
 */
export function isSameOrBefore(a, b, { unit, zone } = {}) {
	return compare(a, b, unit, zone, (x, y, start) => y >= start);
}

/**
 * @function isSameOrAfter
 * @param {Date|number|string} a
 * @param {Date|number|string} b
 * @param {Object} [options] `{ unit, zone }`
 * @returns {boolean}
 */
export function isSameOrAfter(a, b, { unit, zone } = {}) {
	return compare(a, b, unit, zone, (x, y, start, end) => y <= end);
}

/**
 * `a - b` in whole `unit`s (truncated towards zero), milliseconds by default. Days and weeks count
 * calendar days, so a day across a DST change is still 1.
 *
 * @function diff
 * @param {Date|number|string} a
 * @param {Date|number|string} b
 * @param {string} [unit]
 * @param {Object} [options] `{ zone }`
 * @returns {number}
 */
export function diff(a, b, unit, { zone } = {}) {
	const name = resolveZone(zone);
	const x = toTime(a, name);
	const y = toTime(b, name);
	if (Number.isNaN(x) || Number.isNaN(y)) {
		return NaN;
	}
	const granularity = normalizeUnit(unit) || 'millisecond';
	let output;
	switch (granularity) {
		case 'year':
			output = monthDiff(x, y, name) / 12;
			break;
		case 'quarter':
			output = monthDiff(x, y, name) / 3;
			break;
		case 'month':
			output = monthDiff(x, y, name);
			break;
		case 'day':
		case 'date':
		case 'week':
		case 'isoWeek': {
			const zoneDelta = (offsetAt(y, name) - offsetAt(x, name)) * MS.minute;
			output = (x - y - zoneDelta) / (granularity === 'day' || granularity === 'date' ? MS.day : MS.week);
			break;
		}
		default:
			output = (x - y) / (MS[granularity] || 1);
	}
	return Math.trunc(output) + 0;
}

/**
 * A calendar part of a date: 'year', 'month' (0-11), 'date' (1-31), 'day' (0 = Sunday), 'hour',
 * 'minute', 'second', 'millisecond', 'quarter', 'isoWeek', 'isoWeekYear' or 'isoWeekday' (1 = Monday).
 *
 * @function part
 * @param {Date|number|string} input
 * @param {string} unit
 * @param {Object} [options] `{ zone }`
 * @returns {number}
 */
export function part(input, unit, { zone } = {}) {
	const name = resolveZone(zone);
	const time = toTime(input, name);
	if (Number.isNaN(time)) {
		return NaN;
	}
	const w = wall(time, name);
	switch (normalizeUnit(unit)) {
		case 'year': return w.year;
		case 'quarter': return Math.floor(w.month / 3) + 1;
		case 'month': return w.month;
		case 'date': return w.date;
		case 'day': return weekdayOf(w);
		case 'isoWeekday': return weekdayOf(w) || 7;
		case 'hour': return w.hour;
		case 'minute': return w.minute;
		case 'second': return w.second;
		case 'millisecond': return w.millisecond;
		case 'isoWeek': return isoWeekOf(w).week;
		case 'isoWeekYear': return isoWeekOf(w).year;
		default: return undefined;
	}
}

/**
 * Relative time such as "3 hours ago" or "in 2 days" (`Intl.RelativeTimeFormat`, moment's rounding).
 *
 * @function fromNow
 * @param {Date|number|string} input
 * @param {Object} [options] `{ zone }`
 * @returns {string}
 */
export function fromNow(input, { zone } = {}) {
	const time = toTime(input, resolveZone(zone));
	if (Number.isNaN(time)) {
		return INVALID_DATE;
	}
	const elapsed = time - Date.now();
	const { unit, value } = humanUnit(elapsed);
	const amount = unit === 'second' ? 0 : Math.sign(elapsed) * value;
	return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(amount, unit);
}

/**
 * Humanizes a duration, e.g. `humanizeDuration(90, 'minutes')` is "2 hours" (`Intl.NumberFormat`,
 * moment's rounding).
 *
 * @function humanizeDuration
 * @param {number} amount
 * @param {string} [unit='milliseconds']
 * @returns {string}
 */
export function humanizeDuration(amount, unit = 'milliseconds') {
	const name = normalizeUnit(unit) || 'millisecond';
	const size = { month: MS.day * DAYS_PER_MONTH, quarter: MS.day * DAYS_PER_MONTH * 3, year: MS.day * DAYS_PER_YEAR }[name] || MS[name] || 1;
	const { unit: shown, value } = humanUnit(amount * size);
	return new Intl.NumberFormat(locale, { style: 'unit', unit: shown, unitDisplay: 'long' }).format(value);
}

/**
 * Splits a duration into whole hours and the remaining minutes.
 *
 * @function durationParts
 * @param {number} minutes
 * @returns {{hours: number, minutes: number}}
 */
export function durationParts(minutes) {
	const milliseconds = Math.round(minutes * MS.minute);
	return {
		hours: Math.floor(milliseconds / MS.hour),
		minutes: Math.trunc((milliseconds % MS.hour) / MS.minute) + 0
	};
}

/**
 * The machine's IANA timezone.
 *
 * @function guessTimezone
 * @returns {string}
 */
export function guessTimezone() {
	return window.Intl.DateTimeFormat().resolvedOptions().timeZone || UTC;
}

/**
 * Offset (minutes), `+HH:mm` offset text and abbreviation of one zone at an instant (now by default). An
 * unknown zone reads as UTC.
 *
 * @function timezoneInfo
 * @param {string} name IANA zone name
 * @param {Date|number} [at] Defaults to now.
 * @returns {{name: string, offset: number, offsetText: string, abbr: string}}
 */
export function timezoneInfo(name, at = Date.now()) {
	const zone = resolveZone(name) || UTC;
	const time = toTime(at);
	const offset = offsetAt(time, zone);
	return { name, offset, offsetText: offsetText(offset, ':'), abbr: abbreviation(time, zone) };
}

/**
 * Every known zone with its offset and abbreviation (see `timezoneInfo`): the names the app has always
 * offered plus `Intl.supportedValuesOf('timeZone')` where the browser has it, less any name the browser's
 * Intl does not know.
 *
 * @function timezoneList
 * @returns {Array<{name: string, offset: number, offsetText: string, abbr: string}>}
 */
export function timezoneList() {
	const supported = typeof Intl.supportedValuesOf === 'function' ? Intl.supportedValuesOf('timeZone') : [];
	const at = Date.now();
	return [...new Set([...TIMEZONE_NAMES, ...supported])]
		.filter(isKnownZone)
		.sort()
		.map((name) => timezoneInfo(name, at));
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
