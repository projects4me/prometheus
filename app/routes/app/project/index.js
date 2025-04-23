/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import App from "prometheus/routes/app";
import { inject } from '@ember/service';
import { hashSettled } from 'rsvp';
import extractHashSettled from 'prometheus/utils/rsvp/extract-hash-settled';

/**
 * The wiki route
 *
 * @class Index
 * @namespace Prometheus.Routes
 * @module App.Project
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
     * The model hook for this route used for fetching required data.
     *
     * @method model
     * @protected
     */
    async model() {
        Logger.debug('AppProjectIndexRoute::model');
        let _self = this;
        let projectId = _self.trackedProject.getProjectId();

        Logger.debug(projectId);

        let _projectOptions = {
            //      fields: "Project.id,Project.name",
            query: "(Project.id : " + projectId + ")",
            rels: 'members,conversations,createdBy,owner,memberships,roles',
            sort: "conversations.dateModified",
            order: 'ASC',
            limit: -1
        };

        let _activityOptions = {
            // Retrieving the activities related to a project
            query: "((Activity.relatedId : " + projectId + ") AND (Activity.relatedTo : project))",
            sort: "Activity.dateCreated",
            order: 'DESC',
            // Get all the activities
            limit: -1
        };

        let _issueOptions = {
            query: "(Issue.projectId : " + projectId + ")",
            sort: "Issue.dateModified",
            order: 'DESC',
            rels: 'estimated,spent,project',
            limit: -1
        };

        let _milestoneOptions = {
            query: "(Milestone.projectId : " + projectId + ")",
            sort: "Milestone.startDate",
            order: 'DESC',
            limit: -1
        };

        return hashSettled({
            project: _self.store.query('project', _projectOptions),
            milestones: _self.store.query('milestone', _milestoneOptions),
            activities: _self.store.query('activity', _activityOptions),
            issues: _self.store.query('issue', _issueOptions)
        })
            .then((data) => {
                return extractHashSettled(data, 'project');
            })
            .catch((error) => {
                _self.errorManager.handleError(error, {
                    moduleName: "project"
                });
            })
    },
    /**
     * The setup controller function that will be called every time the user visits
     * the route, this function is responsible for loading the required data
     *
     * @method setupController
     * @param {Prometheus.Controllers.Project} controller the controller object for this route
     * @private
     * @todo move the loading of related to afterModel
     */
    setupController(controller, model) {
        let projectId = this.trackedProject.getProjectId();
        let projectName = null;

        // Set project
        if (projectId !== null) {
            projectName = model.project.findBy('id', projectId).get('name');
            controller.set('projectId', projectId);
            controller.set('projectName', projectName);
        }
        controller.set('model', model.project.objectAt(0));

        // Set issues
        controller.set('issuetime', model.issues);

        this.loadActivities(model.activities, controller);
        this.loadMilestones(model.milestones, model.issues, controller);

        controller.send('resetNewMilestone');
    },

    /**
     * This function is used to set the milestones to the project contorller.
     * 
     * @param {Prometheus.Models.Milestone} milestones 
     * @param {Prometheus.Models.Issue} issues 
     * @param {Prometheus.Controller.Project} controller 
     */
    loadMilestones(milestones, issues, controller) {
        milestones.forEach(function (milestone) {
            let milestoneIssues = issues?.filterBy('milestoneId', milestone.get('id'));
            if (milestoneIssues !== undefined) {
                milestone.get('issues').pushObjects(milestoneIssues);
            }
        });
        controller.set('milestones', milestones.toArray());
    },

    /**
     * This function is used to set the activities to the project controller.
     * 
     * @param {Prometheus.Models.Activity} activities 
     * @param {Prometheus.Controller.Project} controller 
     */
    loadActivities(activities, controller) {
        let updatedActivities = {};
        // Group the activities with respect to the dateCreated
        activities.forEach(function (activity) {
            let dateCreated = activity.get('dateCreated').substring(0, 10);
            if (updatedActivities[dateCreated] !== undefined) {
                updatedActivities[dateCreated]['data'].push(activity);
            }
            else {
                updatedActivities[dateCreated] = { dateCreated: dateCreated, data: [activity] };
            }
        });
        controller.set('activities', updatedActivities);
    },
    actions: {
        /**
         * This event is triggered when user attempt to transition to another route. In this we're unloading
         * array of issue model from the ember store. Because when user will navigate from this route to
         * project/board route, where we're again fetching the issues against the same project, then store
         * will use the loaded issue models against the same xhr call and this makes board to render issues
         * lanes twice.
         * 
         * @event willTransition
         * @public
         */
        willTransition() {
            this.controller?.milestones?.forEach((milestone) => {
                let issues = milestone.issues.toArray();
                issues.forEach((issue) => {
                    issue.unloadRecord();
                });
            });

            this.controller?.issuetime?.forEach((issue) => {
                issue.unloadRecord();
            })
        }
    }
});