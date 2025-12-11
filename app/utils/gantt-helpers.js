/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/**
 * Utility functions for Gantt chart calculations
 *
 * @module GanttHelpers
 * @author Rana Nouman <ranamnouman@gmail.com>
 */

/**
 * Calculate the number of days between two dates
 *
 * @function getDaysBetween
 * @param {String} startDate Start date in YYYY-MM-DD format
 * @param {String} endDate End date in YYYY-MM-DD format
 * @returns {Number} Number of days between the dates
 */
export function getDaysBetween(startDate, endDate) {
    let start = moment(startDate);
    let end = moment(endDate);
    return end.diff(start, 'days');
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
    let start = moment(timelineStart);
    let item = moment(itemStart);
    return item.diff(start, 'days');
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
    let current = moment(startDate);
    let end = moment(endDate);

    while (current.isSameOrBefore(end)) {
        dates.push({
            date: current.format('YYYY-MM-DD'),
            day: current.format('DD'),
            month: current.format('MMM'),
            year: current.format('YYYY'),
            dayOfWeek: current.format('ddd'),
            isFirstOfMonth: current.date() === 1,
            isMonday: current.day() === 1
        });
        current.add(1, 'day');
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
           moment(item.startDate).isValid() && 
           moment(item.endDate).isValid();
}

/**
 * Format a date for display
 *
 * @function formatDate
 * @param {String} date Date in YYYY-MM-DD format
 * @param {String} format Moment format string
 * @returns {String} Formatted date
 */
export function formatDate(date, format = 'MMM DD, YYYY') {
    return moment(date).format(format);
}
