/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/* Licensing : http://legal.projects4.me/LICENSE.txt, please don't remove :) */
import { task } from 'ember-concurrency';
import Controller from '@ember/controller';
import { inject } from '@ember/service';
import { inject as injectController } from '@ember/controller';
import { get } from '@ember/object';
import { set } from '@ember/object';
import $ from 'jquery';
import { computed } from '@ember/object';
import Evented from '@ember/object/evented';

/**
 * This controller is used to manage the issues detail/page view
 *
 * @class Page
 * @namespace Prometheus.Controllers
 * @module App.Project.Issue
 * @extends Ember.Controller
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default Controller.extend(Evented,{

    /**
     * The ESA session storage service
     *
     * @param session
     * @type service
     * @private
     */
    session: inject(),

    /**
     * The current user
     *
     * @param currentUser
     * @type service
     * @private
     */
    currentUser: inject('current-user'),

    /**
     * This flag is used to show or hide the modal dialog box
     * for file previews
     *
     * @property previewFileDialog
     * @type boolean
     * @for Page
     * @private
     */
    previewFileDialog: false,

    /**
     * This flag is used to show or hide the modal dialog box
     * for time log
     *
     * @property logTimeDialog
     * @type boolean
     * @for Page
     * @private
     */
    logTimeDialog: false,

    /**
     * This is the container object for a new time log entry
     *
     * @property newLogTime
     * @type Prometheus.Models.Timelog
     * @for PAge
     * @private
     */
    newTimeLog: null,

    /**
     * This flag is used to show or hide the modal dialog box
     * for editing time log entry
     *
     * @property editLogDialog
     * @type boolean
     * @for Page
     * @private
     */
    editLogDialog: false,

    /**
     * This is the container object for a new time log entry
     *
     * @property editingLog
     * @type Prometheus.Models.Timelog
     * @for PAge
     * @private
     */
    editingLog: null,

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
    projectController: injectController('app.project'),


    /**
     * This is a computed property in which gets the list of users
     * in the system loaded by the project controller
     *
     * @property usersList
     * @type Array
     * @for Create
     * @private
     */
    usersList: computed(function(){
        return this.get('projectController').get('usersList');
    }),

    /**
     * This is a computed property in which gets the list of issues
     * associated with a project loaded by the project controller
     *
     * @property issuesList
     * @type Array
     * @for Page
     * @private
     */
    issuesList: computed('projectController.issuesList', function(){
        return this.get('projectController').get('issuesList');
    }),

    /**
     * The comments from the comment box
     *
     * @property comment
     * @type Array
     * @for Page
     * @public
     */
    comment:null,
    /**
     * This is a task to handle file uploading
     *
     * @param handleUpload
     * @type task
     * @private
     */
    handleUpload: task(function * (file) {
        let self = this;

        let upload = this.store.createRecord('upload', {});

        try {

            let options = {
                url: upload.store.adapterFor('upload').buildURL('upload'),
                data: {
                    relatedTo: 'issue',
                    relatedId: self.get('model').objectAt(0).get('id')
                },
                headers: upload.store.adapterFor('upload').headersForRequest()
            };

            let response = yield file.upload(options);

            let data = JSON.parse(response.body);
            /**
             *  @todo check for errors
             */
            set(upload, 'id',data.data.id);
            set(upload, 'name',data.data.attributes.name);
            set(upload, 'fileSize',data.data.attributes.fileSize);
            set(upload, 'fileType',data.data.attributes.fileType);
            set(upload, 'fileMime',data.data.attributes.fileMime);
            set(upload, 'relatedTo',data.data.attributes.relatedTo);
            set(upload, 'relatedId',data.data.attributes.relatedId);
            set(upload, 'fileThumbnail',data.data.attributes.fileThumbnail);
            self.get('model').objectAt(0).get('files').pushObject(upload);
        } catch (e) {
            //upload.rollback();
        }
    }).maxConcurrency(3).enqueue(),

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
    },

    /**
     * This function is used to validate the time log
     *
     * @param timeLog
     * @private
     */
    _validateLog:function(timeLog){
        if (timeLog.get('days') === undefined) {
            timeLog.set('days',0);
        }

        if (timeLog.get('hours') === undefined) {
            timeLog.set('hours',0);
        }

        if (timeLog.get('minutes') === undefined) {
            timeLog.set('minutes',0);
        }

        if (((timeLog.get('days')*8) + (timeLog.get('hours')*60) + timeLog.get('minutes')) === 0 ) {
            return false;
        } else if (timeLog.get('spentOn') === undefined || timeLog.get('spentOn') === '') {
            return false;
        }
        return true;
    },

    /**
     * The action handlers for the issue detail page
     *
     * @property action
     * @for Issue
     * @type Object
     * @public
     */
    actions:{

        /**
         * This action is used to navigate the user to the issue page
         *
         * @method editIssue
         * @param {Integer} issueNumber The issue number, which is used as an issue identifier
         * @public
         */
        editIssue:function(issueNumber){
            Logger.debug('AppProjectIssuePageController::editIssue('+issueNumber+')');
            this.transitionToRoute('app.project.issue.edit',{issue_number:issueNumber});
            Logger.debug('-AppProjectIssuePageController::paginate()');
        },

        /**
         * This event is called when it is required to upload a file
         * This function acts as a bridge event
         *
         * @param file
         */
        uploadFile:function(file){
            get(this, 'handleUpload').perform(file);
        },

        /**
         * This function is used to handle the deletion of a file
         *
         * @param file
         */
        deleteFile:function(file){
            Logger.debug('App.Project.Issue.PageController->deleteFile');
            let self = this;
            Logger.debug(self);

            let deleting = new Messenger().post({
                message: self.get('i18n').t("views.app.issue.detail.file.delete",{name:file.get('name')}).toString(),
                type: 'warning',
                showCloseButton: true,
                actions: {
                    confirm: {
                        label: self.get('i18n').t("views.app.issue.detail.file.confirmdelete").toString(),
                        action: function() {

                            // destroy the upload
                            file.destroyRecord().then(function(){
                                // remove from the view by updating the model
                                self.get('model').objectAt(0).get('files').removeObject(file);

                                return deleting.update({
                                    message: self.get('i18n').t("views.app.issue.detail.file.deleted"),
                                    type: 'success',
                                    actions: false
                                });
                            });
                        }
                    },
                    cancel: {
                        label: self.get('i18n').t("views.app.issue.detail.file.onsecondthought").toString(),
                        action: function() {
                            return deleting.update({
                                message: self.get('i18n').t("views.app.issue.detail.file.deletecancel"),
                                type: 'success',
                                actions: false
                            });
                        }
                    },

                }
            });

            Logger.debug('-App.Project.Issue.PageController->deleteFile');
        },

        /**
         * This function is used to handle the download of a file
         *
         * @param file
         */
        downloadFile:function(file){
            Logger.debug('App.Project.Issue.PageController->downloadFile');
            let self = this;
            Logger.debug(self);

            // get a download token
            let options = {
                id: file.get('id'),
                download: true
            };
            Logger.debug('Retrieving upload with options '+options);
            this.get('store').query('upload',options).then(function(data){
                let downloadLink = data.objectAt(0).get('downloadLink');
                Logger.debug('Download link found : '+downloadLink);

                let path = self.get('store').adapterFor('upload').host+'/download/get/'+downloadLink;
                window.open(path,'_blank');
                Logger.debug(path);

            });


            // navigate user to the page for download

            Logger.debug('-App.Project.Issue.PageController->downloadFile');
        },

        /**
         * This function is used to handle the preview of a file
         *
         * @param file
         */
        previewFile:function(file){
            Logger.debug('App.Project.Issue.PageController->previewFile');
            let self = this;
            Logger.debug(self);
            self.send('showDialog');

            // get a download token
            let options = {
                id: file.get('id'),
                download: true
            };
            Logger.debug('Retrieving upload with options '+options);
            self.get('store').query('upload',options).then(function(contents){
                let downloadLink = contents.objectAt(0).get('downloadLink');
                Logger.debug('Download link found : '+downloadLink);

                let path = self.get('store').adapterFor('upload').host+'/preview/get/'+downloadLink;
                $('#file_preview').attr('src',path);
                Logger.debug(path);
            });


            // navigate user to the page for download

            Logger.debug('-App.Project.Issue.PageController->previewFile');
        },

        /**
         * This function is used to log time against the issue
         *
         * @method logTime
         * @public
         */
        logTime:function(){
            Logger.debug('App.Project.Issue.PageController->logTime');
            let _self = this;
            let newLog = _self.get('newTimeLog');

            Logger.debug(_self);
            Logger.debug(newLog);

            // Validate the time log and spentOn
            if (_self._validateLog(newLog)) {
                newLog.set('issueId',_self.get('model').objectAt(0).get('id'));
                newLog.set('context','spent');

                newLog.save().then(function (data) {

                    let timelog = _self.get('store').createRecord('timelog');
                    _self.set('newTimeLog',timelog);
                    _self.get('model').objectAt(0).get('spent').pushObject(newLog);

                    new Messenger().post({
                        message: _self.get('i18n').t("views.app.issue.detail.timelog.added"),
                        type: 'success',
                        showCloseButton: true
                    });

                    _self.send('reload');

                });
            } else {
                new Messenger().post({
                    message: _self.get('i18n').t("views.app.issue.detail.timelog.missing"),
                    type: 'error',
                    showCloseButton: true
                });
            }

            _self.send('removeLogTimeModal');

            Logger.debug('-App.Project.Issue.PageController->logTime');
        },

        /**
         * This function is used to edit the logged time
         * against the issue
         *
         * @method editLog
         * @public
         */
        editLog:function(){
            Logger.debug('App.Project.Issue.PageController->editLog');
            let _self = this;
            Logger.debug(_self);
            let log = _self.get('editingLog');

            // Validate the time log and spentOn
            if (_self._validateLog(log)) {
                log.save().then(function () {

                    new Messenger().post({
                        message: _self.get('i18n').t("views.app.issue.detail.timelog.edited"),
                        type: 'success',
                        showCloseButton: true
                    });
                    _self.send('reload');

                });
            } else {
                new Messenger().post({
                    message: _self.get('i18n').t("views.app.issue.detail.timelog.missing"),
                    type: 'error',
                    showCloseButton: true
                });
            }

            _self.set('editingLog',null);
            _self.send('removeEditLogModal');

            Logger.debug('-App.Project.Issue.PageController->logTime');
        },

        saveComment:function (issue, comment) {
            Logger.debug('Prometheus.Controller.App.Project.Issue.Page::saveComment');

            let _self = this;
            Logger.debug(issue);
            Logger.debug(comment);
            if (issue.get('conversationRoomId') == undefined)
            {
                let newConversation = _self.get('store').createRecord('conversationroom',{
                    subject: 'Issue #' + issue.get('issueNumber'),
                    description: issue.get('subject'),
                    roomType: 'discussion',
                    projectId: issue.get('projectId'),
                    projectName: issue.get('project.name'),
                    issueId: issue.get('id')
                });
                Logger.debug(newConversation);
                // Save it
                newConversation.save().then(function(conversation){
                    issue.set('conversationRoomId',conversation.get('id'))
                    _self._createComment(issue, comment);
                    _self.set('comment',null);
                });
            } else {
                _self._createComment(issue, comment);
                _self.set('comment',null);
            }

            Logger.debug('-Prometheus.Controller.App.Project.Issue.Page::saveComment');
        },

        /**
         * This function is used to show the time log modal dialog box
         *
         * @method showEditLogDialog
         * @public
         */
        showEditLogDialog:function(log)
        {
            this.set('editingLog',log);
            this.set('editLogDialog',true);
        },

        /**
         * This function is used to show the time log modal dialog box
         *
         * @method showLogTimeDialog
         * @public
         */
        showLogTimeDialog:function()
        {
            this.set('logTimeDialog',true);
        },

        /**
         * This function is used to show the add modal dialog box
         *
         * @method showDialog
         * @public
         */
        showDialog:function()
        {
            this.set('filePreviewDialog',true);
        },

        /**
         * This function is used to hide the add tag modal
         *
         * @method removeModal
         * @public
         */
        removeModal:function(){
            this.set('filePreviewDialog',false);
        },

        /**
         * This function is used to hide the log time modal
         *
         * @method removeLogTimeModal
         * @public
         */
        removeLogTimeModal:function(){
            this.set('logTimeDialog',false);
        },

        /**
         * This function is used to hide the edit log time modal
         *
         * @method removeEditLogModal
         * @public
         */
        removeEditLogModal:function(){
            this.set('editingLog',null);
            this.set('editLogDialog',false);
        },
    }

});