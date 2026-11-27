/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/**
 * Working-time arithmetic for the Gantt scheduler. Moments are `Date` objects in local time; a working day runs
 * from WORK_DAY_START_HOUR to WORK_DAY_END_HOUR on the WORKING_WEEKDAYS. Nights and weekends are skipped.
 *
 * @module GanttWorkingTime
 */

/**
 * The hour a working day starts (09:00).
 *
 * @property WORK_DAY_START_HOUR
 * @type Number
 */
export const WORK_DAY_START_HOUR = 9;

/**
 * The hour a working day ends (18:00).
 *
 * @property WORK_DAY_END_HOUR
 * @type Number
 */
export const WORK_DAY_END_HOUR = 18;

/**
 * Working hours in one working day (9).
 *
 * @property WORK_HOURS_PER_DAY
 * @type Number
 */
export const WORK_HOURS_PER_DAY = WORK_DAY_END_HOUR - WORK_DAY_START_HOUR;

/**
 * The working weekdays, as `Date#getDay()` numbers: Monday (1) to Friday (5).
 *
 * @property WORKING_WEEKDAYS
 * @type Number[]
 */
export const WORKING_WEEKDAYS = Object.freeze([1, 2, 3, 4, 5]);

const MS_PER_HOUR = 60 * 60 * 1000;

// hours closer than this count as equal, so float sums such as ten tenths of a day end at 18:00, not the next 09:00
const EPSILON_HOURS = 1e-6;

/**
 * The local midnight of a calendar day, or null when the value has no valid date.
 *
 * @function dayStart
 * @param {String|Date} value `YYYY-MM-DD` (a time part is ignored) or a Date
 * @returns {Date|null}
 */
export function dayStart(value) {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime())
      ? null
      : new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }
  let match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value ?? ''));
  if (!match) {
    return null;
  }
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

/** The same calendar day at a (fractional) hour. */
function atHour(day, hour) {
  let moment = dayStart(day);
  moment.setHours(WORK_DAY_START_HOUR);
  return new Date(
    moment.getTime() + Math.round((hour - WORK_DAY_START_HOUR) * MS_PER_HOUR),
  );
}

/** The (fractional) hour of the day of a moment. */
function hourOf(moment) {
  return (
    (moment.getTime() - atHour(moment, WORK_DAY_START_HOUR).getTime()) /
      MS_PER_HOUR +
    WORK_DAY_START_HOUR
  );
}

/** The calendar day after (`step` 1) or before (`step` -1) a moment's day, at midnight. */
function shiftDay(moment, step) {
  return new Date(
    moment.getFullYear(),
    moment.getMonth(),
    moment.getDate() + step,
  );
}

/**
 * Whether the moment's calendar day is a working day.
 *
 * @function isWorkingDay
 * @param {Date} moment
 * @returns {Boolean}
 */
export function isWorkingDay(moment) {
  return WORKING_WEEKDAYS.includes(moment.getDay());
}

/**
 * The start (09:00) of a day's working window.
 *
 * @function workDayStart
 * @param {String|Date} day
 * @returns {Date|null}
 */
export function workDayStart(day) {
  return dayStart(day) ? atHour(day, WORK_DAY_START_HOUR) : null;
}

/**
 * The end (18:00) of a day's working window.
 *
 * @function workDayEnd
 * @param {String|Date} day
 * @returns {Date|null}
 */
export function workDayEnd(day) {
  return dayStart(day) ? atHour(day, WORK_DAY_END_HOUR) : null;
}

/**
 * The moment itself when it is in working time, otherwise the next start of a working day.
 *
 * @function nextWorkingMoment
 * @param {Date} moment
 * @returns {Date}
 */
export function nextWorkingMoment(moment) {
  let day = moment;
  if (isWorkingDay(day) && hourOf(day) < WORK_DAY_END_HOUR) {
    return hourOf(day) < WORK_DAY_START_HOUR
      ? workDayStart(day)
      : new Date(day.getTime());
  }
  day = shiftDay(day, 1);
  while (!isWorkingDay(day)) {
    day = shiftDay(day, 1);
  }
  return workDayStart(day);
}

/**
 * The moment itself when it is in working time (its end included), otherwise the last end of a working day.
 *
 * @function previousWorkingMoment
 * @param {Date} moment
 * @returns {Date}
 */
export function previousWorkingMoment(moment) {
  let day = moment;
  if (isWorkingDay(day) && hourOf(day) > WORK_DAY_START_HOUR) {
    return hourOf(day) > WORK_DAY_END_HOUR
      ? workDayEnd(day)
      : new Date(day.getTime());
  }
  day = shiftDay(day, -1);
  while (!isWorkingDay(day)) {
    day = shiftDay(day, -1);
  }
  return workDayEnd(day);
}

/**
 * The moment `hours` working hours after `moment`, skipping nights and weekends. Work that fills a day up to
 * 18:00 ends at 18:00 that day, not at 09:00 of the next one.
 *
 * @function addWorkingHours
 * @param {Date} moment
 * @param {Number} hours Working hours to add (0 or more)
 * @returns {Date}
 */
export function addWorkingHours(moment, hours) {
  let current = nextWorkingMoment(moment);
  let remaining = Math.max(0, Number(hours) || 0);
  for (;;) {
    let left = WORK_DAY_END_HOUR - hourOf(current);
    if (remaining <= left + EPSILON_HOURS) {
      return atHour(
        current,
        Math.min(WORK_DAY_END_HOUR, hourOf(current) + remaining),
      );
    }
    remaining -= left;
    current = nextWorkingMoment(workDayEnd(current));
  }
}

/**
 * The working hours between two moments (0 when `to` is not after `from`).
 *
 * @function workingHoursBetween
 * @param {Date} from
 * @param {Date} to
 * @returns {Number}
 */
export function workingHoursBetween(from, to) {
  if (!(to > from)) {
    return 0;
  }
  let hours = 0;
  let day = dayStart(from);
  let last = dayStart(to);
  while (day <= last) {
    if (isWorkingDay(day)) {
      let start = Math.max(
        WORK_DAY_START_HOUR,
        day.getTime() === dayStart(from).getTime() ? hourOf(from) : 0,
      );
      let end = Math.min(
        WORK_DAY_END_HOUR,
        day.getTime() === last.getTime() ? hourOf(to) : 24,
      );
      hours += Math.max(0, end - start);
    }
    day = shiftDay(day, 1);
  }
  return hours;
}
