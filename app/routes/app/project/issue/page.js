/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import App from "prometheus/routes/app";
import { inject } from '@ember/service';

/**
 * The issues route
 *
 * @class Page
 * @namespace Prometheus.Routes
 * @module App.Project.Issue
 * @extends App
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default App.extend({

    /**
     * The trackedProject service provides id of the selected project.
     *
     * @property trackedProject
     * @type Ember.Service
     * @for ProjectIssuePageRoute
     * @private
     */
    trackedProject: inject(),

    /**
     * Query params that the route supports.
     * 
     * @property queryParams
     * @type Array
     * @for AppProjectIssuePageRoute
     * @public
     */
    queryParams: {
        s_id: {
            refreshModel: false
        }
    },

    /**
     * The model hook for this route. In this function we fetch and return issue by the 
     * provided issue number.
     * 
     * @returns {Promise}
     */
    async model() {
        Logger.debug('AppProjectIssuePageRoute::model()');

        let _self = this;
        let params = _self.paramsFor('app.project.issue.page');
        _self.set('breadCrumb', { title: '#' + params.issue_number, record: true });

        Logger.debug('-AppProjectIssuePageRoute::model()');
        return await _self.loadIssue(params);
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
    * @param {Prometheus.Models.Issue} model The model that is created by this route
    * @private
    */
    async setupController(controller, model) {
        Logger.debug('AppProjectIssuePageRoute::setupController');
        let issue = model.issue.objectAt(0);
        let project = model.project.objectAt(0);
        let _self = this;
        _self.setupActivities(controller, issue);
        let timelog = _self.store.createRecord('timelog');

        controller.set('newTimeLog', timelog);
        controller.set('issue', issue);
        controller.set('issueStatuses', project?.issuestatuses);
        controller.set('issueTypes', project?.issuetypes || []);
        Logger.debug('-AppProjectIssuePageRoute::setupController');
    },

    /**
     * This function load the issue
     *
     * @param {Prometheus.Controllers.Issue} controller
     * @param {Object} params
     */
    async loadIssue(params) {
        let _self = this;
        let projectId = _self.trackedProject.getProjectId();
        let options = {
            query: `((Issue.issueNumber : ${params.issue_number}) AND (Issue.projectId : ${projectId}))`,
            sort: 'Issue.issueNumber,comments.dateCreated',
            order: 'ASC',
            rels: 'comments,activities,parentissue,assignedTo,ownedBy,modifiedBy,reportedBy,issuetype,files,spent,estimated,conversationroom,issuemilestone,childissues,watchers',
            limit: -1,
        };

        let _projectOptions = {
            query: `(Project.id : ${projectId})`,
            rels: 'issuestatuses,issuetypes',
            limit: -1,
        }; 

        try {
            let project = await _self.get('store').query('project', _projectOptions);
            let projectData = project.objectAt(0);
            if(projectData.issuestatuses === undefined || projectData.issuestatuses.length === 0) {
                let issueStatuses = await _self.get('store').query('issuestatus', {
                    query: `(Issuestatus.system : 1)`,
                    limit: -1,
                });
                projectData.issuestatuses = issueStatuses;
            }
            
            let issue = await _self.get('store').query('issue', options);

        return {
                project: project,
                issue: issue
            }
        } catch (error) {
            _self.errorManager.handleError(error, {
                moduleName: 'issue'
            })
        }
    },

    /**
     * This function is used to setup the activities for the issue
     *
     * @method setupActivities
     * @param {Prometheus.Controllers.Issue} controller
     * @param {Prometheus.Models.Issue} model
     * @private
     */
    setupActivities: function (controller, model) {
        let activities = {};
        controller.set('activities', activities);
        Logger.debug('AppProjectIssuePageRoute::setupActivities');

        if (model.activities !== undefined) {
            // Group the activities with respect to the dateCreated
            model.activities.forEach(function (activity) {
                let dateCreated = activity.get('dateCreated').substring(0, 10);
                if (activities[dateCreated] !== undefined) {
                    activities[dateCreated]['data'].push(activity);
                }
                else {
                    activities[dateCreated] = { dateCreated: dateCreated, data: [activity] };
                }
            });
            controller.set('activities', activities);
        }
        Logger.debug('-AppProjectIssuePageRoute::setupActivities');
    },

    actions: {

        reload() {
            let _self = this;
            Logger.debug('Reloading the route for issue page');
            Logger.debug(_self);
            let params = _self.paramsFor('app.project.issue.page');
            let controller = _self.get('controller');

            this.loadIssue(controller, params);
        }
    }

});