/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import App from 'prometheus/routes/app';
import { inject as service } from '@ember/service';
import { hash, hashSettled } from 'rsvp';
import UrlState from 'prometheus/utils/state/url-state';
import { BROWSER_PARAMS, browserValues } from 'prometheus/utils/role/browser-defaults';

/**
 * The roles route, it loads the first page of the role browser; later pages, sorts and searches reload only the list
 * through the controller's UrlState and ListLoader, which also loads the coverage and members of the listed roles
 *
 * @class AppRoleRoute
 * @namespace Prometheus.Routes
 * @module App.Role
 * @extends App
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class AppRoleRoute extends App {
    /**
     * The ezSearch schema builder.
     *
     * @property querySchema
     * @type Ember.Service
     * @public
     */
    @service('query-schema') querySchema;

    /**
     * The saved searches service.
     *
     * @property savedSearch
     * @type Ember.Service
     * @public
     */
    @service('saved-search') savedSearch;

    /**
     * No query param refreshes the route: the controller reloads only the list when one changes the list request.
     *
     * @property queryParams
     * @type Object
     */
    queryParams = {
        ...UrlState.queryParamsConfig(BROWSER_PARAMS),
        searchId: { refreshModel: false }
    };

    /**
     * Loads the first page of the roles for the query params, with the controller's request
     *
     * @method model
     * @param {Object} params The query params
     * @returns {Promise<Object>} The params and the first page (`{ records }` or `{ error }`)
     * @protected
     */
    model(params) {
        Logger.debug('AppRoleRoute::model');
        let controller = this.controllerFor('app.role');
        let values = browserValues(params);
        return hash({ values, firstPage: this.loadFirstPage(controller, values) });
    }

    /**
     * Loads the ezSearch schema and the saved searches of the roles once per visit; a failure only drops the search
     *
     * @method afterModel
     * @returns {Promise}
     * @protected
     */
    async afterModel() {
        if (this.searchData) {
            return;
        }
        let results = await hashSettled({
            schema: this.querySchema.load('Role'),
            savedsearches: this.savedSearch.load('role')
        });
        if (results.schema.state === 'rejected') {
            this.errorManager.handleError(results.schema.reason, { moduleName: 'role' });
        }
        this.searchData = {
            schema: results.schema.state === 'fulfilled' ? results.schema.value : null,
            savedsearches: results.savedsearches.state === 'fulfilled' ? results.savedsearches.value : []
        };
    }

    /**
     * Queries the first page of the roles with the controller's list request; a failure is handed to the controller,
     * whose list shows the error and a retry instead of the whole page failing
     *
     * @method loadFirstPage
     * @param {Controller} controller
     * @param {Object} values The browser params
     * @returns {Promise<Object>} `{ records }` or `{ error }`
     * @public
     */
    async loadFirstPage(controller, values) {
        try {
            return { records: await this.store.query('role', controller.roleList.request(values)) };
        } catch (error) {
            return { error };
        }
    }

    /**
     * Hands the search data, the first page and a new role for the add-role dialog to the controller
     *
     * @method setupController
     * @param {Prometheus.Controllers.App.Role} controller
     * @param {Object} model The params and the first page
     * @protected
     */
    setupController(controller, model) {
        controller.querySchema = this.searchData?.schema ?? null;
        controller.savedsearches = this.searchData?.savedsearches ?? [];
        controller.newSavedsearch = controller.newSavedsearch || this.store.createRecord('savedsearch');
        controller.newRole = this.store.createRecord('role', {});
        controller.showFirstPage(model?.values, model?.firstPage);
    }

    /**
     * Puts the browser back to its defaults when the roles area is left
     *
     * @method resetController
     * @param {Controller} controller
     * @param {Boolean} isExiting
     * @protected
     */
    resetController(controller, isExiting) {
        controller.resetBrowser();
        if (isExiting) {
            this.searchData = null;
        }
    }
}
