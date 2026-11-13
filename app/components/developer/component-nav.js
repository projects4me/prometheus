/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import defaultRegistry from 'prometheus/utils/developer/component-registry';

/**
 * The Components box of the Developer Component Library: lists the registry
 * entries by group, filters them by label or summary as the developer types
 * and marks the entry of the current route.
 *
 * @class DeveloperComponentNavComponent
 * @namespace Prometheus.Components.Developer
 * @module Developer
 * @extends Component
 */
export default class DeveloperComponentNavComponent extends Component {

    @service router;

    /**
     * The text the entries are filtered by.
     *
     * @property filter
     * @type {string}
     * @public
     */
    @tracked filter = '';

    /**
     * The registry to list; `@registry` overrides the application's registry.
     *
     * @property registry
     * @type {ComponentRegistry}
     * @public
     */
    get registry() {
        return this.args.registry || defaultRegistry;
    }

    /**
     * The name of the entry on screen: `@active`, or else the `:name` of the
     * current Developer entry route.
     *
     * @property active
     * @type {string|null}
     * @public
     */
    get active() {
        if (this.args.active !== undefined) {
            return this.args.active;
        }
        let route = this.router.currentRoute;
        return route && route.name === 'app.developer.component' ? route.params.name : null;
    }

    /**
     * The number of registered entries, regardless of the filter.
     *
     * @property count
     * @type {number}
     * @public
     */
    get count() {
        return this.registry.entries.length;
    }

    /**
     * The entries matching the filter, by group.
     *
     * @property groups
     * @type {Array<{group: string, entries: Array<Object>}>}
     * @public
     */
    get groups() {
        return this.registry.grouped(this.filter);
    }

    /**
     * @method updateFilter
     * @param {string} value
     * @public
     */
    @action
    updateFilter(value) {
        this.filter = value || '';
    }
}
