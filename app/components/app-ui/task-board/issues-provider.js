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
     * The issues of the lane. Searching runs on the server (the route reloads the lanes),
     * so nothing is filtered in the browser.
     *
     * @method get
     * @public
     */
    get results() {
        return this.args.issues;
    }
}
