/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
/**
 * This component is used to render milestones of selected project.
 *
 * @class TaskBoardMilestones
 * @namespace Prometheus.Components
 * @extends Ember.Component
 * @author Rana Nouman <ranamnouman@yahoo.com>
 */
export default class TaskBoardMilestonesComponent extends Component {

    /**
     * This property is used to keep track the query, which is provided by the user, for 
     * filtering the issues.
     *
     * @property query
     * @type String
     * @for TaskBoardMilestones
     * @protected
     */
    @tracked query;

    /**
     * This function return list of milestones
     *
     * @method get
     * @public
     */
    get milestone() {
        return this.args.milestone;
    }

    /**
     * This function will be triggered when we collapse one of the milestone box and is
     * used to disable the input helper, So that user will not be able to search/filter 
     * issues from that milestone when it is collapsed.
     *
     * @method toggleInput
     * @param {MouseEvent} evt
     * @public
     */
    toggleInput(evt) {
        let input = evt.currentTarget.closest('div.box-header').querySelector('input[placeholder="Search Issues .."]');
        input.disabled = (input.disabled) ? false : true;
    }
}
