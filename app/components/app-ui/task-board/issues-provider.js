/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';

/**
 * This component is used to render issues, related to the milestone.
 *
 * @class TaskBoardIssuesProvider
 * @namespace Prometheus.Components
 * @extends Ember.Component
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class TaskBoardIssuesProviderComponent extends Component {

    /**
     * This function is used to filter the issues based upon user's input and return
     * that list of filtered issues in order to render them template.
     *
     * @method get
     * @public
     */
    get results() {
        let { issues, query } = this.args;
        if (query) {
            issues = issues.filter((issue) => {
                let subject = issue.subject;
                let description = issue.description;
                let issueNumber = issue.issueNumber;

                if ((subject != null && subject.includes(query)) ||
                    (description != null && description.includes(query)) ||
                    (issueNumber != null && issueNumber.includes(query))
                ) {
                    return true;
                }
            });
        }
        return issues;
    }
}
