/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import PrometheusController from "prometheus/controllers/prometheus";
import { inject as controller } from '@ember/controller';
import { service } from '@ember/service';
import { issueStatusLabel } from 'prometheus/utils/issue-status/label';
import { postToast } from 'prometheus/utils/ui/post-toast';
import { pushIfMissing, removeById } from 'prometheus/utils/live/collection';
import { applyIssueAssigneeChange } from 'prometheus/utils/live/assignee';
import { isOpenIssueEvent, isIssueRoomEvent, resolveStatusName, findOrLoad } from 'prometheus/utils/live/issue';
import { toArray } from 'prometheus/utils/array/to-array';

/**
 * This controller is used to manage the issues detail/page view
 *
 * @class AppProjectIssuePageController
 * @namespace Prometheus.Controllers
 * @module App.Project.Issue
 * @extends PrometheusController
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default class AppProjectIssuePageController extends PrometheusController {
    /**
     * We are pre-loading the project issues and the users in the
     * system when a use navigates to the project view. Inside the
     * this page we are simply fetching the information stored in
     * the project controller. For that purpose we are loading injecting
     * the project controller controller inside this controller.
     *
     * @property projectController
     * @type Prometheus.Controllers.Project
     * @for Create
     * @private
     */
    @controller('app.project') projectController;

    /**
     * Query params that the controller support.
     *
     * @property queryParams
     * @type Array
     * @for AppProjectIssuePageController
     * @public
     */
    queryParams = ['s_id'];

    /**
     * The Hermes relay, the current user comes from the base controller
     *
     * @property hermes
     * @type Ember.Service
     * @public
     */
    @service hermes;

    /**
     * Disposer of the Hermes registration, null when not registered
     *
     * @property hermesDisposer
     * @type Function|null
     * @private
     */
    hermesDisposer = null;

    /**
     * Ids of comments deleted remotely, so a pending created lookup does not add them back
     *
     * @property deletedCommentIds
     * @type Set
     * @private
     */
    deletedCommentIds = new Set();

    /**
     * Registers the events of the open issue with Hermes for the tracked project
     *
     * @method registerHermesIntents
     * @param {String} projectId
     * @returns {void}
     * @public
     */
    registerHermesIntents(projectId) {
        this.unregisterHermesIntents();
        this.deletedCommentIds = new Set();
        if (!projectId) {
            return;
        }
        this.hermesDisposer = this.hermes.register(this, projectId, {
            'issue.status.changed': envelope => {
                if (isOpenIssueEvent(this.issue, envelope)) {
                    this.applyStatus(envelope);
                }
            },
            'issue.assignee.changed': envelope => {
                if (isOpenIssueEvent(this.issue, envelope)) {
                    this.applyAssignee(envelope);
                }
            },
            'conversation.comment.created': envelope => {
                if (isIssueRoomEvent(this.issue, envelope)) {
                    this.applyCommentCreated(envelope);
                }
            },
            'conversation.comment.updated': envelope => {
                if (isIssueRoomEvent(this.issue, envelope)) {
                    this.applyCommentUpdated(envelope);
                }
            },
            'conversation.comment.deleted': envelope => {
                if (isIssueRoomEvent(this.issue, envelope)) {
                    this.applyCommentDeleted(envelope);
                }
            }
        });
    }

    /**
     * Disposes the Hermes registration
     *
     * @method unregisterHermesIntents
     * @returns {void}
     * @public
     */
    unregisterHermesIntents() {
        this.hermesDisposer?.();
        this.hermesDisposer = null;
    }

    /**
     * Whether the issue is still the open one and the controller is alive
     *
     * @method isStillOpen
     * @param {Object} issue
     * @returns {Boolean}
     * @private
     */
    isStillOpen(issue) {
        return !this.isDestroying && !this.isDestroyed && this.issue === issue;
    }

    /**
     * The name of the user who made the change when it was somebody else, null otherwise
     *
     * @method otherActorName
     * @param {Object} envelope Domain-event envelope
     * @returns {Promise<String|null>}
     * @private
     */
    async otherActorName(envelope) {
        let actorId = envelope?.actorId;
        if (!actorId || actorId === this.currentUser.user?.id) {
            return null;
        }
        let actor = await findOrLoad(this.store, 'user', actorId);
        return actor?.name || null;
    }

    /**
     * Applies a remote status change onto the open issue without saving it
     *
     * The state is applied at once, only the toast waits for the actor to load.
     *
     * @method applyStatus
     * @param {Object} envelope Domain-event envelope
     * @returns {Promise}
     * @private
     */
    async applyStatus(envelope) {
        let issue = this.issue;
        let changes = envelope.changes || {};
        let status = resolveStatusName(changes, this.issueStatuses);
        if (!status) {
            return;
        }
        issue.set('status', status);
        if (changes.statusId) {
            issue.set('statusId', String(changes.statusId));
        }
        await this.notifyActor(issue, envelope, 'statusChanged', () => ({ status: issueStatusLabel(this.intl, status) }));
    }

    /**
     * Applies a remote assignee change onto the open issue without saving it
     *
     * The assignee is set at once from the event, only the toast waits for the name to load.
     *
     * @method applyAssignee
     * @param {Object} envelope Domain-event envelope
     * @returns {Promise}
     * @private
     */
    async applyAssignee(envelope) {
        let issue = this.issue;
        applyIssueAssigneeChange(this.store, issue, envelope);
        let assignee = null;
        try {
            assignee = await issue.get('assignedTo');
            if (assignee && !assignee.get('name')) {
                await this.store.findRecord('user', assignee.get('id'), { reload: true });
            }
        } catch (error) {
            this.logLiveFailure(error);
            return;
        }
        await this.notifyActor(issue, envelope, 'assigneeChanged', () => ({ assignee: assignee?.get('name') || '' }));
    }

    /**
     * Toasts a change made by somebody else, best effort: a failure never undoes the applied change
     *
     * @method notifyActor
     * @param {Object} issue The issue the event was applied to
     * @param {Object} envelope Domain-event envelope
     * @param {String} key Translation key under views.app.issue.detail.live
     * @param {Function} [values] Returns the extra translation values
     * @returns {Promise}
     * @private
     */
    async notifyActor(issue, envelope, key, values) {
        try {
            let actorName = await this.otherActorName(envelope);
            if (actorName && this.hermesDisposer && this.isStillOpen(issue)) {
                postToast(this.intl, `views.app.issue.detail.live.${key}`, 'info', { user: actorName, ...(values ? values() : {}) });
            }
        } catch (error) {
            this.logLiveFailure(error);
        }
    }

    /**
     * Adds a remotely created comment to the open issue once
     *
     * @method applyCommentCreated
     * @param {Object} envelope Domain-event envelope
     * @returns {Promise}
     * @private
     */
    async applyCommentCreated(envelope) {
        let issue = this.issue;
        let id = String(envelope.resource.id);
        if (this.deletedCommentIds.has(id) || toArray(issue.comments).find((item) => item.id === id)) {
            return;
        }
        try {
            let comment = await this.store.findRecord('comment', id);
            if (!this.isStillOpen(issue) || this.deletedCommentIds.has(id)) {
                return;
            }
            if (toArray(issue.comments).find((item) => item.id === comment.id)) {
                return;
            }
            pushIfMissing(issue.comments, comment);
        } catch (error) {
            this.logLiveFailure(error);
            return;
        }
        await this.notifyActor(issue, envelope, 'commented');
    }

    /**
     * Reloads a remotely edited comment when the open issue lists it
     *
     * @method applyCommentUpdated
     * @param {Object} envelope Domain-event envelope
     * @returns {Promise}
     * @private
     */
    async applyCommentUpdated(envelope) {
        let issue = this.issue;
        let comment = toArray(issue.comments).find((item) => item.id === String(envelope.resource.id));
        if (!comment) {
            return;
        }
        try {
            await comment.reload();
        } catch (error) {
            this.logLiveFailure(error);
            return;
        }
        await this.notifyActor(issue, envelope, 'commentEdited');
    }

    /**
     * Removes a remotely deleted comment from the open issue and unloads it
     *
     * @method applyCommentDeleted
     * @param {Object} envelope Domain-event envelope
     * @returns {void}
     * @private
     */
    applyCommentDeleted(envelope) {
        let id = String(envelope.resource.id);
        this.deletedCommentIds.add(id);
        let comment = toArray(this.issue.comments).find((item) => item.id === id);
        if (!comment) {
            return;
        }
        removeById(this.issue.comments, id);
        comment.unloadRecord();
    }

    /**
     * Logs a failed live update, the page stays as it is
     *
     * @method logLiveFailure
     * @param {Error} error
     * @returns {void}
     * @private
     */
    logLiveFailure(error) {
        console.warn('AppProjectIssuePageController: live update failed', error);  
    }
}