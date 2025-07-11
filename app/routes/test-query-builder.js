/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Route from '@ember/routing/route';

/**
 * Test route for the native Query Builder component
 *
 * @class TestQueryBuilderRoute
 * @namespace Prometheus.Routes
 * @extends Ember.Route
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default class TestQueryBuilderRoute extends Route {

    /**
     * Model hook - provides test data for the query builder
     *
     * @method model
     * @return {Object}
     */
    model() {
        return {
            // Sample filters that match the existing issue metadata structure
            filters: [
                {
                    id: 'Issue.issueNumber',
                    label: 'Issue Number',
                    type: 'string',
                    operators: ['equal', 'not_equal', 'contains', 'not_contains']
                },
                {
                    id: 'Issue.subject',
                    label: 'Subject',
                    type: 'string',
                    operators: ['equal', 'not_equal', 'contains', 'not_contains', 'begins_with', 'ends_with']
                },
                {
                    id: 'Issue.status',
                    label: 'Status',
                    type: 'string',
                    input: 'select',
                    values: {
                        'new': 'New',
                        'in_progress': 'In Progress',
                        'pending': 'Pending',
                        'done': 'Done',
                        'wont_fix': "Won't Fix",
                        'deferred': 'Deferred',
                        'feedback': 'Feedback'
                    },
                    operators: ['equal', 'not_equal', 'in', 'not_in']
                },
                {
                    id: 'Issue.priority',
                    label: 'Priority',
                    type: 'string',
                    input: 'select',
                    values: {
                        'low': 'Low',
                        'medium': 'Medium',
                        'high': 'High',
                        'critical': 'Critical',
                        'blocker': 'Blocker'
                    },
                    operators: ['equal', 'not_equal', 'in', 'not_in']
                },
                {
                    id: 'Issue.startDate',
                    label: 'Start Date',
                    type: 'date',
                    operators: ['equal', 'not_equal', 'less', 'less_or_equal', 'greater', 'greater_or_equal', 'between', 'not_between', 'is_null', 'is_not_null']
                },
                {
                    id: 'Issue.endDate',
                    label: 'End Date',
                    type: 'date',
                    operators: ['equal', 'not_equal', 'less', 'less_or_equal', 'greater', 'greater_or_equal', 'between', 'not_between', 'is_null', 'is_not_null']
                },
                {
                    id: 'Issue.assignee',
                    label: 'Assignee',
                    type: 'string',
                    operators: ['equal', 'not_equal', 'contains', 'not_contains', 'is_null', 'is_not_null']
                },
                {
                    id: 'issuemilestone.name',
                    label: 'Milestone',
                    type: 'string',
                    operators: ['equal', 'not_equal', 'contains', 'not_contains', 'is_null', 'is_not_null']
                },
                {
                    id: 'issuetype.name',
                    label: 'Issue Type',
                    type: 'string',
                    operators: ['equal', 'not_equal', 'contains', 'not_contains']
                }
            ],
            
            // Sample initial query
            initialQuery: "((Issue.subject CONTAINS 'bug') AND (Issue.priority : 'high'))"
        };
    }
}
