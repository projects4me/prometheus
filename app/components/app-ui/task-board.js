/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

/**
 * This component is used to render milestones of selected project.
 *
 * @class TaskBoard
 * @namespace Prometheus.Components
 * @extends Ember.Component
 * @author Rana Nouman <ranamnouman@yahoo.com>
 */
export default class TaskBoardComponent extends Component {

    /**
     * This property is used to keep track the milestone container element, on which user is filtering the
     * issues. The purpose for keeping it tracked is to re-adjust the height of milestone container element, when the 
     * filtered issues are re-rendered on template.
     *
     * @property currentFilteredMilestone
     * @type Object
     * @for TaskBoard
     * @protected
     */
    @tracked currentFilteredMilestone = null;

    /**
     * This function is bind with input helper and is called on keyup event of keyboard. This
     * is used to set 'currentFilteredMilestone' property, in order to trigger an update to modifier
     * to re-render the view.
     *
     * @method reRenderView
     * @param {String} query Stores user's input
     * @param {KeyboardEvent} evt
     * @public
     */
    @action reRenderView(query, evt) {
        let parentEl = evt.currentTarget.closest('div.milestone.box').querySelector('div.milestone.box-body');
        this.currentFilteredMilestone = parentEl;
    }
}
