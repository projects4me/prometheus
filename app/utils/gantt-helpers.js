/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/**
 * Utility functions for Gantt chart calculations
 *
 * @module GanttHelpers
 * @author Rana Nouman <ranamnouman@gmail.com>
 */

import * as dateUtil from 'prometheus/utils/date';

/**
 * The one height, in px, of every Gantt row (issue and milestone rows alike).
 * The grid pattern, the dependency routing, scrollToIssue and (through the
 * --gantt-row-height custom property on the chart root) the SCSS all read it.
 *
 * @property GANTT_ROW_HEIGHT
 * @type Number
 */
export const GANTT_ROW_HEIGHT = 36;

/**
 * Calculate the number of days between two dates
 *
 * @function getDaysBetween
 * @param {String} startDate Start date in YYYY-MM-DD format
 * @param {String} endDate End date in YYYY-MM-DD format
 * @returns {Number} Number of days between the dates
 */
export function getDaysBetween(startDate, endDate) {
    return dateUtil.diff(endDate, startDate, 'days');
}

/**
 * Coerce a value to a finite number for an inline style string, 0 otherwise. Styles built with
 * htmlSafe only ever interpolate the result, never raw input.
 *
 * @function toFiniteNumber
 * @param {*} value
 * @returns {Number}
 */
export function toFiniteNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
}

/**
 * Calculate the position (in days) from timeline start to item start
 *
 * @function getPositionInDays
 * @param {String} timelineStart Timeline start date in YYYY-MM-DD format
 * @param {String} itemStart Item start date in YYYY-MM-DD format
 * @returns {Number} Number of days from timeline start
 */
export function getPositionInDays(timelineStart, itemStart) {
    return dateUtil.diff(itemStart, timelineStart, 'days');
}

/**
 * Calculate the width of a bar in pixels based on duration
 * The width represents the inclusive count of days (start and end are both included)
 * For example: Oct 15 to Oct 19 = 5 days (15, 16, 17, 18, 19)
 *
 * @function calculateBarWidth
 * @param {String} startDate Start date in YYYY-MM-DD format
 * @param {String} endDate End date in YYYY-MM-DD format
 * @param {Number} dayWidth Width of a single day in pixels
 * @returns {Number} Width in pixels
 */
export function calculateBarWidth(startDate, endDate, dayWidth) {
    let days = getDaysBetween(startDate, endDate);
    // Add 1 to make it inclusive (both start and end dates are included)
    // Minimum width of 1 day (when start and end are the same)
    days = Math.max(1, days + 1);
    return days * dayWidth;
}

/**
 * Calculate the left position of a bar in pixels
 *
 * @function calculateBarPosition
 * @param {String} timelineStart Timeline start date in YYYY-MM-DD format
 * @param {String} itemStart Item start date in YYYY-MM-DD format
 * @param {Number} dayWidth Width of a single day in pixels
 * @returns {Number} Left position in pixels
 */
export function calculateBarPosition(timelineStart, itemStart, dayWidth) {
    let days = getPositionInDays(timelineStart, itemStart);
    return days * dayWidth;
}

/**
 * Generate an array of dates between start and end
 *
 * @function generateDateRange
 * @param {String} startDate Start date in YYYY-MM-DD format
 * @param {String} endDate End date in YYYY-MM-DD format
 * @returns {Array} Array of date objects with date info
 */
export function generateDateRange(startDate, endDate) {
    let dates = [];
    let current = dateUtil.parse(startDate);

    while (dateUtil.isSameOrBefore(current, endDate)) {
        dates.push({
            date: dateUtil.format(current, 'YYYY-MM-DD'),
            day: dateUtil.format(current, 'DD'),
            month: dateUtil.format(current, 'MMM'),
            year: dateUtil.format(current, 'YYYY'),
            dayOfWeek: dateUtil.format(current, 'ddd'),
            isFirstOfMonth: dateUtil.part(current, 'date') === 1,
            isMonday: dateUtil.part(current, 'day') === 1
        });
        current = dateUtil.add(current, 1, 'day');
    }

    return dates;
}

/**
 * Group dates by month for header display
 *
 * @function groupDatesByMonth
 * @param {Array} dates Array of date objects
 * @returns {Array} Array of month groups
 */
export function groupDatesByMonth(dates) {
    let months = [];
    let currentMonth = null;
    let monthData = null;

    dates.forEach((date) => {
        let monthKey = `${date.year}-${date.month}`;
        
        if (monthKey !== currentMonth) {
            if (monthData) {
                months.push(monthData);
            }
            currentMonth = monthKey;
            monthData = {
                month: date.month,
                year: date.year,
                days: 1
            };
        } else {
            monthData.days++;
        }
    });

    if (monthData) {
        months.push(monthData);
    }

    return months;
}

