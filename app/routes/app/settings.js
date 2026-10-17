/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import AppRoute from 'prometheus/routes/app';
import MD from 'prometheus/utils/metadata/metadata';

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
     * The settings navigation groups from the Navigation metadata, holding only
     * the pages the user can access. Groups left without pages are dropped.
     *
     * @method model
     * @returns {Array}
     * @public
     */
    model() {
        let settingsItems = MD.create().getViewMeta('Navigation', 'settingsItems');

        return Object.entries(settingsItems)
            .map(([key, group]) => ({
                key,
                label: group.label,
                items: Object.entries(group.items)
                    .filter(([, item]) => this.acl.checkAccess(item.aclContext))
                    .map(([name, item]) => ({ name, ...item }))
            }))
            .filter(group => group.items.length > 0);
    }

    /**
     * The shell has no controller state of its own besides the navigation.
     *
     * @method setupController
     * @param {Controller} controller
     * @param {Array} model
     * @public
     */
    setupController(controller, model) {
        controller.set('model', model);
    }
}
