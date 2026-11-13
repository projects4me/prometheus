/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { set } from '@ember/object';
import * as dates from 'prometheus/utils/date';
import ClosedBlock from 'prometheus/components/milestone-blocks/closed';
import CompleteBlock from 'prometheus/components/milestone-blocks/complete';
import CompletedBlock from 'prometheus/components/milestone-blocks/completed';
import DeferredBlock from 'prometheus/components/milestone-blocks/deferred';
import FailedBlock from 'prometheus/components/milestone-blocks/failed';
import IndexBlock from 'prometheus/components/milestone-blocks/index';
import OverdueBlock from 'prometheus/components/milestone-blocks/overdue';

/**
 * The milestone block component for each milestone status. Statuses without their own block use IndexBlock.
 *
 * @property BLOCKS_BY_STATUS
 * @type Object
 * @private
 */
const BLOCKS_BY_STATUS = Object.freeze({
    closed: ClosedBlock,
    complete: CompleteBlock,
    completed: CompletedBlock,
    deferred: DeferredBlock,
    failed: FailedBlock,
    overdue: OverdueBlock
});

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
     * This function returns milestone block component based on milestone status.
     * E.g if status of milestone is "completed" then it returns the milestone-blocks/completed component,
     * and milestone-blocks/index for a status without its own block.
     * 
     * @method get
     * @public
     */
    get milestoneBlockToRender() {
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

        return BLOCKS_BY_STATUS[status] ?? IndexBlock;
    }
}
