/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

/**
 * The AppUi::Box demo of the Component Library: the variant and which parts the box renders.
 *
 * @class DeveloperDemosBoxComponent
 * @namespace Prometheus.Components.Developer.Demos
 * @extends Glimmer.Component
 */
export default class DeveloperDemosBoxComponent extends Component {
    variants = ['primary', 'default', 'info', 'success', 'warning', 'danger'];

    @tracked variant = 'primary';
    @tracked showHeader = true;
    @tracked showTools = true;
    @tracked showFooter = true;
    @tracked listView = false;
    @tracked noPadding = false;
    @tracked collapsed = false;

    /**
     * @method setVariant
     * @param {String} variant
     */
    @action
    setVariant(variant) {
        this.variant = variant;
    }

    /**
     * @method toggle
     * @param {String} property The tracked flag to flip
     */
    @action
    toggle(property) {
        this[property] = !this[property];
    }

    /**
     * @method reset
     */
    @action
    reset() {
        this.variant = 'primary';
        this.showHeader = true;
        this.showTools = true;
        this.showFooter = true;
        this.listView = false;
        this.noPadding = false;
        this.collapsed = false;
    }
}
