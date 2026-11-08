/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import AppRoute from 'prometheus/routes/app';

/**
 * The Developer Component Library shell. Guards the whole section with the
 * route ACL so a user without `setting.read` is sent to the access-denied page.
 *
 * @class AppDeveloperRoute
 * @namespace Prometheus.Routes
 * @module App.Developer
 * @extends AppRoute
 */
export default class AppDeveloperRoute extends AppRoute {

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
     * The shell has no model; the Components box reads the registry itself.
     *
     * @method model
     * @returns {null}
     * @public
     */
    model() {
        return null;
    }

    /**
     * The shell needs none of the users, roles and projects that AppRoute
     * hands to its controller.
     *
     * @method setupController
     * @param {Controller} controller
     * @param {*} model
     * @public
     */
    setupController(controller, model) {
        controller.set('model', model);
    }
}
