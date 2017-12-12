/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Ember from "ember";

/**
 * The controller for the wiki create route, it is loaded when a user clicks on
 * create button
 * e.g. acme.projects4.me/app/1/wiki/create
 *
 * @class Create
 * @namespace Prometheus.Controllers
 * @module App.Project.Wiki
 * @extends Ember.Controller
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default Ember.Controller.extend({

    /**
     * This property is used to control the enabling and disabling of the save
     * button, the save is only enabled if the current model has been modified
     *
     * @property saveDisabled
     * @type String
     * @for Create
     * @private
     */
    saveDisabled: 'true',

    /**
     * The i18n library service that is used in order to get the translations
     *
     * @property i18n
     * @type Ember.Service
     * @for Create
     * @public
     */
    i18n: Ember.inject.service(),

    /**
     * This is the parentId of the wiki page that is being created. Initially it is
     * null
     *
     * @property parentId
     * @type String
     * @for Create
     * @private
     */
    parentId:'',

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
    projectController: Ember.inject.controller('app.project'),

    /**
     * This is a computed property in which gets the list of users
     * in the system loaded by the project controller
     *
     * @property usersList
     * @type Array
     * @for Create
     * @private
     */
    usersList: Ember.computed(function(){
        return this.get('projectController').get('usersList');
    }),

    /**
     * This is a computed property in which gets the list of issues
     * associated with a project loaded by the project controller
     *
     * @property issuesList
     * @type Array
     * @for Create
     * @private
     * @todo I think we would need to observe the project id as this might be updated as there is no dependant key
     */
    issuesList: Ember.computed(function(){
        return this.get('projectController').get('issuesList');
    }),

    /**
     * These are the event handled by this controller
     *
     * @property actions
     * @type Object
     * @for Create
     * @public
     */
    actions: {

        /**
         * This function is responsible for saving the model. After successfully
         * saving the function takes the user to the saved page.
         *
         * @method save
         * @public
         * @todo Trigger the notificaiton
         */
        save:function() {
            let self = this;
            let model = this.get('model');
            model.save().then(function(data){
                Logger.debug('Data saved:');
                Logger.debug(data);
                self.send('refreshWiki');

                new Messenger().post({
                    message: self.get('i18n').t('view.app.wiki.created',{name:data.get('name')}),
                    type: 'success',
                    showCloseButton: true
                });

                self.transitionToRoute('app.project.wiki.page', {projectId:data.get('projectId'),wikiName:data.get('name')});
            });
        },

        /**
         * This function lets a user traverse to the main page of the project
         *
         * @method cancel
         * @public
         * @todo Trigger the notificaiton
         */
        cancel:function(){
            let model = this.get('model');
            this.transitionToRoute('app.project.wiki', {projectId:model.get('projectId')});
        },

        /**
         * The function enables the save button
         *
         * @method changed
         * @public
         * @todo Trigger the notificaiton
         */
        changed:function(){
            Logger.debug('AppProjectWikiCreateController::changed()');
            let model = this.get('model');

            // if (typeof(data) === 'object' && data.markUp !== undefined)
            // {
            //     Logger.debug(model);
            //     model._internalModel._attributes['markUp'] = data.markUp;
            //     model.set('markUp',data.markUp);
            // }

            if (model.get('name') === undefined ||
                model.get('name') === null ||
                model.get('name') === '' ||
                model.get('markUp') === undefined ||
                model.get('markUp') === null ||
                model.get('markUp') === '' ||
                model.get('markUp') === '<p><br></p>')
            {
                this.set('saveDisabled',true);
            }
            else {
                this.set('saveDisabled',null);
            }
        },

        /**
         * This function sets the wikiId as the parent
         *
         * @method wikiChanged
         * @param {String} wiki
         * @public
         */
        wikiChanged:function(wiki){
            var model = this.get('model');
            this.set('parentId',wiki.value);
            model.set('parentId',wiki.value);
            model.set('parentName',wiki.label);
            this.send('changed');
        },

        /**
         * This is the action that is passed to used to get
         * changed from summernote following the data down
         * action up approach
         *
         * @method onContentChange
         * @param contents
         * @private
         */
        onContentChange:function (contents) {
            Logger.debug('Prometheus.App.Project.Wiki.onContentChange');
            let self = this;

            Logger.debug(self);
            self.get('model').set('markUp',contents);
            self.send('changed');
            -Logger.debug('Prometheus.App.Project.Wiki.onContentChange');
        }

    }

});