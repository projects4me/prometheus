/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Helper from '@ember/component/helper';
import { inject as service } from '@ember/service';

/**
 * This helper checks whether a given route name is the currently active route
 * or an ancestor of it. It is reactive — accessing router.currentRouteName via
 * autotracking causes the helper to recompute on every route transition.
 *
 * Special case: the top-level 'app' route (Dashboard) is treated as an exact
 * match only, since it is a parent of every other route and would otherwise
 * always return true.
 *
 * @class IsActiveRouteHelper
 * @namespace Prometheus.Helpers
 * @extends Helper
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class IsActiveRouteHelper extends Helper {

    /**
     * The router service used to read the current route name.
     *
     * @property router
     * @type Ember.Service
     * @for IsActiveRouteHelper
     * @private
     */
    @service router;

    /**
     * Returns true if the given routeName is the current route or a parent of it.
     *
     * @method compute
     * @param {Array} positional - [routeName] The route name to check.
     * @return {Boolean}
     */
    compute([routeName]) {
        const currentRouteName = this.router.currentRouteName;

        if (!routeName || !currentRouteName) {
            return false;
        }

        if (routeName === 'app') {
            return currentRouteName === 'app' || currentRouteName === 'app.index';
        }

        return currentRouteName === routeName || currentRouteName.startsWith(routeName + '.');
    }
}
