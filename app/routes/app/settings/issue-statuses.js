/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import AppRoute from 'prometheus/routes/app';

/**
 * The Issue Statuses page of the Settings area. Loads the global (system)
 * issue statuses in their task board order.
 *
 * @class AppSettingsIssueStatusesRoute
 * @namespace Prometheus.Routes
 * @module App.Settings
 * @extends AppRoute
 */
export default class AppSettingsIssueStatusesRoute extends AppRoute {

    /**
     * Fetches the global issue statuses along with the number of issues using
     * each of them.
     *
     * @method model
     * @returns {Promise}
     * @public
     */
    model() {
        return this.store.query('issuestatus', {
            query: '(Issuestatus.system : 1)',
            issueCount: true,
            sort: 'Issuestatus.sortOrder',
            order: 'ASC',
            limit: -1
        }).catch((error) => {
            this.errorManager.handleError(error, {
                moduleName: 'issuestatus'
            });
        });
    }

    /**
     * Hands the statuses to the controller and resets its editing state.
     *
     * @method setupController
     * @param {Prometheus.Controllers.App.Settings.IssueStatuses} controller
     * @param {Array} model
     * @public
     */
    setupController(controller, model) {
        controller.set('model', model);
        controller.set('issueStatuses', model ? model.toArray() : []);
        controller.set('editing', null);
    }
}
