/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import EzSearchBase from './base';

/**
 * The width of the component's own box below which its buttons show only their icons.
 */
export const NARROW_WIDTH = 560;

/**
 * ezSearch: one query tree edited live by the search bar and the visual builder, with the list toolbar
 * around them. All state and actions live in {{#crossLink "Prometheus.Components.EzSearchBase"}}{{/crossLink}};
 * this class pairs them with the toolbar template and decides whether the toolbar is narrow: below
 * NARROW_WIDTH of its own width the buttons drop their labels so the input keeps the space. `@narrow`
 * (true or false) forces the mode.
 *
 * @class EzSearch
 * @namespace Prometheus.Components
 * @extends EzSearchBase
 */
export default class EzSearchComponent extends EzSearchBase {
    @tracked measuredNarrow = false;

    get isNarrow() {
        return typeof this.args.narrow === 'boolean' ? this.args.narrow : this.measuredNarrow;
    }

    /**
     * The icon-only Saved Searches button's title: the saved search's name, or the button's label.
     */
    get savedTitle() {
        return this.pickedSearch?.name || this.intl.t('views.app.issue.list.savedsearch.label');
    }

    @action
    onWidth(width) {
        if (this.isDestroying || this.isDestroyed) {
            return;
        }
        this.measuredNarrow = width < NARROW_WIDTH;
    }
}
