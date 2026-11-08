/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import AppRoute from 'prometheus/routes/app';

/**
 * Redirects /app/settings/ui to the first showcased component.
 *
 * @class AppSettingsUiIndexRoute
 * @namespace Prometheus.Routes
 * @module App.Settings
 * @extends AppRoute
 */
export default class AppSettingsUiIndexRoute extends AppRoute {

    /**
     * @method redirect
     * @public
     */
    redirect() {
        if (this.controllerFor('app.loading-assets').get('dataLoaded')) {
            this.router.replaceWith('app.settings.ui.quick-list');
        }
    }
}
