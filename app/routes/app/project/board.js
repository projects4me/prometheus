/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import App from "prometheus/routes/app";

/**
 * This is the route to load the task board for a project
 *
 * @class Board
 * @namespace Prometheus.Routes
 * @module App.Project
 * @extends AppRoute
 * @author Rana Nouman <ranamnouman@yahoo.com>
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
        let projectId = this.paramsFor('app.project').project_id;
        let _milestoneOptions = {
            query: `(Milestone.projectId : ${projectId} )`,
            order: 'Milestone.endDate',
            rels: 'issues',
            limit: -1
        };
        let _issueOptions = {
            query: `(((Issue.milestoneId NULL) OR (Issue.milestoneId EMPTY)) AND (Issue.projectId : ${projectId}))`,
            rels: 'none'
        }
        let milestones = await _self.store.query('milestone', _milestoneOptions);
        let backlogIssues = await _self.store.query('issue', _issueOptions);
        let backlog = _self.store.createRecord('milestone', {
            id: null,
            milestoneType: "backlog",
            status: "planned",
            issues: backlogIssues
        });

        let milestonesArray = [];

        milestones.forEach((milestone) => {
            milestonesArray.pushObject(milestone);
        })
        milestonesArray.pushObject(backlog);
        return milestonesArray;
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
        controller.set('milestones', model);
    },
});