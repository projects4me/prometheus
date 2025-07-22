/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import App from "prometheus/routes/app";
import format from "prometheus/utils/data/format";
import Logger from "js-logger";
import _ from 'lodash';

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
    async afterModel() {
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
        try {
            let project = await _self.store.query('project', projectOptions);
            let projectData = project.objectAt(0);
            if(projectData.issuestatuses === undefined || projectData.issuestatuses.length === 0) {
                let issueStatuses = await _self.store.query('issuestatus', {
                    query: `(Issuestatus.system : 1)`,
                    limit: -1,
                });
                projectData.issuestatuses = issueStatuses;
            }
            this.set('project', projectData);
        } catch (error) {
            _self.errorManager.handleError(error, {
                moduleName: 'project'
            })
        }
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
            project: _self.get('project'),
            projectId: _self.get('project').id,
            projectShortcode: _self.get('project').shortCode
        });

        const issueDescription = _.clone(issue.description);
        controller.set('model', issue);
        controller.set('project', _self.get('project'));
        controller.set('types', _self.get('project').issuetypes);
        controller.set('statuses', _self.get('project').issuestatuses);
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
    }
});