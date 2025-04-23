/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import App from "prometheus/routes/app";
import { hash } from 'rsvp';

/**
 * This is the route to load the task board for a project
 *
 * @class Board
 * @namespace Prometheus.Routes
 * @module App.Project
 * @extends AppRoute
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default App.extend({

    /**
     * This function is called by ember when we enter this route and returns
     * resolved promises to the controller. In this function we returns milestone
     * array which contains all milestones and backlog related to the current project.
     *
     * @method model;
     * @public
     */
    async model() {
        let _self = this;
        let projectId = this.trackedProject.getProjectId();

        //Fetch milestones of current project
        let _milestoneOptions = {
            query: `(Milestone.projectId : ${projectId} )`,
            order: 'Milestone.endDate',
            limit: -1
        };
        let milestones = await _self.store.query('milestone', _milestoneOptions).catch((error) => {
            _self.errorManager.handleError(error, {
                moduleName: "milestone"
            });
        });

        //Fetch backlog issues
        let _issueOptions = {
            query: `(((Issue.milestoneId NULL) OR (Issue.milestoneId EMPTY)) AND (Issue.projectId : ${projectId}))`,
            rels: 'assignedTo',
            limit: -1
        }
        let backlogIssues = await _self.store.query('issue', _issueOptions).catch((error) => _self.errorManager.handleError(error));

        //Fetch issue statuses of project
        let _issueStatusOptions = {
            query: `(Issuestatus.projectId : ${projectId})`,
            limit: -1
        };

        let issueStatuses = await _self.store.query('issuestatus', _issueStatusOptions).catch((error) => _self.errorManager.handleError(error));

        await hash(milestones.map(async (milestone) => {
            let issues = await _self.store.query('issue', {
                query: `((Issue.milestoneId : ${milestone.id} ) AND (Issue.projectId : ${projectId}))`,
                rels: 'assignedTo',
                limit: -1
            }).catch((error) => {
                _self.errorManager.handleError(error);
            });

            milestone.issues.pushObjects(issues);
        }));

        //Create a milestone of type backlog
        let backlog = _self.store.createRecord('milestone', {
            id: null,
            milestoneType: "backlog",
            status: "planned",
            issues: backlogIssues || []
        });

        let milestonesArray = [];

        milestones.forEach((milestone) => {
            milestonesArray.pushObject(milestone);
        });
        milestonesArray.pushObject(backlog);

        let model = hash({
            milestones: milestonesArray,
            issueStatuses: issueStatuses || []
        });

        return model;
    },

    /**
     * This function get triggered after model() hook. In this function we're fetching
     * system level issue statuses for a project that doesn't have list of issue statuses. 
     * 
     * @method afterModel
     * @private
     */
    async afterModel(model) {
        let _self = this;

        //if there are no issue statuses for a project then fetch system level statuses
        if (model.issueStatuses.length === 0) {
            let _issueStatusOptions = {
                query: `(Issuestatus.system : 1)`,
                limit: -1
            };

            let issueStatuses = await _self.store.query('issuestatus', _issueStatusOptions).catch(() => true);
            model.issueStatuses = issueStatuses;
        }
        return model;
    },

    /**
     * This function is used to setup the controller for this
     * route
     *
     * @method setupController
     * @param {Prometheus.Controllers.Board} controller the controller object for this route
     * @private
     */
    setupController: function (controller, model) {
        Logger.debug('Prometheus.Routes.Board::setupController');
        controller.set('milestones', model.milestones);
        controller.set('issueStatuses', model.issueStatuses);
    },
});