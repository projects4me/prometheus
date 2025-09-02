/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import PrometheusController from "prometheus/controllers/prometheus";
import { task } from 'ember-concurrency';
import { inject as controller } from '@ember/controller';
import { inject as service } from '@ember/service';
import $ from 'jquery';
import { computed, action } from '@ember/object';
import Evented from '@ember/object/evented';
import { htmlSafe } from "@ember/template";
import ProjectRelated from "prometheus/controllers/prometheus/projectrelated";
import { tracked } from '@glimmer/tracking';

/**
 * This controller is used to manage the issues detail/page view
 *
 * @class AppProjectIssuePageController
 * @namespace Prometheus.Controllers
 * @module App.Project.Issue
 * @extends PrometheusController
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default class AppProjectIssuePageController extends PrometheusController.extend(Evented, ProjectRelated) {

    /**
     * This flag is used to show or hide the modal dialog box
     * for file previews
     *
     * @property previewFileDialog
     * @type boolean
     * @for Page
     * @private
     */
    previewFileDialog = false;

    /**
     * This flag is used to show or hide the modal dialog box
     * for time log
     *
     * @property logTimeDialog
     * @type boolean
     * @for Page
     * @private
     */
    logTimeDialog = false;

    /**
     * This flag is used to show or hide the modal dialog box
     * for estimates
     *
     * @property estimateTimeDialog
     * @type boolean
     * @for Page
     * @private
     */
    estimateTimeDialog = false;

    /**
     * This is the container object for a new time log entry
     *
     * @property newLogTime
     * @type Prometheus.Models.Timelog
     * @for PAge
     * @private
     */
    newTimeLog = null;

    /**
     * This flag is used to show or hide the modal dialog box
     * for editing time log entry
     *
     * @property editLogDialog
     * @type boolean
     * @for Page
     * @private
     */
    editLogDialog = false;

    /**
     * This is the container object for a new time log entry
     *
     * @property editingLog
     * @type Prometheus.Models.Timelog
     * @for PAge
     * @private
     */
    editingLog = null;

    /**
     * PubSub service is used to provide DDAD.
     *
     * @property pubSub
     * @type Ember.Service
     * @for AppProjectIssuePageController
     * @protected
     */
    @service pubSub;    

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
     * Boolean flag indicating whether the issue planning dialog/modal is open.
     *
     * @property issuePlanDialog
     * @type {Boolean}
     * @public
     */
    @tracked issuePlanDialog = false;

    /**
     * Holds the data returned from the AI issue planning API for the current issue.
     *
     * @property issuePlanData
     * @type {Object|null}
     * @public
     */
    @tracked issuePlanData = null;

    /**
     * Boolean flag indicating whether the issue planning data is currently being loaded.
     *
     * @property issuePlanLoading
     * @type {Boolean}
     * @public
     */
    @tracked issuePlanLoading = false;

    /**
     * Boolean flag indicating whether the add watcher dialog is open.
     *
     * @property addWatcherDialog
     * @type {Boolean}
     * @public
     */
    @tracked addWatcherDialog = false;

    /**
     * This is a computed property in which gets the list of users
     * in the system loaded by the project controller
     *
     * @property usersList
     * @type Array
     * @for Create
     * @private
     */
    get usersList() {
        return this.projectController.get('usersList');
    }

    /**
     * This is a computed property in which gets the list of issues
     * associated with a project loaded by the project controller
     *
     * @property issuesList
     * @type Array
     * @for Page
     * @private
     */
    @computed('projectController.issuesList')
    get issuesList() {
        return this.projectController.get('issuesList');
    }

    /**
     * This is a task to handle file uploading
     *
     * @param handleUpload
     * @type task
     * @private
     */
    @(task(function* (file) {
        let _self = this;
        Logger.debug('Trying to upload a file');
        let maxFileSize = _self.env.app.upload.maxFileSize;

        if(file.size > maxFileSize) {
            new Messenger().post({
                message: _self.intl.t("views.app.issue.detail.file.uploadFailedSize", { size: maxFileSize / 1024 / 1024 }),
                type: 'error',
                showCloseButton: true
            });
            return;
        }

        let upload = this.store.createRecord('upload', {});

        try {
            let options = {
                url: upload.store.adapterFor('upload').buildURL('upload'),
                data: {
                    relatedTo: 'issue',
                    relatedId: _self.issue.id
                },
                headers: upload.store.adapterFor('upload').headers
            };

            let response = yield file.upload(options);
            let data = yield response.json();
            
            // Update the upload record with the response data
            upload.setProperties({
                id: data.data.id,
                name: data.data.attributes.name,
                fileSize: data.data.attributes.fileSize,
                fileType: data.data.attributes.fileType,
                fileMime: data.data.attributes.fileMime,
                fileThumbnail: data.data.attributes.fileThumbnail
            });

            // Add to the relationship
            _self.issue.get('files').pushObject(upload);

        } catch (e) {
            new Messenger().post({
                message: _self.intl.t("views.app.issue.detail.file.uploadfailed"),
                type: 'error',
                showCloseButton: true
            });
            upload.rollback();
        }
    })).maxConcurrency(3).enqueue() handleUpload

    /**
     * This function saves the comment in the database
     *
     * @param issue
     * @param comment
     * @return {Promise}
     * @private
     */
    _createComment(issue, content) {
        Logger.debug('Prometheus.Controllers.App.Project.Issue.Page::_createComment');

        let _self = this;
        let comment = _self.get('store').createRecord('comment', {
            relatedId: issue.get('conversationRoomId'),
            relatedTo: 'conversationrooms',
            comment: content,
        });

        Logger.debug('-Prometheus.Controllers.App.Project.Issue.Page::_createComment');

        return comment.save().then(function (savedComment) {
            issue.get('comments').pushObject(savedComment);
            _self.pubSub.trigger('clearContents');
        });
    }

    /**
     * This function is used to validate the time log
     *
     * @param timeLog
     * @private
     */
    _validateLog(timeLog) {
        if (timeLog.get('days') === undefined) {
            timeLog.set('days', 0);
        }

        if (timeLog.get('hours') === undefined) {
            timeLog.set('hours', 0);
        }

        if (timeLog.get('minutes') === undefined) {
            timeLog.set('minutes', 0);
        }

        if (((timeLog.get('days') * 8) + (timeLog.get('hours') * 60) + timeLog.get('minutes')) === 0) {
            return false;
        } else if (timeLog.get('spentOn') === undefined || timeLog.get('spentOn') === '') {
            return false;
        }
        return true;
    }

    /**
     * This function is used to validate the time log
     *
     * @param timeLog
     * @private
     */
    _validateEstimate(timeLog) {
        if (timeLog.get('days') === undefined) {
            timeLog.set('days', 0);
        }

        if (timeLog.get('hours') === undefined) {
            timeLog.set('hours', 0);
        }

        if (timeLog.get('minutes') === undefined) {
            timeLog.set('minutes', 0);
        }

        if (((timeLog.get('days') * 8) + (timeLog.get('hours') * 60) + timeLog.get('minutes')) === 0) {
            return false;
        } else if (timeLog.get('description') == undefined) {
            return false;
        }

        return true;
    }

    /**
     * This action is used to navigate the user to the issue page
     *
     * @method editIssue
     * @param {Integer} issueNumber The issue number, which is used as an issue identifier
     * @public
     */
    @action editIssue(issueNumber) {
        Logger.debug('AppProjectIssuePageController::editIssue(' + issueNumber + ')');
        this.transitionToRoute('app.project.issue.edit', { issue_number: issueNumber });
        Logger.debug('-AppProjectIssuePageController::paginate()');
    }

    /**
     * This event is called when it is required to upload a file
     * This function acts as a bridge event
     *
     * @param file
     */
    @action uploadFile(file) {
        Logger.debug("Uploading a file");
        this.handleUpload.perform(file);
    }

    /**
     * This function is used to handle the deletion of a file
     *
     * @param file
     */
    @action deleteFile(file) {
        Logger.debug('App.Project.Issue.PageController->deleteFile');
        let _self = this;

        let deleting = new Messenger().post({
            message: htmlSafe(_self.intl.t("views.app.issue.detail.file.delete", { name: file.get('name') })),
            type: 'warning',
            showCloseButton: true,
            actions: {
                confirm: {
                    label: htmlSafe(_self.intl.t("views.app.issue.detail.file.confirmdelete")).toString(),
                    action: function () {
                        // First remove from the relationship
                        _self.issue.get('files').removeObject(file);
                        
                        // Then destroy the record
                        file.destroyRecord().then(function () {
                            return deleting.update({
                                message: _self.intl.t("views.app.issue.detail.file.deleted"),
                                type: 'success',
                                actions: false
                            });
                        }).catch(() => {
                            // If destroy fails, add the file back to the relationship
                            _self.issue.get('files').pushObject(file);
                            deleting.update({
                                message: _self.intl.t("views.app.issue.detail.file.deletefailed"),
                                type: 'error',
                                actions: false
                            });
                        });
                    }
                },
                cancel: {
                    label: _self.intl.t("views.app.issue.detail.file.onsecondthought").toString(),
                    action: function () {
                        return deleting.update({
                            message: _self.intl.t("views.app.issue.detail.file.deletecancel"),
                            type: 'success',
                            actions: false
                        });
                    }
                }
            }
        });
    }

    /**
     * This function is used to handle the download of a file
     *
     * @param file
     */
    @action downloadFile(file) {
        Logger.debug('App.Project.Issue.PageController->downloadFile');
        let _self = this;
        Logger.debug(_self);

        // get a download token
        let options = {
            id: file.get('id'),
            download: true
        };
        Logger.debug('Retrieving upload with options ' + options);
        this.store.query('upload', options).then(function (data) {
            let downloadLink = data.objectAt(0).get('downloadLink');
            Logger.debug('Download link found : ' + downloadLink);

            let path = _self.get('store').adapterFor('upload').host + '/download/get/' + downloadLink;
            window.open(path, '_blank');
            Logger.debug(path);

        });


        // navigate user to the page for download

        Logger.debug('-App.Project.Issue.PageController->downloadFile');
    }

    /**
     * This function is used to handle the preview of a file
     *
     * @param file
     */
    @action previewFile(file) {
        Logger.debug('App.Project.Issue.PageController->previewFile');
        let _self = this;
        Logger.debug(_self);
        _self.send('showDialog');

        // get a download token
        let options = {
            id: file.get('id'),
            download: true
        };
        Logger.debug('Retrieving upload with options ' + options);
        _self.get('store').query('upload', options).then(function (contents) {
            let downloadLink = contents.objectAt(0).get('downloadLink');
            Logger.debug('Download link found : ' + downloadLink);

            let path = _self.get('store').adapterFor('upload').host + '/preview/get/' + downloadLink;
            $('#file_preview').attr('src', path);
            Logger.debug(path);
        });


        // navigate user to the page for download

        Logger.debug('-App.Project.Issue.PageController->previewFile');
    }

    /**
     * This function is used to log time against the issue
     *
     * @method logTime
     * @public
     */
    @action logTime() {
        Logger.debug('App.Project.Issue.PageController->logTime');
        let _self = this;
        let newLog = _self.get('newTimeLog');

        Logger.debug(_self);
        Logger.debug(newLog);

        // Validate the time log and spentOn
        if (_self._validateLog(newLog)) {
            newLog.set('issueId', _self.issue.id);
            newLog.set('projectId', _self.issue.projectId);
            newLog.set('projectShortcode', _self.issue.projectShortcode);
            newLog.set('context', 'spent');

            newLog.save().then(function () {

                let timelog = _self.get('store').createRecord('timelog');
                _self.set('newTimeLog', timelog);
                _self.get('issue').get('spent').pushObject(newLog);
                new Messenger().post({
                    message: _self.intl.t("views.app.issue.detail.timelog.added"),
                    type: 'success',
                    showCloseButton: true
                });

            });
        } else {
            new Messenger().post({
                message: _self.intl.t("views.app.issue.detail.timelog.missing"),
                type: 'error',
                showCloseButton: true
            });
        }

        _self.send('removeLogTimeModal');

        Logger.debug('-App.Project.Issue.PageController->logTime');
    }

    /**
     * This function is used to log time against the issue
     *
     * @method addEstimate
     * @public
     */
    @action addEstimate() {
        Logger.debug('Prometheus.App.Project.Issue.Page::addEstimate');
        let _self = this;
        let newLog = _self.get('newTimeLog');

        // Validate the time log and spentOn
        if (_self._validateEstimate(newLog)) {
            newLog.set('issueId', _self.issue.id);
            newLog.set('projectId', _self.issue.projectId);
            newLog.set('projectShortcode', _self.issue.projectShortcode);
            newLog.set('context', 'est');

            newLog.save().then(function () {

                let timelog = _self.get('store').createRecord('timelog');
                _self.set('newTimeLog', timelog);
                _self.issue.estimated.pushObject(newLog);

                new Messenger().post({
                    message: _self.intl.t("views.app.issue.detail.timelog.estimated"),
                    type: 'success',
                    showCloseButton: true
                });

            });

        } else {
            new Messenger().post({
                message: _self.intl.t("views.app.issue.detail.timelog.estmissing"),
                type: 'error',
                showCloseButton: true
            });
        }

        _self.send('removeEstimateTimeModal');
        Logger.debug('-Prometheus.App.Project.Issue.Pagw::addEstimate');
    }


    /**
     * This function is used to delete logged or estimated time
     *
     * @method deleteLog
     * @public
     */
    @action deleteLog(log) {
        Logger.debug('Prometheus.Controllers.App.Project.Issue.Create::deleteLog');
        let _self = this;
        let intl = _self.intl;

        let message = new Messenger().post({
            message: intl.t("global.form.deletecicked").toString(),
            type: 'warning',
            showCloseButton: true,
            actions: {
                confirm: {
                    label: intl.t("global.form.confirmcancel").toString(),
                    action: function () {
                        log.deleteRecord();
                        log.save().then(function () {
                            message.cancel();
                            new Messenger().post({
                                message: intl.t("global.form.deleted"),
                                type: 'success',
                                showCloseButton: true
                            });
                        });
                    }
                },
                cancel: {
                    label: intl.t("global.form.onsecondthought").toString(),
                    action: function () {
                        message.cancel();
                    }
                },

            }
        });
        Logger.debug('-Prometheus.Controllers.App.Project.Issue.Create::deleteLog');
    }

    /**
     * This function is used to edit the logged time
     * against the issue
     *
     * @method editLog
     * @public
     */
    @action editLog() {
        Logger.debug('App.Project.Issue.PageController->editLog');
        let _self = this;
        Logger.debug(_self);
        let log = _self.get('editingLog');
        let context = log.get('context');

        let isValid = false;
        if (context === "est") {
            isValid = _self._validateEstimate(log);
        } else {
            isValid = _self._validateLog(log);
        }

        // Validate the time log and spentOn
        if (isValid) {
            log.save().then(function () {

                new Messenger().post({
                    message: _self.intl.t("views.app.issue.detail." + context + ".edited"),
                    type: 'success',
                    showCloseButton: true
                });
                _self.send('reload');

            });
        } else {
            new Messenger().post({
                message: _self.intl.t("views.app.issue.detail." + context + ".missing"),
                type: 'error',
                showCloseButton: true
            });
        }

        _self.set('editingLog', null);
        _self.send('removeEditLogModal');
        _self.send('removeEditEstimateModal');

        Logger.debug('-App.Project.Issue.PageController->logTime');
    }

    /**
     * This action is used to save a comment for a given issue. If the issue does not have an associated
     * conversation room, a new conversation room is created first. Once the conversation room is available,
     * the comment is created and saved.
     *
     * @method saveComment
     * @param {Prometheus.Models.Issue} issue - The issue object for which the comment is being saved.
     * @param {Prometheus.Models.Comment} comment - The content of the comment to be saved.
     * @return {Promise} - A promise that resolves when the comment is successfully saved.
     * @public
     */    
    @action saveComment(issue, comment) {
        Logger.debug('Prometheus.Controller.App.Project.Issue.Page::saveComment');

        if (comment == undefined) {
            return false;
        }

        let _self = this;
        Logger.debug(issue);
        Logger.debug(comment);
        if (issue.get('conversationRoomId') == undefined) {
            let newConversation = _self.get('store').createRecord('conversationroom', {
                subject: 'Issue #' + issue.get('issueNumber'),
                description: issue.get('subject'),
                roomType: 'discussion',
                projectId: issue.get('projectId'),
                projectName: issue.get('project.name'),
                issueId: issue.get('id'),
                projectShortcode: issue.get('projectShortcode'),
                issueNumber: issue.get('issueNumber')
            });
            Logger.debug('-Prometheus.Controller.App.Project.Issue.Page::saveComment');
            return newConversation.save().then(function (conversation) {
                issue.set('conversationRoomId', conversation.get('id'))
               return _self._createComment(issue, comment);
            });
        } else {
            Logger.debug('-Prometheus.Controller.App.Project.Issue.Page::saveComment');
            return _self._createComment(issue, comment);
        }
    }

    /**
     * This function navigates a user to the parent issue
     *
     * @param issueNumber
     * @param projectId
     */
    @action navigateToIssue(issueNumber, projectId) {
        this.transitionToRoute('app.project.issue.page', {
            issue_number: issueNumber,
            shortcode: this.trackedProject.shortCode
        });
    }

    /**
     * This function is used to show the time log modal dialog box
     *
     * @method showEditLogDialog
     * @public
     */
    @action showEditLogDialog(log) {
        this.set('editingLog', log);
        this.set('editLogDialog', true);
    }

    /**
     * This function is used to show the time log modal dialog box
     *
     * @method showEditLogDialog
     * @public
     */
    @action showEditEstimateDialog(log) {
        this.set('editingLog', log);
        this.set('editEstimateDialog', true);
    }

    /**
     * This function is used to show the time log modal dialog box
     *
     * @method showLogTimeDialog
     * @public
     */
    @action showLogTimeDialog() {
        this.set('logTimeDialog', true);
    }

    /**
     * This function is used to show the time log modal dialog box
     *
     * @method showLogTimeDialog
     * @public
     */
    @action showEstimateTimeDialog() {
        this.set('estimateTimeDialog', true);
    }
    /**
     * This function is used to show the add modal dialog box
     *
     * @method showDialog
     * @public
     */
    @action showDialog() {
        this.set('filePreviewDialog', true);
    }

    /**
     * This function is used to hide the add tag modal
     *
     * @method removeModal
     * @public
     */
    @action removeModal() {
        if (this.isDestroyed || this.isDestroying) return;
        this.set('filePreviewDialog', false);
        $('.modal').modal('hide');
    }

    /**
     * This function is used to hide the log time modal
     *
     * @method removeLogTimeModal
     * @public
     */
    @action removeLogTimeModal() {
        if (this.isDestroyed || this.isDestroying) return;
        this.set('logTimeDialog', false);
        $('.modal').modal('hide');
    }

    /**
     * This function is used to hide the log time modal
     *
     * @method removeLogTimeModal
     * @public
     */
    @action removeEstimateTimeModal() {
        if (this.isDestroyed || this.isDestroying) return;        
        this.set('estimateTimeDialog', false);
        $('.modal').modal('hide');
    }

    /**
     * This function is used to hide the edit log time modal
     *
     * @method removeEditLogModal
     * @public
     */
    @action removeEditLogModal() {
        if (this.isDestroyed || this.isDestroying) return;        
        this.set('editingLog', null);
        this.set('editLogDialog', false);
        $('.modal').modal('hide');
    }

    /**
     * This function is used to hide the edit log time modal
     *
     * @method removeEditLogModal
     * @public
     */
    @action removeEditEstimateModal() {
        if (this.isDestroyed || this.isDestroying) return;
        this.set('editingLog', null);
        this.set('editEstimateDialog', false);
        $('.modal').modal('hide');
    }

    /**
     * This function is used to update the timelog.
     *
     * @method updateTimelog
     * @param {Prometheus.Models.Timelog} timelog - The timelog object to be updated
     * @param {String} field - The field to be updated
     * @param {String} value - The value to be updated
     * @public
     */
    @action updateTimelog(timelog, field, value) {
        timelog[field] = value;
    }

    /**
     * This action is used to scroll to the comment.
     *
     * @method scrollToComment
     * @public
     */
    @action scrollToElement(element, type) {
        let selectors = {
            'comment': `[data-comment-id="${this.s_id}"]`,
            'estimate': `[data-issue-estimate-id="${this.s_id}"]`,
            'spent': `[data-issue-spent-id="${this.s_id}"]`,
            'conversation': `[data-conversation-id="${this.s_id}"]`
        }
        let el = element.querySelector(selectors[type]);
        if(el) {
            this.scrollAndHighlight(el, true);
        }
    }

    /**
     * Updates the status of an issue
     * 
     * @method updateStatus
     * @param {Prometheus.Models.Issue} issue The issue to update
     * @param {String} newStatus The new status to set
     * @public
     */
    @action updateStatus(issue, newStatus) {
        Logger.debug('AppProjectIssuePageController::updateStatus');
        let _self = this;
        let translatedStatus = _self.intl.t(`views.app.issue.lists.status.${newStatus}`);
        let messenger = new Messenger().post({
            message: _self.intl.t("views.app.issue.detail.statusUpdating", { status: translatedStatus }),
            type: 'info',
            showCloseButton: false,
            hideAfter: false
        });
        issue.set('status', newStatus);
        issue.save().then(() => {
            messenger.update({
                message: _self.intl.t("views.app.issue.detail.statusUpdated", { status: translatedStatus }),
                type: 'success',
                showCloseButton: true,
                hideAfter: 3000
            });
        }).catch(() => {
            messenger.update({
                message: _self.intl.t("views.app.issue.detail.statusUpdateFailed", { status: translatedStatus }),
                type: 'error',
                showCloseButton: true,
                hideAfter: 3000
            });
            issue.rollbackAttributes();
        });
    }

    /**
     * This action sets the `issuePlanDialog` flag to true, which is typically used to show
     * the modal in the template. It then calls {@link fetchIssuePlan} to retrieve the plan
     * data for the current issue from the backend.
     *
     * @method showIssuePlanDialog
     * @public
     */
    @action showIssuePlanDialog() {
        this.issuePlanDialog = true;
        this.fetchIssuePlan();
    }

    /**
     * This action toggles the watching status of the current issue.
     * If the issue is not being watched, it enables watching and shows a success message.
     * If the issue is being watched, it disables watching and shows a success message.
     *
     * @method toggleWatcher
     * @public
     */
    @action toggleWatcher() {
        Logger.debug('AppProjectIssuePageController::toggleWatcher');
        let _self = this;
        
        if(this.isCoreMember) {
            new Messenger().post({
                message: this.intl.t('views.app.issue.watcher.cannotAddCoreMember'),
                type: 'error',
                showCloseButton: true
            });
            return;
        }        

        let watcher = this.issue.watchers.find(watcher => watcher.userId === this.currentUser.user.id);
        if(watcher) {
            watcher.isWatching = !watcher.isWatching;
        } else {
            watcher = this.store.createRecord('issuewatcher', {
                issueId: this.issue.id,
                userId: this.currentUser.user.id,
                isWatching: true
            });

            this.issue.watchers.pushObject(watcher);
        }
        watcher.save().then(() => {
            let messageKey = watcher.isWatching ? 'views.app.issue.watcher.enabled' : 'views.app.issue.watcher.disabled';
            new Messenger().post({
                message: _self.intl.t(messageKey),
                type: 'success',
                showCloseButton: true
            });
        }).catch(() => {
            watcher.isWatching = !watcher.isWatching;
            new Messenger().post({
                message: _self.intl.t('global.oops'),
                type: 'error',
                showCloseButton: true
            });
        });
        
        Logger.debug('-AppProjectIssuePageController::toggleWatcher');
    }

    /**
     * This action toggles the add watcher dialog visibility.
     *
     * @method toggleAddWatcherDialog
     * @public
     */
    @action removeAddWatcherDialog() {
        if (this.isDestroyed || this.isDestroying) return;
        this.set('addWatcherDialog', false);
        $('.modal').modal('hide');
    }

    /**
     * This action shows the add watcher dialog.
     *
     * @method showAddWatcherDialog
     * @public
     */
    @action showAddWatcherDialog() {
        this.addWatcherDialog = true;
    }

    /**
     * This action adds a project member as a watcher to the current issue.
     * For now, this method is a placeholder for the next iteration.
     *
     * @method addWatcher
     * @param {Object} member The project member to add as a watcher
     * @public
     */
    @action
    async addWatcher(member) {
        Logger.debug('AppProjectIssuePageController::addWatcher - Member:', member.name);
        try {
            let watcher = this.store.createRecord('issuewatcher', {
                issueId: this.issue.id,
                userId: member.id,
                isWatching: true
            });
            await watcher.save();
            this.issue.watchers.pushObject(watcher);
            new Messenger().post({
                message: htmlSafe(this.intl.t('views.app.issue.watcher.added', { name: member.name })),
                type: 'success',
                showCloseButton: true
            });
        } catch (e) {
            Logger.error('AppProjectIssuePageController::addWatcher - Error:', e);
        }
        Logger.debug('-AppProjectIssuePageController::addWatcher');
    }

    /**
     * This method sets the `issuePlanDialog` flag to false, clears any loaded plan data
     * and errors, and programmatically hides any open modal dialogs using jQuery.
     *
     * @method removeIssuePlanDialog
     * @public
     */
    removeIssuePlanDialog() {
        this.issuePlanDialog = false;
        this.issuePlanData = null;
        this.issuePlanError = null;
        $('.modal').modal('hide');
    }

    /**
     * This asynchronous action sends a POST request to the `/issueplanning` API endpoint,
     * passing the current issue's number. It manages loading and error state, and parses
     * the returned plan data if the request is successful. If the request fails or the
     * backend returns an error, it sets an appropriate error message.
     *
     * @method fetchIssuePlan
     * @async
     * @public
     * @returns {Promise<void>}
     */
    @action async fetchIssuePlan() {
        this.issuePlanLoading = true;
        this.issuePlanError = null;
        this.issuePlanData = null;
        let _self = this;
        try {
            let url = `${_self.env.api.host}/api/v${_self.env.api.version}/issueplanning`;
            let requestBody = {
                issueNumber: this.issue.issueNumber
            };
            let response = await fetch(url, {
                method: 'POST',
                body: JSON.stringify(requestBody),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${_self.session.data.authenticated.access_token}`
                }
            });
            if (response.ok) {
                let data = await response.json();
                if (data.success && data.data) {
                    this.issuePlanData = JSON.parse(data.data);
                } else {
                    this.issuePlanError = data.message || 'AI planning failed.';
                }
            } else {
                this.issuePlanError = this.intl.t('global.oops');
            }
        } catch (e) {
            this.issuePlanError = this.intl.t('global.oops');
        } finally {
            this.issuePlanLoading = false;
        }
    }
    
    /**
     * This computed property attempts to retrieve the project using the project ID
     * from the `projectController`. If the project is not found, it logs an error.
     *
     * @property project
     * @type {DS.Model|undefined}
     * @public
     */
    get project() {
        let project = this.store.peekRecord(
			'project',
			this.projectController.projectId
		);
        if (!project) {
            console.error('Project not found');
        }
        return project;
    }

    get isWatching() {
        return this.issue.watchers.find(watcher => watcher.userId === this.currentUser.user.id)?.isWatching || false;
    }

    /**
     * Computed property to determine if the current user is a core member of the issue.
     * Core members are assignee, owner, modifiedBy, or reportedBy.
     *
     * @property isCoreMember
     * @type {Boolean}
     * @public
     */
    get isCoreMember() {
        const currentUserId = this.currentUser.user.id;
        return (
            this.issue.assignee === currentUserId ||
            this.issue.owner=== currentUserId ||
            this.issue.modifiedUser === currentUserId ||
            this.issue.reportedUser === currentUserId
        );
    }

    /**
     * Computed property to get available project members who can be added as watchers.
     * Excludes current user, core issue members, and users who are actively watching the issue (isWatching: true).
     *
     * @property availableProjectMembers
     * @type {Array}
     * @public
     */
    get availableProjectMembers() {
        if (!this.projectController.members) {
            return [];
        }

        const currentUserId = this.currentUser.user.id;
        const activeWatcherIds = this.issue.watchers
            .filter(watcher => watcher.isWatching === true)
            .map(watcher => watcher.userId);
        
        // Core issue members who shouldn't be added as watchers
        const coreMemberIds = [
            this.issue.assignee,
            this.issue.owner,
            this.issue.modifiedUser,
            this.issue.reportedUser
        ].filter(id => id); // Filter out undefined/null values

        return this.projectController.members.filter(member => 
            member.get('id') !== currentUserId && 
            !activeWatcherIds.includes(member.get('id')) &&
            !coreMemberIds.includes(member.get('id'))
        );
    }
}