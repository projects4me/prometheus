/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import App from "prometheus/routes/app";

/**
 * This is the route to load the list of users.
 *
 * @class AppUserManagementRoute
 * @namespace Prometheus.Routes
 * @module App.User
 * @extends AppRoute
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class AppUserManagementRoute extends App {

    /**
     * We need to reload the model as the values related ot the page's data are
     * changed so we are relying on the queryParams provided by Ember to reload
     * the model as the following parameter are changed.
     *
     * @property queryParams
     * @type Object
     * @for AppUserManagementRoute
     * @public
     */
    queryParams = {
        query: {
            refreshModel: true,
        }
    }

    /**
     * The model hook for this route. In this function we fetch and return the list 
     * of users.
     *
     * @method model;
     * @public
     */
    model(params) {
        Logger.debug('+Prometheus.Routes.App.User.Management::model()');

        let query = params.query ? params.query : null;

        let _userOptions = {
            limit: -1,
            fields: "name,title,email,accountStatus,username",
            query: query
        };

        Logger.debug('-Prometheus.Routes.App.User.Management::model()');
        return this.store.query('user', _userOptions);
    }

    /**
     * This function is used to setup the controller for this route.
     *
     * @method setupController
     * @param {Prometheus.Controllers.Board} controller the controller object for this route
     * @param Object model
     * @public
     */
    setupController(controller, model) {
        Logger.debug('+Prometheus.Routes.App.User.Management::setupController()');

        controller.set('users', model);
    }

}
