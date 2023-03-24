/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import PrometheusController from "prometheus/controllers/prometheus";
import { computed, action } from '@ember/object';

/**
 * This is the controller for the board controller
 *
 * @class AppProjectBoardController
 * @namespace Prometheus.Controllers
 * @module App.Project
 * @extends Prometheus
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default class AppProjectBoardController extends PrometheusController {
    /**
     * These are the issues statues
     *
     * @property statuses
     * @type Array
     * @for Board
     * @public
     */
    statusClass = {
        new: 'box-info',
        in_progress: 'box-primary',
        done: 'box-success',
        feedback: 'box-warning',
        pending: 'box-danger',
        deferred: ''
    };

    /**
     * These are the issues statues
     *
     * @property statuses
     * @type Array
     * @for Board
     * @public
     */
    originalIssues = null;

    /**
     * These are the actions supported by the Project Board View
     *
     * @property actions
     * @type Object
     * @for Board
     * @public
     */

    /**
     * This action is used to help navigate a user to the detail view of an issue
     *
     * @method openIssue
     * @param App.Model.Issue issue The issue the user wants to navigate to
     * @public void
     */
    @action openIssue(issue) {
        Logger.debug("AppProjectBoardController::openIssue");
        this.transitionToRoute('app.project.issue.page', { issue_number: issue.get('issueNumber') });
        Logger.debug("-AppProjectBoardController::openIssue");
    }

    /**
     * This function is responsible for updating the status of an issue
     *
     * @method updateIssue
     * @param {HTMLElement} issueEl The issue element that is dragged
     * @param {HTMLElement} elTo Lane from which issue is dragged
     * @param {HTMLElement} elFrom Lane on which issue is dropped
     * @param {Function} reRenderViewCb
     * @public
     */
    @action updateIssue(issueEl, elTo, elFrom, reRenderViewCb) {
        Logger.debug("AppProjectBoardController::updateIssue");
        Logger.debug('The element that was dragged is', issueEl);
        let _self = this;
        let laneMilestoneId = elTo.getAttribute('data-field-milestone-id');
        let status = elTo.parentElement.children[0].getAttribute('data-field-status');
        let newStatusId = elTo.getAttribute('data-issue-status-id');
        let issueId = issueEl.getAttribute('data-field-issue-id');
        let issueMilestoneId = issueEl.getAttribute('data-field-issue-milestone');

        (issueMilestoneId == "") && (issueMilestoneId = null);
        let milestone = this.milestones.findBy('id', issueMilestoneId);
        let issue = milestone.issues.findBy('id', issueId);
        let targetMilestone = this.milestones.findBy('id', laneMilestoneId);
        targetMilestone.issues.pushObject(issue);

        issue.set('status', status);
        issue.set('milestoneId', laneMilestoneId);
        issue.set('statusId', newStatusId);
        issue.save().then(() => {
            _self.postUpdateProcessing(issueId, elTo, elFrom, reRenderViewCb);
        });
        Logger.debug("-AppProjectBoardController::updateIssue");
    }

    /**
     * This function is used in order to check whether the two milestone containers, from which our issue
     * item is dragged and dropped, are same or not. If these two milestone containers are same,
     * then we should have to only adjust the height of one parent container only. And if
     * they are not same, meaning that the item is dragged from one milestone box
     * and dropped into some other milestone box, then we should have to adjust/recalculate the height
     * of both milestone containers. After that applying slim scroll to updated issue item. All of the re adjusting
     * of heights and applying slimscroll is done by the callback 'reRenderViewCb'.
     * @method postUpdateProcessing
     * @param {String} issueId Id of updated issue
     * @param {HTMLElement} elTo Lane from which issue is dragged
     * @param {HTMLElement} elFrom Lane on which issue is dropped
     * @param {Function} reRenderViewCb 
     * @public
     */
    postUpdateProcessing(issueId, elTo, elFrom, reRenderViewCb) {
        Logger.debug("AppProjectBoardController::postUpdateProcessing");
        let milestoneEls = [];
        let milestoneEl1 = elTo.closest('div.milestone.box-body');
        let milestoneEl2 = elFrom.closest('div.milestone.box-body');
        let item = document.querySelector(`[data-field-issue-id="${issueId}"]`);
        item.style.pointerEvents = "auto";
        (milestoneEl1 !== milestoneEl2) && (milestoneEls.pushObject(milestoneEl1));
        milestoneEls.pushObject(milestoneEl2);
        reRenderViewCb(milestoneEls, [item]);
        Logger.debug("-AppProjectBoardController::postUpdateProcessing");
    }

    /**
     * This is the list of issue statuses related to the current project.
     *
     * @property statuses
     * @returns array
     * @method get
     * @public
     */
    get statuses() {
        let statusList = [
            'new',
            'in_progress',
            'done',
            'feedback',
            'pending',
            'deferred'
        ];

        let _self = this;

        statusList.forEach((status, i) => {
            let issueStatusModel = _self.issueStatuses.findBy('name', status);

            //create new object of issueStatus with its id and name.
            let issueStatus = {
                name: status,
                id: issueStatusModel.id
            }

            statusList[i] = issueStatus;
        });

        return statusList;
    }

    /**
     * This function firstly filter issues based on statuses. Then those filtered issues are sorted based on there priorities, higher
     * priority issue will be on start and low will be on last. After sorting, issues are pushed into there respective milestones.
     *
     * @property milestoneList
     * @returns array
     * @method get
     * @public
     */
    @computed('milestones.issues')
    get milestoneList() {
        let statusList = [
            'new',
            'in_progress',
            'done',
            'feedback',
            'pending',
            'deferred'
        ];

        let priorities = {
            low: 1,
            medium: 2,
            high: 3,
            critical: 4,
            blocker: 5
        }

        this.milestones.forEach((milestone) => {
            //clone milestone issue
            let issues = _.clone(milestone.issues);
            
            /**
             * clear all milestone issues in order to set new sorted issues.
             * https://api.emberjs.com/ember/4.11/classes/MutableArray/methods/clear?anchor=clear
             */
            milestone.issues.clear();

            statusList.forEach(status => {
                //filter issues based on status
                let issuesByStatus = issues.filter(issue => issue.status == status);

                //first add a priority by number to an issue
                issuesByStatus.forEach(issue => {
                    issue['priorityNumber'] = priorities[issue['priority']];
                });

                //now sort issues of each status based on priorities
                issuesByStatus.sort((a, b) => b.priorityNumber - a.priorityNumber);

                //push new sorted issues
                milestone.issues.pushObjects(issuesByStatus);
            });
        });
        return this.milestones;
    }
}