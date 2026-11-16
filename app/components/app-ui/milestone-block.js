/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { set } from '@ember/object';
import { getOwner } from '@ember/owner';
import * as dates from 'prometheus/utils/date';

/**
 * This component is used to render milestone block.
 *
 * @class MilestoneBlock
 * @namespace Prometheus.Components
 * @extends Ember.Component
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class AppUiMilestoneBlockComponent extends Component {

    /**
     * This function set progress of the milestone.
     * 
     * @method constructor
     * @public
     */
    constructor() {
        super(...arguments);
        let milestone = this.milestone;
        let progress = 0;
        let totalIssues = milestone.issues.length;

        // Calculate the progres
        if (totalIssues > 0) {
            let closed = 0;
            closed += milestone.issues.filter((item) => item.status === 'done').length;
            closed += milestone.issues.filter((item) => item.status === 'complete').length;
            closed += milestone.issues.filter((item) => item.status === 'closed').length;
            closed += milestone.issues.filter((item) => item.status === 'deferred').length;
            progress = _.round((closed / totalIssues) * 100);
        }

        // Set the milestone progress
        set(milestone, "progress", progress);
    }

    /**
     * This function returns milestone.
     * 
     * @method get
     * @public
     */
    get milestone() {
        return this.args.milestone;
    }

    /**
     * This function returns the name of the milestone block component to render, based on milestone status.
     * E.g if status of milestone is "completed" then it returns "completed" (milestone-blocks/completed),
     * and "index" for a status without its own block.
     * 
     * @method get
     * @public
     */
    get milestoneBlockType() {
        let milestone = this.milestone;
        let status = milestone.status;

        /**
         * Check if milestone having status "in progress" or "planned" crossed there end date. 
         * If end date crossed then render a milestone block having "overdue" status.
         */
        if (status === 'in_progress' || status === 'planned') {
            if (dates.isSameOrAfter(dates.now(), milestone.endDate)) {
                status = 'overdue';
            }
        }

        let owner = getOwner(this);
        let hasBlock = owner.hasRegistration(`component:milestone-blocks/${status}`) ||
            owner.hasRegistration(`template:components/milestone-blocks/${status}`);

        return hasBlock ? status : 'index';
    }
}
