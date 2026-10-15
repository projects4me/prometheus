/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import AppRoute from 'prometheus/routes/app';
import { inject as service } from '@ember/service';

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
     * Provides the first page the user can see.
     *
     * @property settingsNavigation
     * @type Ember.Service
     * @private
     */
    @service settingsNavigation;

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
        this.router.transitionTo(this.settingsNavigation.firstRoute ?? 'app.access-denied');
    }
}
