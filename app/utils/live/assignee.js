/**
 * Helpers for applying live assignee patches onto Ember Data issue records.
 */

import { peekOrPush } from "prometheus/utils/live/collection";

/**
 * Apply an issue.assignee.changed envelope onto a peeked issue.
 *
 * @method applyIssueAssigneeChange
 * @param {Object} store Ember Data store
 * @param {Object} issue Issue record to patch
 * @param {Object} envelope Domain-event envelope
 * @returns {Object|null} The issue, or null when none was passed
 * @public
 */
export function applyIssueAssigneeChange(store, issue, envelope) {
    if (!issue) {
        return null;
    }

    let changes = envelope?.changes || {};
    if ("assignee" in changes && issue.get("assignee") !== changes.assignee) {
        issue.set("assignee", changes.assignee);
    }

    let assigneeData = changes.assignedTo || envelope?.meta?.assignedTo;
    let assigneeAttributes = typeof assigneeData === "object" ? assigneeData : {};
    let assigneeId =
        assigneeAttributes.id ||
        (typeof assigneeData === "string" ? assigneeData : null) ||
        changes.assigneeId ||
        changes.assignee;
    let assignee = assigneeId
        ? peekOrPush(store, "user", assigneeId, assigneeAttributes)
        : null;
    if (issue.get("assignedTo") !== assignee) {
        issue.set("assignedTo", assignee);
    }
    return issue;
}
