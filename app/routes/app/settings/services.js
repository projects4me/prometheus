/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import AppRoute from 'prometheus/routes/app';
import { hash } from 'rsvp';

/**
 * The Services page of the Settings area. Loads the service clients, the enrollment requests and the enrollment tokens.
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
        return hash({
            serviceClients: this.query('serviceclient', 'Serviceclient.name', 'ASC'),
            enrollments: this.query('serviceenrollment', 'Serviceenrollment.dateCreated', 'DESC'),
            tokens: this.query('serviceenrollmenttoken', 'Serviceenrollmenttoken.dateCreated', 'DESC')
        });
    }

    /**
     * Queries one kind of record. A failed query reports the error and leaves
     * that box of the page empty instead of failing the whole page.
     *
     * @method query
     * @param {String} modelName
     * @param {String} sort
     * @param {String} order
     * @returns {Promise}
     * @private
     */
    query(modelName, sort, order) {
        return this.store.query(modelName, { sort, order, limit: -1 }).catch((error) => {
            this.errorManager.handleError(error, { moduleName: modelName });
            return [];
        });
    }

    /**
     * Hands the records to the controller and closes any open confirmation.
     *
     * @method setupController
     * @param {Prometheus.Controllers.App.Settings.Services} controller
     * @param {Object} model
     * @public
     */
    setupController(controller, model) {
        controller.set('model', model);
        controller.reset();
    }

    /**
     * Drops the one-time token secret from memory when the user leaves the page.
     *
     * @method resetController
     * @param {Prometheus.Controllers.App.Settings.Services} controller
     * @public
     */
    resetController(controller) {
        controller.reset();
    }
}
