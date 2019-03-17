/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Prometheus from "prometheus/controllers/prometheus";

/**
 * This is the controller for the board controller
 *
 * @class Board
 * @namespace Prometheus.Controllers
 * @module App.Project
 * @extends Prometheus
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default Prometheus.extend({

    /**
     * These are the issues statues
     *
     * @property statuses
     * @type Array
     * @for Board
     * @public
     */
    statuses: [
        'new',
        'in_progress',
        'done',
        'feedback',
        'pending',
        'deferred'
    ],

    /**
     * These are the issues statues
     *
     * @property statuses
     * @type Array
     * @for Board
     * @public
     */
    statusClass: {
        new : 'box-info',
        in_progress : 'box-primary',
        done : 'box-success',
        feedback : 'box-warning',
        pending : 'box-danger',
        deferred : ''
    },

    /**
     * These are the actions supported by the Project Board View
     *
     * @property actions
     * @type Object
     * @for Board
     * @public
     */
    actions:{

        /**
         * This action is used to help navigate a user to the detail view of an issue
         *
         * @method openIssue
         * @param App.Model.Issue issue The issue the user wants to navigate to
         * @public void
         */
        openIssue(issue){
            Logger.debug("AppProjectBoardController::openIssue");
            this.transitionToRoute('app.project.issue.page',{issue_number:issue.get('issueNumber')});
            Logger.debug("-AppProjectBoardController::openIssue");
        },

        /**
         * This function is responsible for updating the status of an issue
         *
         * @method updateIssue
         * @param {string} issueId The issue that needs to be updated
         * @param {string} status The new status
         * @param {string} milestoneId The milestone of the issue
         * @public
         */
        updateIssue(issueId, status,milestoneId) {
            let self = this;
            Logger.debug('App.Controller.Project.Board.updateIssue');
            Logger.debug(self);
            Logger.debug(issueId);
            Logger.debug(status);
            Logger.debug(milestoneId);
            let issue = self.get('milestones').findBy('id',milestoneId).get('issues').findBy('id',issueId);
            if (issue !== undefined)
            {
                issue.set('status',status);
                issue.save();
            }
            Logger.debug(issue);
            Logger.debug('-App.Controller.Project.Board.updateIssue');
        }

    }

});