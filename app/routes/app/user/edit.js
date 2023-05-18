/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import AppRoute from 'prometheus/routes/app';

/**
 * The route to edit a user.
 *
 * @class AppUserEditRoute
 * @namespace Prometheus.Routes
 * @module App.User
 * @extends AppRoute
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class AppUserEditRoute extends AppRoute {
    /**
     * The model hook for this route. In this function returns a user that we want to edit.
     *
     * @method model;
     * @public
     */
    model(params) {
        let _userOptions = {
            query: `((User.id : ${params.user_id}))`
        };

        return this.store.query('user', _userOptions);
    }

    /**
     * This function is used to setup the controller for this route.
     *
     * @method setupController
     * @param {AppUserEditController} controller the controller object for this route
     * @param Object model
     * @public
     */
    setupController(controller, model) {
        controller.set('model', model.objectAt(0));

        //set username for validation
        controller.set('username', model.objectAt(0).username);
    }
}