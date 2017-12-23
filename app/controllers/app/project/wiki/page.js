/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Ember from "ember";
import { task } from 'ember-concurrency';

const { get, set } = Ember;
const { inject: { service } } = Ember;

/**
 * The controller for the wiki page route, it is loaded when a user tried to
 * navigate to a particular wiki page
 *
 * e.g. acme.projects4.me/app/1/wiki/Home
 * By default this controller is configured to load the project selection
 *
 * @class Page
 * @namespace Prometheus.Controllers
 * @module App.Project.Wiki
 * @extends Ember.Controller
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default Ember.Controller.extend({

    /**
     * The current user service
     *
     * @property currentUser
     * @type Ember.Service
     * @for Page
     * @public
     */
    currentUser: Ember.inject.service(),

    /**
     * These are the tags that the user has selected.
     *
     * @property selectedTags
     * @type Array
     * @for Page
     * @private
     */
    selectedTags:[],

    /**
     * Count of the votes cast for this wiki page
     *
     * @property votes
     * @type Integer
     * @for Page
     * @private
     */
    votes:0,

    /**
     * This is the store service which is used to interact with the data API
     *
     * @property store
     * @type Service
     * @for Page
     * @private
     */
    store: service(),


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
                    relatedTo: 'wiki',
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
     * These are the actions hanlded by this Controller
     *
     * @property actions
     * @type Object
     * @for Page
     * @public
     */
    actions: {

        /**
         * Load the eidt page
         *
         * @method edit
         * @public
         * @todo Trigger the notificaiton
         */
        edit:function() {
            var model = this.get('model').nextObject(0);
            this.transitionToRoute('app.project.wiki.edit', {projectId:model.get('projectId'),wikiName:model.get('name')});
        },

        /**
         * This function is used to navigate the user to the parent Id
         *
         * @method loadWiki
         * @public
         */
        loadWiki(projectId,wikiName){
            this.transitionToRoute('app.project.wiki.page', {projectId:projectId,wikiName:wikiName});
        },

        /**
         * This function is called when the user presses the create button
         *
         * @method create
         * @public
         */
        create:function(){
            Logger.debug('Create a page for ');
            Logger.debug(this.get('projectId'));
            this.transitionToRoute('app.project.wiki.create', {projectId:this.get('projectId')});
        },

        /**
         * This function is called when the user presses the delete button
         *
         * @method delete
         * @public
         */
        delete:function(){
            new Messenger().post({
                message: 'No can\'t do',
                type: 'error',
                showCloseButton: true
            });
        },

        /**
         * This action is called when we wish to upvote on a wiki page.
         *
         * @method upvote
         * @param {String} wikiId
         * @public
         */
        upvote:function(wikiId){
            Logger.debug("AppProjectWikiPageController:upvote("+wikiId+")");

            var self = this;
            var vote = this.get('store').createRecord('vote',{
                dateCreated:'CURRENT_DATETIME',
                dateModified:'CURRENT_DATETIME',
                createdUser:1,
                modifiedUser:1,
                createdUserName: "Hammad Hassan",
                modifiedUserName: "Hammad Hassan",
                vote: 1,
                relatedTo:'wiki',
                relatedId:wikiId
            });


            vote.save().then(function(data){
                if (data.get('id') !== undefined)
                {
                    new Messenger().post({
                        message: self.get('i18n').t("view.app.wiki.voted"),
                        tpye: 'success',
                        showCloseButton: true
                    });
                    self.get('model').nextObject(0).get('vote').addObject(data);
                    self.set('iVoted',1);
                }
            });
        },

        /**
         * This action is called when we wish to lock or unlock a wiki page
         *
         * @method lockWiki
         * @param {String} action
         * @public
         */
        lockWiki:function(action){
            var self = this;
            var model = this.get('model').nextObject(0);
            if (action === 'unlock')
            {
                Ember.set(model,'locked',"1");
            }
            else if (action === 'lock')
            {
                Ember.set(model,'locked',"0");
            }

            model.save().then(function(){
                var message = '';
                if (action === 'unlock')
                {
                    message = self.get('i18n').t("view.app.wiki.page.unlocked");
                }
                else if (action === 'lock')
                {
                    message = self.get('i18n').t("view.app.wiki.page.locked");
                }

                new Messenger().post({
                    message: self.get('i18n').t("view.app.wiki.page.lock",{action:message}),
                    tpye: 'success',
                    showCloseButton: true
                });

            });

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
            Logger.debug('App.Project.Wiki.PageController->deleteFile');
            let self = this;
            Logger.debug(self);

            let deleting = new Messenger().post({
                message: self.get('i18n').t("view.app.wiki.page.file.delete",{name:file.get('name')}).toString(),
                type: 'warning',
                showCloseButton: true,
                actions: {
                    confirm: {
                        label: self.get('i18n').t("view.app.wiki.page.file.confirmdelete").toString(),
                        action: function() {

                            // destroy the upload
                            file.destroyRecord().then(function(data){
                                // remove from the view by updating the model
                                self.get('model').nextObject(0).get('files').removeObject(file);

                                return deleting.update({
                                    message: self.get('i18n').t("view.app.wiki.page.file.deleted"),
                                    type: 'success',
                                    actions: false
                                });
                            });
                        }
                    },
                    cancel: {
                        label: self.get('i18n').t("view.app.wiki.page.file.onsecondthought").toString(),
                        action: function() {
                            return deleting.update({
                                message: self.get('i18n').t("view.app.wiki.page.file.deletecancel"),
                                type: 'success',
                                actions: false
                            });
                        }
                    },

                }
            });

            Logger.debug('-App.Project.Wiki.PageController->deleteFile');
        },

        /**
         * This function is used to handle the download of a file
         *
         * @param file
         */
        downloadFile:function(file){
            Logger.debug('App.Project.Wiki.PageController->downloadFile');
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

                // navigate user to the page for download
                let path = self.get('store').adapterFor('upload').host+'/download/get/'+downloadLink;
                window.open(path,'_blank');
                Logger.debug(path);

            });

            Logger.debug('-App.Project.Wiki.PageController->downloadFile');
        },

        /**
         * This function is used to handle the preview of a file
         *
         * @param file
         */
        previewFile:function(file){
            Logger.debug('App.Project.Wiki.PageController->previewFile');
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

            Logger.debug('-App.Project.Wiki.PageController->previewFile');
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