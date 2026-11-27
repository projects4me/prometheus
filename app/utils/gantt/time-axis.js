/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/**
 * The Gantt's horizontal axis: where a date or a moment lies, in day columns from the timeline start. Days,
 * Weeks and Months use a calendar axis (one column per calendar day); Hours uses a working-time axis (one column
 * per working day, nights and weekends skipped). In both, 09:00 is a column's left edge and 18:00 its right edge,
 * so `offset × day width` is a pixel position in every scale.
 *
 * @module GanttTimeAxis
 */

import {
  WORK_DAY_END_HOUR,
  WORK_DAY_START_HOUR,
  WORK_HOURS_PER_DAY,
  dayStart,
  isWorkingDay,
  nextWorkingMoment,
} from 'prometheus/utils/gantt/working-time';
import { issueWindow } from 'prometheus/utils/gantt/schedule';

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MS_PER_HOUR = 60 * 60 * 1000;

/**
 * The scale whose axis is working time only.
 *
 * @property HOURS_SCALE
 * @type String
 */
export const HOURS_SCALE = 'hours';

/** Calendar days from `from` to `to` (both local midnights), DST-safe. */
function calendarDays(from, to) {
  return Math.round(
    (Date.UTC(to.getFullYear(), to.getMonth(), to.getDate()) -
      Date.UTC(from.getFullYear(), from.getMonth(), from.getDate())) /
      MS_PER_DAY,
  );
}

/** The calendar day `count` days after `day`. */
function addDays(day, count) {
  return new Date(day.getFullYear(), day.getMonth(), day.getDate() + count);
}

/** `YYYY-MM-DD` of a local date. */
function toKey(day) {
  let month = String(day.getMonth() + 1).padStart(2, '0');
  let date = String(day.getDate()).padStart(2, '0');
  return `${day.getFullYear()}-${month}-${date}`;
}

/** The working days from `from` up to (not including) `to`, negative when `to` is earlier: a weekend `to` lands on the next working day's column. */
function workingDays(from, to) {
  let sign = to < from ? -1 : 1;
  let [low, high] = sign > 0 ? [from, to] : [to, from];
  let total = calendarDays(low, high);
  let weeks = Math.floor(total / 7);
  let count = weeks * 5;
  let day = addDays(low, weeks * 7);
  while (day < high) {
    if (isWorkingDay(day)) {
      count++;
    }
    day = addDays(day, 1);
  }
  return sign * count;
}

/** The fraction of the working day a moment has reached: 0 at or before 09:00, 1 at or after 18:00. */
function dayFraction(moment) {
  let hour =
    (moment.getTime() - dayStart(moment).getTime()) / MS_PER_HOUR;
  let clamped = Math.min(WORK_DAY_END_HOUR, Math.max(WORK_DAY_START_HOUR, hour));
  return (clamped - WORK_DAY_START_HOUR) / WORK_HOURS_PER_DAY;
}

/**
 * The time axis of a timeline.
 *
 * @class TimeAxis
 * @constructor
 * @param {String} timelineStart `YYYY-MM-DD`
 * @param {String} timelineEnd `YYYY-MM-DD`
 * @param {String} scale `hours`, `days`, `weeks` or `months`
 */
export class TimeAxis {
  constructor(timelineStart, timelineEnd, scale) {
    this.isWorkingTime = scale === HOURS_SCALE;
    let first = dayStart(timelineStart);
    let last = dayStart(timelineEnd);
    if (first && this.isWorkingTime) {
      first = dayStart(nextWorkingMoment(first));
    }
    this.origin = first;
    this.last = last;
  }

  /**
   * The axis's day columns as `YYYY-MM-DD`, in order: every calendar day, or only the working days.
   *
   * @property columns
   * @type String[]
   */
  get columns() {
    if (!this._columns) {
      let columns = [];
      if (this.origin && this.last) {
        for (let day = this.origin; day <= this.last; day = addDays(day, 1)) {
          if (!this.isWorkingTime || isWorkingDay(day)) {
            columns.push(toKey(day));
          }
        }
      }
      this._columns = columns;
    }
    return this._columns;
  }

  /**
   * The column of a calendar day, counted from the timeline start (can be negative or past the end). On the
   * working-time axis a weekend day is the column of the next working day.
   *
   * @method dayOffset
   * @param {String|Date} day
   * @return {Number|null}
   */
  dayOffset(day) {
    let start = dayStart(day);
    if (!start || !this.origin) {
      return null;
    }
    return this.isWorkingTime
      ? workingDays(this.origin, start)
      : calendarDays(this.origin, start);
  }

  /**
   * Where a moment lies, in (fractional) columns: its day's column plus how far into 09:00–18:00 it is.
   *
   * @method momentOffset
   * @param {Date} moment
   * @return {Number|null}
   */
  momentOffset(moment) {
    if (!(moment instanceof Date) || Number.isNaN(moment.getTime())) {
      return null;
    }
    let day = dayStart(moment);
    if (this.isWorkingTime && !isWorkingDay(day)) {
      return this.dayOffset(day);
    }
    let offset = this.dayOffset(day);
    return offset === null ? null : offset + dayFraction(moment);
  }

  /**
   * The span of a bar from two moments: `{ start, days }` in columns, at least one working hour wide.
   *
   * @method momentSpan
   * @param {Date} from
   * @param {Date} to
   * @return {Object|null}
   */
  momentSpan(from, to) {
    let start = this.momentOffset(from);
    let end = this.momentOffset(to);
    if (start === null || end === null) {
      return null;
    }
    return { start, days: Math.max(1 / WORK_HOURS_PER_DAY, end - start) };
  }

  /**
   * The span of a bar from a start and an end date (both whole days): `{ start, days }` in columns. On the
   * working-time axis the dates are moved inside working time first (see `issueWindow`).
   *
   * @method dateSpan
   * @param {String} startDate
   * @param {String} endDate
   * @return {Object|null}
   */
  dateSpan(startDate, endDate) {
    if (this.isWorkingTime) {
      let window = issueWindow({ startDate, endDate });
      return window ? this.momentSpan(window.start, window.end) : null;
    }
    let start = this.dayOffset(startDate);
    let end = this.dayOffset(endDate);
    if (start === null || end === null) {
      return null;
    }
    return { start, days: Math.max(1, end - start + 1) };
  }

  /**
   * The calendar day at a column (fractions round down), as `YYYY-MM-DD`.
   *
   * @method dateAt
   * @param {Number} offset
   * @return {String|null}
   */
  dateAt(offset) {
    if (!this.origin) {
      return null;
    }
    return this.shiftDate(toKey(this.origin), Math.floor(Number(offset) || 0));
  }

  /**
   * A date moved by whole columns: calendar days, or working days on the working-time axis (a weekend date
   * moves from the next working day).
   *
   * @method shiftDate
   * @param {String} date `YYYY-MM-DD`
   * @param {Number} columns
   * @return {String|null}
   */
  shiftDate(date, columns) {
    let day = dayStart(date);
    if (!day) {
      return null;
    }
    let count = Math.round(Number(columns) || 0);
    if (!this.isWorkingTime) {
      return toKey(addDays(day, count));
    }
    if (count === 0) {
      return toKey(day);
    }
    while (!isWorkingDay(day)) {
      day = addDays(day, 1);
    }
    let step = count > 0 ? 1 : -1;
    let left = Math.abs(count);
    while (left > 0) {
      day = addDays(day, step);
      if (isWorkingDay(day)) {
        left--;
      }
    }
    return toKey(day);
  }
}
