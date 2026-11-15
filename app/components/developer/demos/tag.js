/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { QUICK_LIST_FIXTURE_TAGS } from 'prometheus/utils/dev/quick-list-fixture';

/**
 * The AppUi::Tag demo of the Component Library: the tags and the colour variants.
 *
 * @class DeveloperDemosTagComponent
 * @namespace Prometheus.Components.Developer.Demos
 * @extends Glimmer.Component
 */
export default class DeveloperDemosTagComponent extends Component {
    tags = QUICK_LIST_FIXTURE_TAGS;

    variants = ['default', 'primary', 'success', 'info', 'warning', 'danger'];

    /**
     * Nothing to reset: the demo has no state.
     *
     * @method reset
     */
    @action
    reset() {}
}
