/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import App from "prometheus/routes/app";
import { hashSettled } from 'rsvp';
import extractHashSettled from 'prometheus/utils/rsvp/extract-hash-settled';

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
        Logger.debug('+Prometheus.Routes.App.User::model()');
        let _self = this;
        const userId = params.user_id;

        let _userOptions = {
            query: `(User.id : ${userId})`,
            rels: 'badgeLevels,badges,timeSpent,projects,openClosedProject,openClosedIssue,collaboration,latestProjects,latestIssues,mostWorkedMembers,recentActivities',
            limit: -1
        };

        let _skillOptions = {
            query: `(Userskill.userId : ${userId})`,
            limit: -1
        };

        let _qualificationOptions = {
            query: `(Userqualification.userId : ${userId})`,
            sort: 'completionYear',
            order: 'DESC',
            limit: -1
        };

        Logger.debug('-Prometheus.Routes.App.User::model()');

        return hashSettled({
            user: _self.store.query('user', _userOptions),
            skills: _self.store.query('userskill', _skillOptions),
            qualifications: _self.store.query('userqualification', _qualificationOptions)
        }).then((results) => {
            return extractHashSettled(results, 'user');
        }).catch((error) => {
            _self.errorManager.handleError(error, {
                moduleName: 'user'
            });
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

        const user = model.user.objectAt(0);
        const skills = model.skills?.toArray?.() ?? model.skills ?? [];
        const qualifications = model.qualifications?.toArray?.() ?? model.qualifications ?? [];

        user.skills.pushObjects(skills);
        user.qualifications.pushObjects(qualifications);

        controller.set('model', user);
        this.breadcrumb.setTitle(this.routeName, user.get('name'));

        Logger.debug('-Prometheus.Routes.App.User::setupController()');
    }
});
