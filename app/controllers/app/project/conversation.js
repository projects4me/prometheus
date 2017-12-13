/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Ember from "ember";

/**
 * This is the controller for the conversation controller route
 *
 * @class Conversation
 * @namespace Prometheus.Controllers
 * @module App.Project
 * @extends Ember.Controller
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default Ember.Controller.extend(Ember.Evented,{

    /**
     * The current user service
     *
     * @property currentUser
     * @type Ember.Service
     * @for Conversation
     * @public
     */
    currentUser: Ember.inject.service(),

    /**
     * This is the flag which is used to
     *
     * @property currentUser
     * @type Ember.Service
     * @for Conversation
     * @public
     */
    shiftPressed:false,

    /**
     * This is the list of issues related to the current project
     *
     * @property issuesList
     * @type Array
     * @for Conversation
     * @public
     */
    issuesList: [],

    /**
     * This is the list users in the system
     *
     * @property usersList
     * @type Array
     * @for Conversation
     * @public
     */
    usersList: [],

    /**
     * This flag is used to show or hide the modal dialog box for adding conversations
     *
     * @property addConversationDialog
     * @type bool
     * @for Conversation
     * @private
     */
    addConversationDialog: false,

    /**
     * Available room types
     *
     * @property roomTypes
     * @type Array
     * @for Conversation
     * @private
     */
    roomTypes: [
        {value:"discussion", label:"Discussion"},
        {value:"vote", label:"Vote"}
    ],

    /**
     * Default room type
     *
     * @property roomType
     * @type Object
     * @for Conversation
     * @private
     */
    roomType: {value:"discussion", label:"Discussion"},

    /**
     * These are the actions that are handled by this controller
     *
     * @property actions
     * @type Object
     * @for Conversation
     * @public
     */
    actions: {

        /**
         * This function is ued to save a calendar event
         *
         * @method save
         * @param {String} relatedId
         * @param {String} contents
         * @public
         */
        save:function(relatedId,contents){
            Logger.debug('AppProjectConversationController::save()');
            Logger.debug(relatedId);
            Logger.debug(contents);
            let _self = this;

            let comment = this.get('store').createRecord('comment', {
                relatedId: relatedId,
                relatedTo: 'conversationrooms',
                comment: contents,
                dateCreated: 'CURRENT_DATETIME',
                dateModified: 'CURRENT_DATETIME',
                createdUser: _self.get('currentUser.user.id'),
                createdUserName: _self.get('currentUser.user.name'),
                modifiedUser: _self.get('currentUser.user.id'),
                modifiedUserName: _self.get('currentUser.user.name'),
                deleted: 0
            });

            comment.save().then(function (comment) {
                Logger.debug('Comment Saved');
                Logger.debug(comment);
                let count = self.model.get('length');
                while (count > 0)
                {
                    count--;
                    if(self.model.nextObject(count).get('id') === relatedId)
                    {
                        self.model.nextObject(count).get('comments').pushObject(comment);
                        self.trigger('clearContents');
                        break;
                    }
                }
            });

        },

        /**
         * This function allows us to save votes in the database as comments
         *
         * @method vote
         * @param {String} vote
         * @param {String} relatedId
         * @public
         * @todo Check if the user has already voted if so then disable the vote
         */
        vote:function(vote,relatedId) {
            if (relatedId === null)
            {
                return false;
            }

            var self = this;
            let comment = this.get('store').createRecord('comment', {
                relatedId: relatedId,
                relatedTo: 'conversationrooms',
                comment: vote,
                dateCreated: 'CURRENT_DATETIME',
                dateModified: 'CURRENT_DATETIME',
                createdUser: '1',
                createdUserName: 'Hammad Hassan',
                modifiedUser: '1',
                modifiedUserName: 'Hammad Hassan',
                deleted: 0
            });


            comment.save().then(function (savedComment) {
                var count = self.model.get('length');
                while (count > 0)
                {
                    count--;
                    if(self.model.nextObject(count).get('id') === relatedId)
                    {
                        self.model.nextObject(count).get('comments').pushObject(savedComment);
                        event.target.value = '';
                        break;
                    }
                }
            });
        },

        /**
         * This action is called when we wish to upvote the conversation
         *
         * @method upvote
         * @param {String} conversationId
         * @public
         */
        upvote:function(conversationId){
            Logger.debug("AppProjectConversationController:upvote("+conversationId+")");

            var self = this;
            var vote = this.get('store').createRecord('vote',{
                dateCreated:'CURRENT_DATETIME',
                dateModified:'CURRENT_DATETIME',
                createdUser:1,
                modifiedUser:1,
                createdUserName: "Hammad Hassan",
                modifiedUserName: "Hammad Hassan",
                vote: 1,
                relatedTo:'conversationrooms',
                relatedId:conversationId
            });

            vote.save().then(function(data){
                if (data.get('id') !== undefined)
                {
                    new Messenger().post({
                        message: self.get('i18n').t("view.app.conversation.voted"),
                        tpye: 'success',
                        showCloseButton: true
                    });

                    self.get('model').filterBy('id',conversationId)[0].get('votes').addObject(data);
                }
            });
        },

        /**
         * This function is used to add a new conversation in the system
         *
         * @method addConversation
         * @public
         * @todo Load the current user info within the API
         * @todo Unable to add dynamically
         */
        addConversation:function(){
            Logger.debug('AppProjectConversationController:addConversation');
            Logger.debug(this.get('newSubject'));
            Logger.debug(this.get('newTopic'));
            Logger.debug(this.get('roomType'));

            var self = this;

            var newConversation = this.get('store').createRecord('conversationroom',{
                dateCreated:'CURRENT_DATETIME',
                dateModified:'CURRENT_DATETIME',
                deleted:0,
                createdUser:'1',
                modifiedUser:'1',
                createdUserName: 'Hammad Hassan',
                modifiedUserName: 'Hammad Hassan',
                subject: self.get('newSubject'),
                description: self.get('newTopic'),
                roomType: self.get('roomType').value,
                projectId: self.get('projectId')
            });

            // Save it
            newConversation.save().then(function(conversation){
                Logger.debug('A new conversation has been saved');
                Logger.debug(conversation);
                Logger.debug(self);
                //self.set('newSubject','');
                //self.set('newTopic','');
                //self.set('roomType',{value:"discussion", label:"Discussion"});

                new Messenger().post({
                    message: self.get('i18n').t("view.app.conversation.created",{name:conversation.get('subject')}),
                    type: 'success',
                    showCloseButton: true
                });
                window.location.reload(true);
                //self.get('model').addObject(conversation);

            });
        },

        /**
         * This function is used to show the add modal dialog box
         *
         * @method showDialog
         * @public
         */
        showDialog:function()
        {
            this.set('addConversationDialog',true);
        },

        /**
         * This function is used to hide the add conversation modal
         *
         * @method removeModal
         * @public
         */
        removeModal:function(){
            this.set('addConversationDialog',false);
        }

    } // end definition actions

});