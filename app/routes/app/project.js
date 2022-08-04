/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import App from "prometheus/routes/app";
import { hash } from 'rsvp';
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
     * The project Id
     *
     * @property projectId
     * @type String
     * @for Project
     * @private
     */
    projectId: null,

    afterModel() {
        let _self = this;
        let projectId = _self.paramsFor('app.project').project_id;
        if (projectId === undefined && _self.context !== undefined) {
            projectId = _self.trackedProject.getProjectId();
        }

        let issuesOptions = {
            fields: "Issue.id,Issue.subject,Issue.issueNumber,Issue.statusId,Issue.projectId",
            query: "(Issue.projectId : "+projectId+")",
            rels: "none",
            sort: "Issue.issueNumber",
            order: "ASC",
            page: 0,
            limit:-1,
        };

        let projectOptions = {
            query: "(Project.id : "+projectId+")",
            rels: "members",
            sort: "members.name",
            order: "ASC",
            page: 0,
            limit:-1,
        };

        return hash({
            issues: _self.store.query('issue',issuesOptions),
            project: _self.store.query('project',projectOptions)
        }).then(function(results){
            _self.set('issues',results.issues);
            if (results.project.objectAt(0) != undefined &&
                results.project.objectAt(0).get('members') != undefined) {
                _self.set('members', results.project.objectAt(0).get('members'));
            }
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
    setupController:function(controller){
        Logger.debug('AppProjectRoute::setupController');
        let _self = this;

        // If the user navigated directly to the wiki project or page then lets setup the project id
        let projectId = this.paramsFor('app.project').project_id;
        //setting up "projectId" property of "trackedProject" service in order to use that projectId in other parts of application
        this.trackedProject.setProjectId(projectId);
        let projectName = null;

        let options = {
            fields: "Project.id,Project.name",
            query: "(Project.id : "+projectId+")",
            rels : 'none',
            order: 'ASC',
            limit: 1
        };

        _self.store.query('project',options).then(function(data){
            if (projectId !== null)
            {
                projectName = data.findBy('id',projectId).get('name');
                controller.set('projectId',projectId);
                controller.set('projectName',projectName);
            }
            controller.set('model',data.objectAt(0));
        });

        controller.set('issues',_self.get('issues'));
        controller.set('members',_self.get('members'));
    },

});