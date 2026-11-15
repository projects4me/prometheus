/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

/**
 * The AppUi::EmptyState demo of the Component Library: the default icon, a custom icon and the action.
 *
 * @class DeveloperDemosEmptyStateComponent
 * @namespace Prometheus.Components.Developer.Demos
 * @extends Glimmer.Component
 */
export default class DeveloperDemosEmptyStateComponent extends Component {
    @tracked customIcon = false;
    @tracked withAction = true;

    /**
     * @method toggle
     * @param {String} key
     */
    @action
    toggle(key) {
        this[key] = !this[key];
    }

    /**
     * @method reset
     */
    @action
    reset() {
        this.customIcon = false;
        this.withAction = true;
    }
}
