/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/**
 * Progress of the Gantt bars: the time logged on the shown issues, an issue's % done and a milestone's % done.
 *
 * @module GanttProgress
 */

import { countCompletedIssues } from 'prometheus/utils/gantt-helpers';

/**
 * Hours in a logged day, as the issue screens count them.
 *
 * @property HOURS_PER_DAY
 * @type Number
 */
export const HOURS_PER_DAY = 8;

/**
 * The minutes one time log records (its days, hours and minutes).
 *
 * @function timelogMinutes
 * @param {Object} timelog A time log record
 * @returns {Number} Minutes
 */
export function timelogMinutes(timelog) {
    const days = parseInt(timelog?.days || 0, 10) || 0;
    const hours = parseInt(timelog?.hours || 0, 10) || 0;
    const minutes = parseInt(timelog?.minutes || 0, 10) || 0;
    return (days * HOURS_PER_DAY + hours) * 60 + minutes;
}

/**
 * Sum the time logs per issue: spent (context `spent`) and estimated (context `est`) minutes.
 *
 * @function sumTimelogs
 * @param {Array} timelogs Time log records
 * @returns {Map} issue id → `{ spent, estimated }` in minutes
 */
export function sumTimelogs(timelogs) {
    const totals = new Map();
    (timelogs ?? []).forEach((timelog) => {
        const key = timelog.context === 'spent' ? 'spent' : timelog.context === 'est' ? 'estimated' : null;
        if (!key || !timelog.issueId) {
            return;
        }
        const total = totals.get(timelog.issueId) ?? { spent: 0, estimated: 0 };
        total[key] += timelogMinutes(timelog);
        totals.set(timelog.issueId, total);
    });
    return totals;
}

/**
 * Whether the issue's status counts as done (the status's `done` flag).
 *
 * @function isIssueStatusDone
 * @param {Object} issue Issue record
 * @returns {Boolean}
 */
export function isIssueStatusDone(issue) {
    // an async belongsTo is a proxy: its record is the content once loaded
    const status = issue?.issuestatus?.content ?? issue?.issuestatus;
    return ['1', 'true'].includes(String(status?.done).toLowerCase());
}

/**
 * An issue's % done: 100 when its status counts as done, otherwise spent ÷ estimated capped at 100, and null
 * (no fill) when there is no estimate.
 *
 * @function getIssueProgress
 * @param {Object} issue Issue record
 * @param {Object} total `{ spent, estimated }` minutes of the issue, if any
 * @returns {Number|null} Whole percent, or null
 */
export function getIssueProgress(issue, total) {
    if (isIssueStatusDone(issue)) {
        return 100;
    }
    if (!total || !(total.estimated > 0)) {
        return null;
    }
    return Math.min(100, Math.round((total.spent / total.estimated) * 100));
}

/**
 * A milestone's % done: its finished issues ÷ all its issues, or null when it has none.
 *
 * @function getMilestoneProgress
 * @param {Object} milestone Milestone record with an issues array
 * @returns {Number|null} Whole percent, or null
 */
export function getMilestoneProgress(milestone) {
    const total = milestone?.issues?.length ?? 0;
    if (total === 0) {
        return null;
    }
    return Math.round((countCompletedIssues(milestone) / total) * 100);
}
