/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { createSchema } from 'prometheus/utils/query/schema';

/**
 * The fields of the Issue module, with the ids of the issue list's filters.
 *
 * @property ISSUE_FIELDS
 * @type Array
 * @private
 */
const ISSUE_FIELDS = [
    { id: 'Issue.issueNumber', aliases: ['number', '#'], labelKey: 'views.app.issue.fields.issueNumber', type: 'number' },
    { id: 'Issue.subject', aliases: ['subject'], labelKey: 'views.app.issue.fields.subject', type: 'text' },
    { id: 'Issue.status', aliases: ['status'], labelKey: 'views.app.issue.fields.status', type: 'enum', valueSource: 'statuses' },
    { id: 'issuemilestone.name', aliases: ['milestone'], labelKey: 'views.app.issue.fields.milestoneId', type: 'enum', valueSource: 'milestones' },
    { id: 'issuetype.name', aliases: ['type'], labelKey: 'views.app.issue.fields.typeId', type: 'enum', valueSource: 'types' },
    { id: 'Issue.priority', aliases: ['priority', 'prio'], labelKey: 'views.app.issue.fields.priority', type: 'enum', valueSource: 'priorities' },
    { id: 'Issue.startDate', aliases: ['start'], labelKey: 'views.app.issue.fields.startDate', type: 'date' },
    { id: 'Issue.endDate', aliases: ['end'], labelKey: 'views.app.issue.fields.endDate', type: 'date' },
    { id: 'parentissue.issueNumber', aliases: ['parent'], labelKey: 'views.app.issue.fields.parent', type: 'number' },
    { id: 'assignedTo.name', aliases: ['assignee'], labelKey: 'views.app.issue.fields.assignee', type: 'user', valueSource: 'users' },
    { id: 'ownedBy.name', aliases: ['owner'], labelKey: 'views.app.issue.fields.owner', type: 'user', valueSource: 'users' },
    { id: 'reportedBy.name', aliases: ['reporter'], labelKey: 'views.app.issue.fields.reportedBy', type: 'user', valueSource: 'users' },
];

/**
 * Create the schema of the Issue module.
 *
 * @method createIssueSchema
 * @param {Object} options
 * @param {Ember.Service} options.intl The intl service, for the labels
 * @param {Object} [options.values] The values of the `statuses`, `milestones`, `types`, `priorities` and `users` sources
 * @return {Object} The schema
 */
export function createIssueSchema({ intl, values = {} }) {
    return createSchema({
        module: 'Issue',
        textField: 'Issue.subject',
        fields: ISSUE_FIELDS.map((field) => ({ ...field, label: intl.t(field.labelKey) })),
        values,
    });
}
