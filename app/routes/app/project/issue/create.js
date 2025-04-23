/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import App from "prometheus/routes/app";
import { hashSettled } from 'rsvp';
import extractHashSettled from 'prometheus/utils/rsvp/extract-hash-settled';
import format from "prometheus/utils/data/format";
import Logger from "js-logger";
import _ from 'lodash';
import { inject } from '@ember/service';

/**
 * This is the route that will handle the creation of new issues
 *
 * @class Create
 * @namespace Prometheus.Routes
 * @module App.Project.Issue
 * @extends App
 * @author Hammad Hassan <gollomer@gamil.com>
 */
export default App.extend({    

    /**
     * We are using dynamic segments and since model is not called
     * again for a route that is using dynamic segment we are relying
     * on the afterModel hook so that the controller waits since we
     * return a Promise.
     *
     * @method model
     * @param {Object} params
     * @return Prometheus.Issue
     * @private
     */
    afterModel() {
        Logger.debug('Prometheus.Routes.App.Project.Issue.Create::afterModel()');
        let _self = this;
        let projectId = _self.trackedProject.getProjectId();

        let projectOptions = {
            query: "(Project.id : " + projectId + ")",
            rels: 'members,milestones,issuetypes,issuestatuses',
            sort: "members.name",
            limit: -1
        };

        Logger.debug('-Prometheus.Routes.App.Project.Issue.Create::afterModel()');

        return hashSettled({
            project: _self.store.query('project', projectOptions)
        }).then(function (results) {
            let data = extractHashSettled(results, 'project');
            Logger.debug(data);
            _self.set('project', data.project.objectAt(0));
            _self.set('types', data.project.firstObject.issuetypes);
            _self.set('statuses', data.project.firstObject.issuestatuses);
        }).catch((error) => {
            _self.errorManager.handleError(error, {
                moduleName: 'project'
            })
        });
    },

    /**
     * This function is called by the route when it has created the controller and
     * the controller is ready to be setup with any data that we may need. We are
     * using this function in order to bind the model of the route to the model
     * of the controller.
     *
     * The setup controller is only called once and if the model is changed Ember
     * reflects the change in the controller as well.
     *
     * @method setupController
     * @param {Prometheus.Controllers.Issue} controller The controller object for the issues
     * @private
     */
    setupController: function (controller) {
        Logger.debug('Prometheus.Routes.App.Project.Issue.Create::setupController');

        let _self = this;
        let issue = _self.store.createRecord('issue', {
            assignee: _self.currentUser.user.id,
            owner: _self.currentUser.user.id,
            project: _self.project,
            projectId: _self.project.id
        });

        const issueDescription = _.clone(issue.description);
        controller.set('model', issue);
        controller.set('project', _self.get('project'));
        controller.set('types', _self.get('types'));
        controller.set('statuses', _self.get('statuses'));
        controller.set('issueDescription', issueDescription);

        let priority = (new format(this)).getList('views.app.issue.lists.priority');
        controller.set('priority', priority);

        Logger.debug('-Prometheus.Routes.App.Project.Issue.Create::setupController');
    },

    /**
     * This function is trigged on route exit. So on route exit we're destroying empty model of issue.
     *
     * @method resetController
     * @param {Prometheus.Controllers.Issue} controller The controller object for the issues
     * @param {boolean} isExiting It returns boolean value telling that route is exiting or not.
     * @param {object} transition It gives us transition object in order to get current route name.
     * @private
     */
    resetController(controller, isExiting, transition) {
        if (isExiting && transition.targetName !== 'error') {
            if (!controller.model.id) {
                controller.model.destroyRecord();
            }
        }
    },
    actions: {
        /**
         * This event is triggered when user attempt to transition to another route. In this we're unloading
         * issue statuses model from the ember store. Because when user will navigate from this route to
         * project/board route, where we're again fetching the issue statuses against the same project, then
         * store will use the loaded issue status models against the same xhr call. The issue status models 
         * names are translated, that's we can't use these in board. So that's the reason of unloading the issue
         * status records.
         * 
         * @event willTransition
         * @public
         */
        willTransition() {
            this.controller.statuses.forEach((status) => {
                status.unloadRecord();
            });
        }
    }
});