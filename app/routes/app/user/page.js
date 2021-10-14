/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import App from "prometheus/routes/app";

/**
 * The user page
 *
 * @class Page
 * @namespace Prometheus.Routes
 * @module App.User
 * @extends App
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default App.extend({

    /**
     * The setupController hook.
     *
     * @method setupController
     * @param {Prometheus.Controllers.User} controller The controller object for this route
     * @private
     */
    setupController:function(controller){
        Logger.debug('+Prometheus.Routes.App.User::setupController()');

        let self = this;
        let params = self.paramsFor('app.user.page');

        let model = self.get('store').findRecord('user',params.user_id);
        controller.set('model',model);

        Logger.debug('-Prometheus.Routes.App.User::setupController()');
    },

});