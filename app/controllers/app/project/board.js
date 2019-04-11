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
         * @param {string} issue The issue that needs to be updated
         * @param {string} el The element
         * @public
         */
        updateIssue(issue,el){
            Logger.debug("AppProjectBoardController::updateIssue");
            let _self = this;

            Logger.debug('The issue received is', issue);
            Logger.debug('The element that was dragged is',el);

            // Update the status in the card
            let status = el.event.target.parentElement.children[0].getAttribute('data-field-status');
            issue.set('status',status);

            // We have to save the milestones which contains the card we are updaing for some weird reason
            let milestones = _self.get('milestones');
            issue.save();
            milestones.save();

            Logger.debug("AppProjectBoardController::updateIssue");
        }

    }

});