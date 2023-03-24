/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { tracked } from '@glimmer/tracking';
import AppComponent from '../../app';

/**
 * This component is used to render milestones of selected project.
 *
 * @class TaskBoardMilestones
 * @namespace Prometheus.Components
 * @extends Ember.Component
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class TaskBoardMilestonesComponent extends AppComponent {

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
     * This property is used to toggle the disabled value of input helper.
     *
     * @property toggleInput
     * @type Boolean
     * @for TaskBoardMilestones
     * @protected
     */
    @tracked toggleInput = false;
}
