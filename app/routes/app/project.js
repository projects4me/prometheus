/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import App from "prometheus/routes/app";
import { service } from '@ember/service';


import { objectAt } from 'prometheus/utils/array/object-at';
/**
 * The wiki route
 *
 * @class Project
 * @namespace Prometheus.Routes
 * @module App
 * @extends App
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default class ProjectRoute extends App {

    /**
     * The trackedProject service provides id of the selected project.
     *
     * @property trackedProject
     * @type Ember.Service
     * @for Project
     * @private
     */
    @service trackedProject;

    /**
     * The beforeModel hook of the ember.js. In this hook we're loading the project and its members.
     * 
     * @method beforeModel
     * @param {Transition} transition
     * @private
     */
    async beforeModel(transition) {
        let _self = this;
        _self.project = undefined;
        _self.members = undefined;
        _self.issuetypes = undefined;
        _self.issues = [];
        _self.issuesProjectId = undefined;
        _self.issuestatuses = undefined;
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
                return;
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

        // a newer transition superseded this one while the project was loading: don't touch route or service state
        if (transition.isAborted) {
            return;
        }

        let record = objectAt(project, 0);

        // no project matches the short code (or the query failed, already reported above): leave no stale state
        // behind and go to the project list, so no child route loads with the previous project's id
        if (record == undefined) {
            this.breadcrumb.setTitle(this.routeName, undefined);
            transition.abort();
            this.router.transitionTo('app.projects');
            return;
        }

        let issuestatuses = record.get('issuestatuses');
        if (issuestatuses.length === 0) {
            issuestatuses = await this.store.query('issuestatus', {
                query: `(Issuestatus.system : 1)`,
                limit: -1,
            });
            if (transition.isAborted) {
                return;
            }
        }

        _self.project = record;
        _self.issuestatuses = issuestatuses;
        if (record.get('members') != undefined) {
            _self.members = record.get('members');
            _self.issuetypes = record.get('issuetypes');
        }

        // set projectId in trackedProject service
        _self.trackedProject.setProjectId(record.id);

        this.breadcrumb.setTitle(this.routeName, record.get('name'));
    }

    afterModel() {
        let _self = this;
        if (_self.project == undefined) {
            return;
        }
        let projectId = _self.trackedProject.getProjectId();

        let issuesOptions = {
            fields: "Issue.id,Issue.subject,Issue.issueNumber,Issue.statusId,Issue.projectId",
            query: "(Issue.projectId : " + projectId + ")",
            sort: "Issue.issueNumber",
            order: "ASC",
            page: 0,
            limit: -1,
        };

        // Start from an empty list when the project changed, so another project's issues are never shown
        if (_self.issuesProjectId !== projectId) {
            _self.issues = [];
        }
        _self.issuesProjectId = projectId;
        _self.issuesRequestSeq = (_self.issuesRequestSeq || 0) + 1;
        let requestSeq = _self.issuesRequestSeq;

        // Not returned: nested routes must not wait for the all-issues preload
        _self.issuesRequest = _self.store.query('issue', issuesOptions).then(function (issues) {
            // Ignore a result of an older request or one that arrives after the user left the project
            if (_self.isDestroying || requestSeq !== _self.issuesRequestSeq) {
                return;
            }
            _self.issues = issues;
            let controller = _self.controllerFor('app.project');
            if (controller.get('projectId') === projectId) {
                controller.set('issues', issues);
            }
        }).catch((error) => {
            _self.errorManager.handleError(error, {
                moduleName: "project"
            });
        });
    }

    /**
     * The setup controller function that will be called every time the user visits
     * the route, this function is responsible for loading the required data
     *
     * @method setupController
     * @param {Prometheus.Controllers.Project} controller the controller object for this route
     * @private
     */
    setupController(controller) {
        Logger.debug('AppProjectRoute::setupController');
        let _self = this;

        let project = this.project;
        controller.set('model', project);
        controller.set('projectId', project?.id);
        controller.set('projectName', project?.get('name'));

        controller.set('issues', _self.issues);
        controller.set('members', _self.members);
        controller.set('issueStatuses', _self.issuestatuses);
        controller.set('issuetypes', _self.issuetypes);
    }
}
