/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { task } from 'ember-concurrency';
import Controller from '@ember/controller';
import { inject } from '@ember/service';
import { get } from '@ember/object';
import { set } from '@ember/object';
import $ from 'jquery';

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
export default Controller.extend({

    /**
     * The current user service
     *
     * @property currentUser
     * @type Ember.Service
     * @for Page
     * @public
     */
    currentUser: inject(),

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
    store: inject(),


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
                    relatedId: self.get('model').objectAt(0).get('id')
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
            set(upload, 'relatedTo',data.data.attributes.relatedTo);
            set(upload, 'relatedId',data.data.attributes.relatedId);
            set(upload, 'fileThumbnail',data.data.attributes.fileThumbnail);
            self.get('model').objectAt(0).get('files').pushObject(upload);
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
            var model = this.get('model').objectAt(0);
            this.transitionToRoute('app.project.wiki.edit', {project_id:model.get('projectId'),wiki_name:model.get('name')});
        },

        /**
         * This function is used to navigate the user to the parent Id
         *
         * @method loadWiki
         * @public
         */
        loadWiki(projectId,wikiName){
            this.transitionToRoute('app.project.wiki.page', {project_id:projectId,wiki_name:wikiName});
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
            this.transitionToRoute('app.project.wiki.create', {project_id:this.get('projectId')});
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

            let self = this;
            let vote = this.get('store').createRecord('vote',{
                vote: 1,
                relatedTo:'wiki',
                relatedId:wikiId
            });


            vote.save().then(function(data){
                if (data.get('id') !== undefined)
                {
                    new Messenger().post({
                        message: self.get('i18n').t("views.app.wiki.voted"),
                        tpye: 'success',
                        showCloseButton: true
                    });
                    self.get('model').objectAt(0).get('vote').addObject(data);
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
            var model = this.get('model').objectAt(0);
            if (action === 'unlock')
            {
                set(model,'locked',"1");
            }
            else if (action === 'lock')
            {
                set(model,'locked',"0");
            }

            model.save().then(function(){
                var message = '';
                if (action === 'unlock')
                {
                    message = self.get('i18n').t("views.app.wiki.page.unlocked");
                }
                else if (action === 'lock')
                {
                    message = self.get('i18n').t("views.app.wiki.page.locked");
                }

                new Messenger().post({
                    message: self.get('i18n').t("views.app.wiki.page.lock",{action:message}),
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
                message: self.get('i18n').t("views.app.wiki.page.file.delete",{name:file.get('name')}).toString(),
                type: 'warning',
                showCloseButton: true,
                actions: {
                    confirm: {
                        label: self.get('i18n').t("views.app.wiki.page.file.confirmdelete").toString(),
                        action: function() {

                            // destroy the upload
                            file.destroyRecord().then(function(){
                                // remove from the view by updating the model
                                self.get('model').objectAt(0).get('files').removeObject(file);

                                return deleting.update({
                                    message: self.get('i18n').t("views.app.wiki.page.file.deleted"),
                                    type: 'success',
                                    actions: false
                                });
                            });
                        }
                    },
                    cancel: {
                        label: self.get('i18n').t("views.app.wiki.page.file.onsecondthought").toString(),
                        action: function() {
                            return deleting.update({
                                message: self.get('i18n').t("views.app.wiki.page.file.deletecancel"),
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
            this.get('store').query('upload',options).then(function(data){
                let downloadLink = data.objectAt(0).get('downloadLink');
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
                let downloadLink = contents.objectAt(0).get('downloadLink');
                Logger.debug('Download link found : '+downloadLink);

                let path = self.get('store').adapterFor('upload').host+'/preview/get/'+downloadLink;
                $('#file_preview').attr('src',path);
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