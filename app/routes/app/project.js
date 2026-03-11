/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import App from "prometheus/routes/app";
import { hashSettled } from 'rsvp';
import extractHashSettled from 'prometheus/utils/rsvp/extract-hash-settled';
import { inject } from '@ember/service';


/**
 * The wiki route
 *
 * @class Project
 * @namespace Prometheus.Routes
 * @module App
 * @extends App
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default App.extend({

    /**
     * The trackedProject service provides id of the selected project.
     *
     * @property trackedProject
     * @type Ember.Service
     * @for Project
     * @private
     */
    trackedProject: inject(),

    /**
     * The beforeModel hook of the ember.js. In this hook we're loading the project and its members.
     * 
     * @method beforeModel
     * @param {Transition} transition
     * @private
     */
    async beforeModel(transition) {
        let _self = this;
        let projectShortCode = _self.paramsFor('app.project')?.shortcode;
        if(projectShortCode == undefined) {
            projectShortCode = _self.trackedProject.shortCode;

            // if projectShortCode is still undefined, then show error message and abort transition
            if(projectShortCode == undefined) {
                new Messenger().post({
                    message: _self.intl.t('views.nav.error.selectProjectFirst'),
                    type: "error",
                    showCloseButton: true
                });
                transition.abort();
            }
        }

        let projectOptions = {
            query: "(Project.shortCode : " + projectShortCode + ")",
            rels: "members,issuestatuses,issuetypes",
            sort: "members.name",
            order: "ASC",
            page: 0,
            limit: -1,
        };
        
        let project = await this.store.query('project', projectOptions).catch((error) => {
            _self.errorManager.handleError(error, {
                moduleName: "project"
            });
        });

        if (project.objectAt(0) != undefined &&
            project.objectAt(0).get('members') != undefined) {
            _self.set('members', project.objectAt(0).get('members'));
            _self.set('issuetypes', project.objectAt(0).get('issuetypes'));
        }

        if (project.objectAt(0) != undefined &&
            project.objectAt(0).get('issuestatuses').length !== 0) {
            _self.set('issuestatuses', project.objectAt(0).get('issuestatuses'));
        } else {
            let issueStatuses = await this.store.query('issuestatus', {
                query: `(Issuestatus.system : 1)`,
                limit: -1,
            });
            _self.set('issuestatuses', issueStatuses);
        }

        // set projectId in trackedProject service
        let projectId = project.objectAt(0).id;
        _self.trackedProject.setProjectId(projectId);

        this.breadcrumb.setTitle(this.routeName, project.objectAt(0).get('name'));
    },

    afterModel() {
        let _self = this;
        let projectId = _self.trackedProject.getProjectId();

        let issuesOptions = {
            fields: "Issue.id,Issue.subject,Issue.issueNumber,Issue.statusId,Issue.projectId",
            query: "(Issue.projectId : " + projectId + ")",
            sort: "Issue.issueNumber",
            order: "ASC",
            page: 0,
            limit: -1,
        };

        return hashSettled({
            issues: _self.store.query('issue', issuesOptions),
        }).then(function (results) {
            let data = extractHashSettled(results);
            _self.set('issues', data.issues);
        }).catch((error) => {
            _self.errorManager.handleError(error, {
                moduleName: "project"
            });
        });
    },

    /**
     * The setup controller function that will be called every time the user visits
     * the route, this function is responsible for loading the required data
     *
     * @method setupController
     * @param {Prometheus.Controllers.Project} controller the controller object for this route
     * @private
     */
    setupController: function (controller) {
        Logger.debug('AppProjectRoute::setupController');
        let _self = this;

        let projectId = this.trackedProject.getProjectId();
        let projectName = null;

        let options = {
            fields: "Project.id,Project.name",
            query: "(Project.id : " + projectId + ")",
            order: 'ASC',
            limit: 1
        };

        _self.store.query('project', options).then(function (data) {
            if (projectId !== null) {
                projectName = data.findBy('id', projectId).get('name');
                controller.set('projectId', projectId);
                controller.set('projectName', projectName);
            }
            controller.set('model', data.objectAt(0));
        });

        controller.set('issues', _self.get('issues'));
        controller.set('members', _self.get('members'));
        controller.set('issueStatuses', _self.get('issuestatuses'));
        controller.set('issuetypes', _self.get('issuetypes'));
    },

});