/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import App from "prometheus/routes/app";
import { hash } from 'rsvp';
import ENV from "prometheus/config/environment";

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
            rels: 'badgeLevels,badges,projects'
        }

        let _issueOptions = {
            query: `(Issue.assignee : ${params.user_id})`,
            rels: 'issuestatus,spent'
        }

        let currentDate = moment().format(ENV.app.dateFormat);
        let _commentOptions = {
            query: `(Comment.createdUser : ${params.user_id}) AND (Comment.dateCreated CONTAINS ${currentDate})`,
            rels: 'none',
            limit: -1
        }

        Logger.debug('-Prometheus.Routes.App.User::afterModel()');
        return hash({
            issues: _self.store.query('issue', _issueOptions),
            user: _self.store.query('user', _userOptions),
            comments: _self.store.query('comment', _commentOptions)
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
        controller.set('issues', model.issues);
        controller.set('comments', model.comments);
        Logger.debug('-Prometheus.Routes.App.User::setupController()');
    }
});