/**
 * Calculate total number of days in timeline
 *
 * @function getTotalDays
 * @param {String} startDate Start date in YYYY-MM-DD format
 * @param {String} endDate End date in YYYY-MM-DD format
 * @returns {Number} Total number of days
 */
export function getTotalDays(startDate, endDate) {
    return getDaysBetween(startDate, endDate) + 1; // +1 to include both start and end
}

/**
 * Check if an item has valid dates for display
 *
 * @function hasValidDates
 * @param {Object} item Object with startDate and endDate properties
 * @returns {Boolean} True if both dates are valid
 */
export function hasValidDates(item) {
    return item.startDate && item.endDate && 
           dateUtil.isValid(item.startDate) &&
           dateUtil.isValid(item.endDate);
}

/**
 * Format a date for display
 *
 * @function formatDate
 * @param {String} date Date in YYYY-MM-DD format
 * @param {String} format utils/date format tokens
 * @returns {String} Formatted date
 */
export function formatDate(date, format = 'MMM DD, YYYY') {
    return dateUtil.format(date, format);
}

/**
 * The issues of a milestone that the timeline shows: the ones with valid start and end dates
 *
 * @function getValidIssues
 * @param {Object} milestone Milestone record with an issues array
 * @returns {Array} Issues with valid dates
 */
export function getValidIssues(milestone) {
    return (milestone.issues ?? []).filter((issue) => hasValidDates(issue));
}

/**
 * All issues of a milestone in display order: the ones with dates first, then the ones without
 *
 * @function getOrderedIssues
 * @param {Object} milestone Milestone record with an issues array
 * @returns {Array} Dated issues followed by undated issues
 */
export function getOrderedIssues(milestone) {
    const issues = milestone.issues ?? [];
    return [...issues.filter((issue) => hasValidDates(issue)), ...issues.filter((issue) => !hasValidDates(issue))];
}

/**
 * Count the issues of the given milestones that have no valid dates (no bar on the timeline)
 *
 * @function countUndatedIssues
 * @param {Array} milestones Milestone records with an issues array
 * @returns {Number} Number of undated issues
 */
export function countUndatedIssues(milestones) {
    return (milestones ?? []).reduce(
        (total, milestone) => total + (milestone.issues ?? []).filter((issue) => !hasValidDates(issue)).length,
        0
    );
}

/**
 * Count the milestone's issues that are finished: done, complete, closed or deferred
 *
 * @function countCompletedIssues
 * @param {Object} milestone Milestone record with an issues array
 * @returns {Number} Number of completed issues
 */
export function countCompletedIssues(milestone) {
    const finished = ['done', 'complete', 'closed', 'deferred'];
    return (milestone.issues ?? []).filter((issue) => finished.includes(issue.status)).length;
}

/**
 * The key a milestone is tracked by: its id, or its type for the virtual backlog
 *
 * @function getMilestoneKey
 * @param {Object} milestone Milestone record
 * @returns {String} The key
 */
export function getMilestoneKey(milestone) {
    return milestone.id || milestone.milestoneType;
}

/**
 * The milestone bar's start and end (YYYY-MM-DD): the milestone's own dates stretched to its earliest
 * issue start and latest issue end. Both are null when the milestone has no valid dates.
 *
 * @function getMilestoneBarDates
 * @param {Object} milestone Milestone record
 * @returns {Object} `{ start, end }`
 */
export function getMilestoneBarDates(milestone) {
    if (!hasValidDates(milestone)) {
        return { start: null, end: null };
    }
    let start = milestone.startDate;
    let end = milestone.endDate;
    getValidIssues(milestone).forEach((issue) => {
        if (dateUtil.isBefore(issue.startDate, start)) {
            start = issue.startDate;
        }
        if (dateUtil.isAfter(issue.endDate, end)) {
            end = issue.endDate;
        }
    });
    return { start: dateUtil.format(start, 'YYYY-MM-DD'), end: dateUtil.format(end, 'YYYY-MM-DD') };
}

/**
 * The state a milestone's grid row shows: `done` when it has issues and all are finished, `overdue` when its
 * end date (the bar end) is before today and not all are finished, otherwise null.
 *
 * @function getMilestoneState
 * @param {Object} milestone Milestone record with an issues array
 * @param {String} today Today in YYYY-MM-DD format
 * @returns {String|null} `done`, `overdue` or null
 */
export function getMilestoneState(milestone, today) {
    const total = milestone.issues?.length ?? 0;
    if (total > 0 && countCompletedIssues(milestone) === total) {
        return 'done';
    }
    const { end } = getMilestoneBarDates(milestone);
    return end && dateUtil.isBefore(end, today, { unit: 'day' }) ? 'overdue' : null;
}
