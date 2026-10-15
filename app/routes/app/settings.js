/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import AppRoute from 'prometheus/routes/app';

/**
 * The Settings area shell. Guards the whole area with the route ACL so a user
 * without `setting.read` is sent to the access-denied page.
 *
 * @class AppSettingsRoute
 * @namespace Prometheus.Routes
 * @module App.Settings
 * @extends AppRoute
 */
export default class AppSettingsRoute extends AppRoute {

    /**
     * Denies access to users without permission, once the application assets
     * (and so the user's permissions) have been loaded.
     *
     * @method beforeModel
     * @param {Transition} transition
     * @public
     */
    beforeModel(transition) {
        super.beforeModel(transition);

        if (this.controllerFor('app.loading-assets').get('dataLoaded')
            && !this.acl.hasRouteAccess(this.routeName)) {
            this.router.transitionTo('app.access-denied');
        }
    }

    /**
     * The shell has no model or controller state of its own; the pages set up theirs.
     *
     * @method setupController
     * @public
     */
    setupController() {}
}
