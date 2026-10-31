/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/**
 * The label class of each idea plan status, reusing the classes of the issue statuses. Shared by the plan box
 * and the idea browser so both show a status in the same colour.
 *
 * @property PLAN_STATUS_LABELS
 * @type Object
 */
export const PLAN_STATUS_LABELS = {
    proposed: 'new',
    approved: 'in_review',
    creating: 'in_progress',
    created: 'done',
    failed: 'closed',
    superseded: 'deferred'
};

/**
 * The label class of a plan status
 *
 * @method planStatusClass
 * @param {String} status
 * @returns {String}
 */
export function planStatusClass(status) {
    return PLAN_STATUS_LABELS[status] ?? 'new';
}
