/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

/**
 * This component is used to render milestones of selected project.
 *
 * @class TaskBoard
 * @namespace Prometheus.Components
 * @extends Ember.Component
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class TaskBoardComponent extends Component {

    /**
     * This property is used to keep track the query, which is provided by the user, for 
     * filtering the issues.
     *
     * @property query
     * @type String
     * @for TaskBoard
     * @protected
     */
    @tracked query;    
}
