/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Prometheus from "prometheus/controllers/prometheus";
import Evented from '@ember/object/evented';
import $ from "jquery";

/**
 * This is the controller for the conversation controller route
 *
 * @class Conversation
 * @namespace Prometheus.Controllers
 * @module App.Project
 * @extends Prometheus
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default Prometheus.extend(Evented,{

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
        save(relatedId,contents){
            Logger.debug('AppProjectConversationController::save()');
            let _self = this;

            let comment = this.get('store').createRecord('comment', {
                relatedId: relatedId,
                relatedTo: 'conversationrooms',
                comment: contents,
            });

            comment.save().then(function (comment) {
                let count = _self.model.get('length');
                while (count > 0)
                {
                    count--;
                    if(_self.model.objectAt(count).get('id') === relatedId)
                    {
                        _self.model.objectAt(count).get('comments').pushObject(comment);
                        _self.trigger('clearContents');
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
        vote(vote,relatedId) {
            if (relatedId === null)
            {
                return false;
            }

            let _self = this;
            let comment = this.get('store').createRecord('comment', {
                relatedId: relatedId,
                relatedTo: 'conversationrooms',
                comment: vote,
            });


            comment.save().then(function (savedComment) {
                let count = _self.model.get('length');
                while (count > 0)
                {
                    count--;
                    if(_self.model.objectAt(count).get('id') === relatedId)
                    {
                        _self.model.objectAt(count).get('comments').pushObject(savedComment);
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
        upvote(conversationId){
            Logger.debug("AppProjectConversationController:upvote("+conversationId+")");

            let _self = this;
            let vote = this.get('store').createRecord('vote',{
                vote: 1,
                relatedTo:'conversationrooms',
                relatedId:conversationId
            });

            vote.save().then(function(data){
                if (data.get('id') !== undefined)
                {
                    new Messenger().post({
                        message: _self.get('i18n').t("views.app.conversation.voted"),
                        tpye: 'success',
                        showCloseButton: true
                    });

                    _self.get('model').filterBy('id',conversationId)[0].get('votes').addObject(data);
                }
            });
        },

        /**
         * This function is used to add a new conversation in the system
         *
         * @method addConversation
         * @public
         */
        addConversation(){
            Logger.debug('AppProjectConversationController:addConversation');

            let _self = this;

            let newConversation = this.get('newConversation');
            newConversation.set('projectId',_self.get('projectId'));

            newConversation.validate()
                .then(({ validations }) => {

                    if (validations.get('isValid')) {
                        // Save it
                        newConversation.save().then(function (conversation) {
                            Logger.debug('A new conversation has been saved');

                            _self.get('model').unshiftObject(conversation);
                            new Messenger().post({
                                message: _self.get('i18n').t("views.app.conversation.created", {name: conversation.get('subject')}),
                                type: 'success',
                                showCloseButton: true
                            });

                            _self.send('removeModal');

                            _self.set('newConversation',
                                _self.get('store').createRecord('conversationroom',{}));
                        });

                    } else {
                        let messages = _self._buildMessages(validations,'conversation');

                        new Messenger().post({
                            message: messages,
                            type: 'error',
                            showCloseButton: true
                        });
                    }
                });
            return false;
        },

        /**
         * This function is called when the issue type is being selected
         *
         * @method selectNewType
         * @param {Object} target
         * @public
         */
        selectNewType(target)
        {
            Logger.debug('App.Project.Conversation.Create:selectNewType');
            let newConversation = this.get('newConversation');
            newConversation.set('roomType',target.value);
            Logger.debug('-App.Project.Conversation.Create:selectNewType');
        },

        /**
         * This function is used to show the add modal dialog box
         *
         * @method showDialog
         * @public
         */
        showDialog()
        {
            this.set('addConversationDialog',true);
        },

        /**
         * This function is used to hide the add conversation modal
         *
         * @method removeModal
         * @public
         */
        removeModal(){
            this.set('addConversationDialog',false);
            $('.modal').modal('hide');
        }

    } // end definition actions

});