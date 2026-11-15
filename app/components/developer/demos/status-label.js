/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

/**
 * The AppUi::StatusLabel demo of the Component Library: the badge of each issue status.
 *
 * @class DeveloperDemosStatusLabelComponent
 * @namespace Prometheus.Components.Developer.Demos
 * @extends Glimmer.Component
 */
export default class DeveloperDemosStatusLabelComponent extends Component {
    statuses = ['New', 'In Progress', 'In Review', 'Closed'];

    @tracked status = 'New';

    /**
     * @method setStatus
     * @param {String} status
     */
    @action
    setStatus(status) {
        this.status = status;
    }

    /**
     * @method reset
     */
    @action
    reset() {
        this.status = 'New';
    }
}
