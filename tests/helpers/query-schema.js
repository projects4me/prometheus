/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { createSchema } from 'prometheus/utils/query/schema';

/**
 * A fixture ezSearch schema for issues with static values, for the query utility and search bar tests.
 *
 * @method issueQuerySchema
 * @return {Object} The schema
 */
export function issueQuerySchema() {
    return createSchema({
        module: 'Issue',
        textField: 'Issue.subject',
        fields: [
            { id: 'Issue.subject', label: 'Subject', type: 'text' },
            { id: 'Issue.priority', label: 'Priority', type: 'enum', valueSource: 'priorities' },
            { id: 'Issue.status', label: 'Status', type: 'enum', valueSource: 'statuses' },
            { id: 'issuetype.name', aliases: ['type'], label: 'Type', type: 'enum', valueSource: 'types' },
            { id: 'issuemilestone.name', aliases: ['milestone'], label: 'Milestone', type: 'enum', valueSource: 'milestones' },
            { id: 'assignedTo.name', aliases: ['assignee'], label: 'Assignee', type: 'user', valueSource: 'users' },
            { id: 'Issue.startDate', label: 'Start date', type: 'date' },
        ],
        values: {
            priorities: ['Low', 'Medium', 'High', 'Critical'].map((value) => ({ value, label: value })),
            statuses: [
                { value: 'new', label: 'New' },
                { value: 'in_progress', label: 'In progress' },
                { value: 'in_review', label: 'In review' },
                { value: 'done', label: 'Done' },
            ],
            types: ['Bug', 'Story', 'Task'].map((value) => ({ value, label: value })),
            milestones: ['v0.1.1', 'v0.2.0'].map((value) => ({ value, label: value })),
            users: ['Hammad Hassan', 'Rana Nouman', 'Agent Odysseus'].map((value) => ({ value, label: value })),
        },
    });
}
