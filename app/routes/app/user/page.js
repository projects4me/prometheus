/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import App from "prometheus/routes/app";
import { hash } from 'rsvp';

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
    model(params) {
        Logger.debug('+Prometheus.Routes.App.User::afterModel()');
        let _self = this;
        let _userOptions = {
            query: `(User.id : ${params.user_id})`,
            rels: 'none'
        }

        let _scoreBoardOptions = {
            query: `(Scoreboard.userId : ${params.user_id})`,
            rels: 'userBadgeLevel,userBadge'
        }

        Logger.debug('-Prometheus.Routes.App.User::afterModel()');
        return hash({
            user: _self.store.query('user', _userOptions),
            scoreboard: _self.store.query('scoreboard', _scoreBoardOptions)
        });
    },
    /**
     * The setupController hook.
     *
     * @method setupController
     * @param {Prometheus.Controllers.User} controller The controller object for this route
     * @private
     */
    setupController: function (controller, model) {
        Logger.debug('+Prometheus.Routes.App.User::setupController()');
        controller.set('model', model.user.objectAt(0));
        controller.set('scoreboards', model.scoreboard);

        Logger.debug('-Prometheus.Routes.App.User::setupController()');
    }

});