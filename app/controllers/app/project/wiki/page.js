/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Ember from "ember";

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

        }

    }

});