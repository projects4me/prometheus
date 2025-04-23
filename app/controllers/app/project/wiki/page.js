/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import PrometheusController from "prometheus/controllers/prometheus";
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { set } from '@ember/object';
import $ from 'jquery';
import { htmlSafe } from '@ember/template';
import { action } from '@ember/object';

/**
 * The controller for the wiki page route, it is loaded when a user tried to
 * navigate to a particular wiki page
 *
 * e.g. acme.projects4.me/app/1/wiki/Home
 * By default this controller is configured to load the project selection
 *
 * @class AppProjectWikiPageController
 * @namespace Prometheus.Controllers
 * @module App.Project.Wiki
 * @extends Prometheus
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default class AppProjectWikiPageController extends PrometheusController {

    /**
     * These are the tags that the user has selected.
     *
     * @property selectedTags
     * @type Array
     * @for Page
     * @private
     */
    selectedTags = [];

    /**
     * Count of the votes cast for this wiki page
     *
     * @property votes
     * @type Integer
     * @for Page
     * @private
     */
    votes = 0;

    /**
     * This is the store service which is used to interact with the data API
     *
     * @property store
     * @type Service
     * @for Page
     * @private
     */
    @service store;


    /**
     * This flag is used to show or hide the modal dialog box
     * for file previews
     *
     * @property previewFileDialog
     * @type bool
     * @for Edit
     * @private
     */
    previewFileDialog = false;

    /**
     * This is a task to handle file uploading
     *
     * @param handleUpload
     * @type task
     * @private
     */
    @(task(function* (file) {
        let _self = this;

        let upload = this.store.createRecord('upload', {});

        try {
            let { access_token } = _self.get('session.data.authenticated');
            let options = {
                url: upload.store.adapterFor('upload').buildURL('upload'),
                data: {
                    relatedTo: 'wiki',
                    relatedId: _self.get('model').get('id')
                },
                headers: { 'Authorization': `Bearer ${access_token}` }
            };

            let response = yield file.upload(options);

            let data = JSON.parse(response.body);
            set(upload, 'id', data.data.id);
            set(upload, 'name', data.data.attributes.name);
            set(upload, 'fileSize', data.data.attributes.fileSize);
            set(upload, 'fileType', data.data.attributes.fileType);
            set(upload, 'fileMime', data.data.attributes.fileMime);
            set(upload, 'relatedTo', data.data.attributes.relatedTo);
            set(upload, 'relatedId', data.data.attributes.relatedId);
            set(upload, 'fileThumbnail', data.data.attributes.fileThumbnail);
            _self.get('model').get('files').pushObject(upload);
        } catch (e) {
            new Messenger().post({
                message: _self.intl.t("global.oops"),
                type: 'error',
                showCloseButton: true
            });
            //upload.rollback();
        }
    })).maxConcurrency(3).enqueue() handleUpload


    /**
     * Load the edit page
     *
     * @method edit
     * @public
     * @todo Trigger the notificaiton
     */
    @action edit() {
        let model = this.model;
        this.transitionToRoute('app.project.wiki.edit', { shortcode: this.trackedProject.shortCode, wiki_name: model.get('name') });
    }

    /**
     * This function is used to navigate the user to the parent Id
     *
     * @method loadWiki
     * @public
     */
    @action loadWiki(projectId, wikiName) {
        this.transitionToRoute('app.project.wiki.page', { shortcode: this.trackedProject.shortCode, wiki_name: wikiName });
    }

    /**
     * This function is called when the user presses the create button
     *
     * @method create
     * @public
     */
    @action create() {
        Logger.debug('Create a page for ');
        Logger.debug(this.projectId);
        this.transitionToRoute('app.project.wiki.create', { shortcode: this.trackedProject.shortCode });
    }

    /**
     * This function is called when the user presses the delete button
     *
     * @method delete
     * @public
     */
    @action delete() {
        new Messenger().post({
            message: 'No can\'t do',
            type: 'error',
            showCloseButton: true
        });
    }

    /**
     * This action is called when we wish to upvote on a wiki page.
     *
     * @method upvote
     * @param {String} wikiId
     * @public
     */
    @action upvote(wikiId) {
        Logger.debug("AppProjectWikiPageController:upvote(" + wikiId + ")");

        let _self = this;
        let vote = this.store.createRecord('vote', {
            vote: 1,
            relatedTo: 'wiki',
            relatedId: wikiId
        });


        vote.save().then(function (data) {
            if (data.get('id') !== undefined) {
                new Messenger().post({
                    message: _self.intl.t("views.app.wiki.voted"),
                    tpye: 'success',
                    showCloseButton: true
                });
                _self.get('model').get('vote').addObject(data);
                _self.set('iVoted', 1);
            }
        });
    }

    /**
     * This action is called when we wish to lock or unlock a wiki page
     *
     * @method lockWiki
     * @param {String} action
     * @public
     */
    @action lockWiki(action) {
        let _self = this;
        let model = this.model;
        if (action === 'unlock') {
            set(model, 'locked', "1");
        }
        else if (action === 'lock') {
            set(model, 'locked', "0");
        }

        model.save().then(function () {
            let message = '';
            if (action === 'unlock') {
                message = _self.intl.t("views.app.wiki.page.unlocked");
            }
            else if (action === 'lock') {
                message = _self.intl.t("views.app.wiki.page.locked");
            }

            new Messenger().post({
                message: _self.intl.t("views.app.wiki.page.lock", { action: message }),
                tpye: 'success',
                showCloseButton: true
            });

        });
    }

    /**
     * This event is called when it is required to upload a file
     * This function acts as a bridge event
     *
     * @param file
     */
    @action uploadFile(file) {
        this.handleUpload.perform(file);
    }

    /**
     * This function is used to handle the deletion of a file
     *
     * @param file
     */
    @action deleteFile(file) {
        Logger.debug('App.Project.Wiki.PageController->deleteFile');
        let _self = this;

        let deleting = new Messenger().post({
            message: htmlSafe(_self.intl.t("views.app.wiki.page.file.delete", { name: file.get('name') })),
            type: 'warning',
            showCloseButton: true,
            actions: {
                confirm: {
                    label: htmlSafe(_self.intl.t("views.app.wiki.page.file.confirmdelete")),
                    action: function () {

                        // destroy the upload
                        file.destroyRecord().then(function () {
                            // remove from the view by updating the model
                            _self.get('model').get('files').removeObject(file);

                            return deleting.update({
                                message: _self.intl.t("views.app.wiki.page.file.deleted"),
                                type: 'success',
                                actions: false
                            });
                        });
                    }
                },
                cancel: {
                    label: _self.intl.t("views.app.wiki.page.file.onsecondthought"),
                    action: function () {
                        return deleting.update({
                            message: _self.intl.t("views.app.wiki.page.file.deletecancel"),
                            type: 'success',
                            actions: false
                        });
                    }
                },

            }
        });

        Logger.debug('-App.Project.Wiki.PageController->deleteFile');
    }

    /**
     * This function is used to handle the download of a file
     *
     * @param file
     */
    @action downloadFile(file) {
        Logger.debug('App.Project.Wiki.PageController->downloadFile');
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

            // navigate user to the page for download
            let path = _self.get('store').adapterFor('upload').host + '/download/get/' + downloadLink;
            window.open(path, '_blank');
            Logger.debug(path);

        });

        Logger.debug('-App.Project.Wiki.PageController->downloadFile');
    }

    /**
     * This function is used to handle the preview of a file
     *
     * @param file
     */
    @action previewFile(file) {
        Logger.debug('App.Project.Wiki.PageController->previewFile');
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

        Logger.debug('-App.Project.Wiki.PageController->previewFile');
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
    }
}