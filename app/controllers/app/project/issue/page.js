/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/* Licensing : http://legal.projects4.me/LICENSE.txt, please don't remove :) */
import Ember from "ember";
import { task } from 'ember-concurrency';

const { get, set } = Ember;
/**
 * This controller is used to manage the issues detail/page view
 *
 * @class Page
 * @namespace Prometheus.Controllers
 * @module App.Project.Issue
 * @extends Ember.Controller
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default Ember.Controller.extend({

    /**
     * The ESA session storage service
     *
     * @param session
     * @type service
     * @private
     */
    session: Ember.inject.service(),

    /**
     * This flag is used to show or hide the modal dialog box
     * for file previews
     *
     * @property previewFileDialog
     * @type bool
     * @for Edit
     * @private
     */
    previewFileDialog: false,

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
                    relatedId: self.get('model').nextObject(0).get('id')
                },
                headers: upload.store.adapterFor('upload').headersForRequest()
            };

            let response = yield file.upload(options);

            let data = JSON.parse(response.body);
            /**
             *
             *
             *
             *
             *  @todo check for errors
             *
             *
             *
             *
             */
            set(upload, 'id',data.data.id);
            set(upload, 'name',data.data.attributes.name);
            set(upload, 'fileSize',data.data.attributes.fileSize);
            set(upload, 'fileType',data.data.attributes.fileType);
            set(upload, 'fileMime',data.data.attributes.fileMime);
            set(upload, 'dateCreated',data.data.attributes.dateCreated);
            set(upload, 'dateModified',data.data.attributes.dateModified);
            set(upload, 'modifiedUser',data.data.attributes.modifiedUser);
            set(upload, 'createdUser',data.data.attributes.createdUser);
            set(upload, 'relatedTo',data.data.attributes.relatedTo);
            set(upload, 'relatedId',data.data.attributes.relatedId);
            set(upload, 'fileThumbnail',data.data.attributes.fileThumbnail);
            self.get('model').nextObject(0).get('files').pushObject(upload);
        } catch (e) {
            //upload.rollback();
        }
    }).maxConcurrency(3).enqueue(),

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
            this.transitionToRoute('app.project.issue.edit',{issueNumber:issueNumber});
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
                message: self.get('i18n').t("view.app.issue.detail.file.delete",{name:file.get('name')}).toString(),
                type: 'warning',
                showCloseButton: true,
                actions: {
                    confirm: {
                        label: self.get('i18n').t("view.app.issue.detail.file.confirmdelete").toString(),
                        action: function() {

                            // destroy the upload
                            file.destroyRecord().then(function(data){
                                // remove from the view by updating the model
                                self.get('model').nextObject(0).get('files').removeObject(file);

                                return deleting.update({
                                    message: self.get('i18n').t("view.app.issue.detail.file.deleted"),
                                    type: 'success',
                                    actions: false
                                });
                            });
                        }
                    },
                    cancel: {
                        label: self.get('i18n').t("view.app.issue.detail.file.onsecondthought").toString(),
                        action: function() {
                            return deleting.update({
                                message: self.get('i18n').t("view.app.issue.detail.file.deletecancel"),
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
            let upload = this.get('store').query('upload',options).then(function(data){
                let downloadLink = data.nextObject(0).get('downloadLink');
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
                let downloadLink = contents.nextObject(0).get('downloadLink');
                Logger.debug('Download link found : '+downloadLink);

                let path = self.get('store').adapterFor('upload').host+'/preview/get/'+downloadLink;
                Ember.$('#file_preview').attr('src',path);
                Logger.debug(path);
            });


            // navigate user to the page for download

            Logger.debug('-App.Project.Issue.PageController->previewFile');
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
        }


    }

});