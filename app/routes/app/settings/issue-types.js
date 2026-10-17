/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import AppRoute from 'prometheus/routes/app';

/**
 * The Issue Types page of the Settings area. Loads the default (system) issue
 * types that are copied into new projects.
 *
 * @class AppSettingsIssueTypesRoute
 * @namespace Prometheus.Routes
 * @module App.Settings
 * @extends AppRoute
 */
export default class AppSettingsIssueTypesRoute extends AppRoute {

    /**
     * Fetches the default issue types along with the number of projects using
     * a type of the same name.
     *
     * @method model
     * @returns {Promise}
     * @public
     */
    model() {
        return this.store.query('issuetype', {
            query: '(Issuetype.system : 1)',
            projectCount: true,
            sort: 'Issuetype.name',
            order: 'ASC',
            limit: -1
        }).catch((error) => {
            this.errorManager.handleError(error, {
                moduleName: 'issuetype'
            });
        });
    }

    /**
     * Hands the types to the controller and resets its editing state.
     *
     * @method setupController
     * @param {Prometheus.Controllers.App.Settings.IssueTypes} controller
     * @param {Array} model
     * @public
     */
    setupController(controller, model) {
        controller.set('model', model);
        controller.set('issueTypes', model ? model.toArray() : []);
        controller.set('editing', null);
    }
}
