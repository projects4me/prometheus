/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/**
 * Whether a route is the current route or an ancestor of it. The top-level `app` route (Dashboard) matches only
 * exactly, since it is a parent of every other route and would otherwise always match.
 *
 * @method isActiveRoute
 * @param {String} routeName The route to check
 * @param {String} currentRouteName The router's current route name
 * @return {Boolean}
 * @public
 */
export function isActiveRoute(routeName, currentRouteName) {
    if (!routeName || !currentRouteName) {
        return false;
    }

    if (routeName === 'app') {
        return currentRouteName === 'app' || currentRouteName === 'app.index';
    }

    return currentRouteName === routeName || currentRouteName.startsWith(routeName + '.');
}
