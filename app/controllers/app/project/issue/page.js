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
     * This is a task to handle file uploading
     *
     * @param handleUpload
     * @type task
     * @private
     */
    handleUpload: task(function * (file) {
        Logger.debug('============================');
        Logger.debug(file);
        let self = this;
        Logger.debug(self);

        let upload = this.store.createRecord('upload', {});

        Logger.debug(upload);

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

        uploadFile:function(file){
            get(this, 'handleUpload').perform(file);
        }

    }

});