/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { QUICK_LIST_FIXTURE_STATUSES } from 'prometheus/utils/dev/quick-list-fixture';

/**
 * The AppUi::StatusLabel demo of the Component Library: the badge of every issue status.
 *
 * @class DeveloperDemosStatusLabelComponent
 * @namespace Prometheus.Components.Developer.Demos
 * @extends Glimmer.Component
 */
export default class DeveloperDemosStatusLabelComponent extends Component {
    statuses = QUICK_LIST_FIXTURE_STATUSES;

    /**
     * Nothing to reset: the demo has no state.
     *
     * @method reset
     */
    @action
    reset() {}
}
