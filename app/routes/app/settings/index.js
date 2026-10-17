/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import AppRoute from 'prometheus/routes/app';

/**
 * Redirects /app/settings to the first settings page the user can see.
 *
 * @class AppSettingsIndexRoute
 * @namespace Prometheus.Routes
 * @module App.Settings
 * @extends AppRoute
 */
export default class AppSettingsIndexRoute extends AppRoute {

    /**
     * @method beforeModel
     * @param {Transition} transition
     * @public
     */
    beforeModel(transition) {
        super.beforeModel(transition);

        if (!this.controllerFor('app.loading-assets').get('dataLoaded')) {
            return;
        }
        let groups = this.modelFor('app.settings') ?? [];
        this.router.transitionTo(groups[0]?.items[0].route ?? 'app.access-denied');
    }
}
