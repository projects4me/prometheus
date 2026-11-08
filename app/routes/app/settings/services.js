/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import AppRoute from 'prometheus/routes/app';

/**
 * The Services page of the Settings area. Loads the service clients.
 *
 * @class AppSettingsServicesRoute
 * @namespace Prometheus.Routes
 * @module App.Settings
 * @extends AppRoute
 */
export default class AppSettingsServicesRoute extends AppRoute {

    /**
     * Fetches the service clients.
     *
     * @method model
     * @returns {Promise}
     * @public
     */
    model() {
        return this.store.query('serviceclient', {
            sort: 'Serviceclient.name',
            order: 'ASC',
            limit: -1
        }).catch((error) => {
            this.errorManager.handleError(error, {
                moduleName: 'serviceclient'
            });
        });
    }

    /**
     * Hands the service clients to the controller and closes any open confirmation.
     *
     * @method setupController
     * @param {Prometheus.Controllers.App.Settings.Services} controller
     * @param {Array} model
     * @public
     */
    setupController(controller, model) {
        controller.set('model', model);
        controller.set('confirming', null);
    }
}
