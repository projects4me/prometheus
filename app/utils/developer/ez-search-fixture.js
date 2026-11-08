/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { createSchema } from 'prometheus/utils/query/schema';

/**
 * The fixture of the ezSearch Component Library demo: a search schema in the shape of
 * `views.<Module>.search` of the metadata, with static value lists instead of value sources, the saved
 * searches and the `@query` presets. Nothing here calls Gaia.
 *
 * @class EzSearchFixture
 * @namespace Prometheus.Utils.Developer
 */

/**
 * @property SEARCH_META
 * @type Object
 */
export const SEARCH_META = {
    module: 'Issue',
    textField: 'Issue.subject',
    fields: {
        'Issue.subject': { label: 'Subject', type: 'text', aliases: ['subject'] },
        'Issue.status': {
            label: 'Status',
            type: 'enum',
            aliases: ['status'],
            values: [
                { value: 'new', label: 'New' },
                { value: 'in_progress', label: 'In progress' },
                { value: 'in_review', label: 'In review' },
                { value: 'done', label: 'Done' },
            ],
        },
        'Issue.priority': {
            label: 'Priority',
            type: 'enum',
            aliases: ['priority'],
            values: ['Low', 'Medium', 'High', 'Critical'].map((value) => ({ value, label: value })),
        },
        'Issue.startDate': { label: 'Start date', type: 'date', aliases: ['start'] },
        'assignedTo.name': {
            label: 'Assignee',
            type: 'user',
            aliases: ['assignee'],
            values: ['Hammad Hassan', 'Rana Nouman', 'Agent Odysseus'].map((value) => ({ value, label: value })),
        },
    },
};

/**
 * The fixture metadata as an ezSearch schema.
 *
 * @method fixtureSchema
 * @return {Object} The schema
 */
export function fixtureSchema() {
    let values = {};
    let fields = Object.entries(SEARCH_META.fields).map(([id, field]) => {
        if (field.values) {
            values[id] = field.values;
        }

        return {
            id,
            aliases: field.aliases || [],
            label: field.label,
            type: field.type,
            valueSource: field.values ? id : undefined,
        };
    });

    return createSchema({ module: SEARCH_META.module, textField: SEARCH_META.textField, fields, values });
}

/**
 * @property SAVED_SEARCHES
 * @type Array
 */
export const SAVED_SEARCHES = [
    { id: 's1', name: 'Done issues', query: '((Issue.status : done))' },
    { id: 's2', name: 'Urgent and open', query: '((Issue.priority : critical) AND (Issue.status : in_progress))' },
];

/**
 * The `@query` presets, by key.
 *
 * @property QUERY_PRESETS
 * @type Object
 */
export const QUERY_PRESETS = {
    empty: '',
    simple: '((Issue.status : done))',
    brackets: '((Issue.status : in_progress) AND ((Issue.priority : high) OR (Issue.priority : critical)))',
    invalid: 'status:done AND priority:high OR priority:low',
};

/**
 * The `@baseQuery` the demo ANDs in when it is switched on.
 *
 * @property BASE_QUERY
 * @type String
 */
export const BASE_QUERY = '((assignedTo.name : "Hammad Hassan"))';
