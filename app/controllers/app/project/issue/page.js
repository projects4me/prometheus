/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import PrometheusController from "prometheus/controllers/prometheus";
import { task } from 'ember-concurrency';
import { inject as controller } from '@ember/controller';
import { set } from '@ember/object';
import $ from 'jquery';
import { computed, action } from '@ember/object';
import Evented from '@ember/object/evented';
import { htmlSafe } from "@ember/template";

/**
 * This controller is used to manage the issues detail/page view
 *
 * @class AppIssuePageController
 * @namespace Prometheus.Controllers
 * @module App.Project.Issue
 * @extends PrometheusController
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default class AppIssuePageController extends PrometheusController.extend(Evented) {

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
     * The comments from the comment box
     *
     * @property comment
     * @type Array
     * @for Page
     * @public
     */
    comment = null;

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

        let upload = this.store.createRecord('upload', {});

        try {
            let options = {
                url: upload.store.adapterFor('upload').buildURL('upload'),
                data: {
                    relatedTo: 'issue',
                    relatedId: _self.get('model').objectAt(0).get('id')
                },
                headers: upload.store.adapterFor('upload').headers
            };

            let response = yield file.upload(options);
            let data = yield response.json();
            /**
             *  @todo check for errors
             */
            set(upload, 'id', data.data.id);
            set(upload, 'name', data.data.attributes.name);
            set(upload, 'fileSize', data.data.attributes.fileSize);
            set(upload, 'fileType', data.data.attributes.fileType);
            set(upload, 'fileMime', data.data.attributes.fileMime);
            set(upload, 'relatedTo', data.data.attributes.relatedTo);
            set(upload, 'relatedId', data.data.attributes.relatedId);
            set(upload, 'fileThumbnail', data.data.attributes.fileThumbnail);

            _self.model.objectAt(0).reload();
        } catch (e) {
            Logger.debug("Something has gone wrong");
            Logger.debug(e);
            //upload.rollback();
        }
    })).maxConcurrency(3).enqueue() handleUpload

    /**
     * This function saves the comment in the database
     *
     * @param issue
     * @param comment
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

        comment.save().then(function (savedComment) {
            issue.get('comments').pushObject(savedComment);
            _self.trigger('clearContents');
        });

        Logger.debug('-Prometheus.Controllers.App.Project.Issue.Page::_createComment');
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
        Logger.debug(self);

        let deleting = new Messenger().post({
            message: htmlSafe(_self.intl.t("views.app.issue.detail.file.delete", { name: file.get('name') })),
            type: 'warning',
            showCloseButton: true,
            actions: {
                confirm: {
                    label: htmlSafe(_self.intl.t("views.app.issue.detail.file.confirmdelete")),
                    action: function () {
                        // destroy the upload
                        file.destroyRecord().then(function (e) {
                            return deleting.update({
                                message: _self.intl.t("views.app.issue.detail.file.deleted"),
                                type: 'success',
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
                },

            }
        });

        Logger.debug('-App.Project.Issue.PageController->deleteFile');
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
            newLog.set('issueId', _self.get('model').objectAt(0).get('id'));
            newLog.set('context', 'spent');

            newLog.save().then(function () {

                let timelog = _self.get('store').createRecord('timelog');
                _self.set('newTimeLog', timelog);
                _self.get('model').objectAt(0).get('spent').pushObject(newLog);

                new Messenger().post({
                    message: _self.intl.t("views.app.issue.detail.timelog.added"),
                    type: 'success',
                    showCloseButton: true
                });

                _self.send('reload');

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
            newLog.set('issueId', _self.get('model').objectAt(0).get('id'));
            newLog.set('context', 'est');

            newLog.save().then(function () {

                let timelog = _self.get('store').createRecord('timelog');
                _self.set('newTimeLog', timelog);
                _self.get('model').objectAt(0).get('estimated').pushObject(newLog);

                new Messenger().post({
                    message: _self.intl.t("views.app.issue.detail.timelog.estimated"),
                    type: 'success',
                    showCloseButton: true
                });

                //_self.send('reload');

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
                issueId: issue.get('id')
            });
            Logger.debug(newConversation);
            // Save it
            newConversation.save().then(function (conversation) {
                issue.set('conversationRoomId', conversation.get('id'))
                _self._createComment(issue, comment);
                _self.set('comment', null);
            });
        } else {
            _self._createComment(issue, comment);
            _self.set('comment', null);
        }

        Logger.debug('-Prometheus.Controller.App.Project.Issue.Page::saveComment');
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
            project_id: projectId
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
        this.set('editingLog', null);
        this.set('editEstimateDialog', false);
        $('.modal').modal('hide');
    }
}