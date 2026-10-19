/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import AppRoute from 'prometheus/routes/app';

/**
 * The Email page of the Settings area. Loads the `email` group of settings.
 *
 * @class AppSettingsEmailRoute
 * @namespace Prometheus.Routes
 * @module App.Settings
 * @extends AppRoute
 */
export default class AppSettingsEmailRoute extends AppRoute {

    /**
     * Fetches the settings of the email group.
     *
     * @method model
     * @returns {Promise}
     * @public
     */
    model() {
        return this.store.query('setting', {
            query: '(Setting.groupName : email)',
            limit: -1
        }).catch((error) => {
            this.errorManager.handleError(error, {
                moduleName: 'setting'
            });
        });
    }

    /**
     * Hands the settings to the controller, which builds the form from them.
     *
     * @method setupController
     * @param {Prometheus.Controllers.App.Settings.Email} controller
     * @param {Array} model
     * @public
     */
    setupController(controller, model) {
        controller.set('model', model);
        controller.loadSettings(model ? model.toArray() : []);
    }
}
