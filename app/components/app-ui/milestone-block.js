/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { ensureSafeComponent } from '@embroider/util';

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
            closed += milestone.issues.filterBy('status', 'done').length;
            closed += milestone.issues.filterBy('status', 'complete').length;
            closed += milestone.issues.filterBy('status', 'closed').length;
            closed += milestone.issues.filterBy('status', 'deferred').length;
            progress = _.round((closed / totalIssues) * 100);
        }

        // Set the milestone progress
        this.milestone.set('progress', progress);
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
     * This function returns milestone block component based on milestone status.
     * E.g if status of milestone is "completed" then it will look out for component 
     * in "milestone-blocks/**" directory and will return that component to template
     * in order to render it.
     * 
     * @method get
     * @public
     */
    get milestoneBlockToRender() {
        let milestone = this.milestone;
        let status = milestone.status;

        if (status === 'in_progress' || status === 'planned') {
            if (moment().isSameOrAfter(milestone.endDate)) {
                status = 'overdue';
            }
        }

        return ensureSafeComponent(`milestone-blocks/${status}`, this);
    }
}
