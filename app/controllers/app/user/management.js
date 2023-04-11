/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import PrometheusListController from "prometheus/controllers/prometheus/list";
import { action } from '@ember/object';

/**
 * The controller for user management page.
 *
 * @class AppUserManagementController
 * @namespace Prometheus.Controllers
 * @module App.Users
 * @extends Prometheus
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class AppUserManagementController extends PrometheusListController {

    /**
     * This function is used to search the user by its name.
     *
     * @method searchUserByName
     * @public
     */
    @action searchUserByName(query) {
        let updatedQuery = `((User.name CONTAINS ${query}))`;

        //this.query is present inside PrometheusList controller
        this.set('query', updatedQuery);
    }

}
