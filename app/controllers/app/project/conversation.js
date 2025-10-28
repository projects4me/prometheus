/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import PrometheusCreateController from "prometheus/controllers/prometheus/create";
import ProjectRelated from "prometheus/controllers/prometheus/projectrelated";
import Evented from '@ember/object/evented';
import $ from "jquery";
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
/**
 * This is the controller for the conversation controller route
 *
 * @class AppProjectConversationController
 * @namespace Prometheus.Controllers
 * @module App.Project
 * @extends Prometheus
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default class AppProjectConversationController extends PrometheusCreateController.extend(ProjectRelated, Evented) {

    /**
     * This object holds all of the information that we need to create our schema and also need to 
     * render the template (in future).
     * @property metadata
     * @type Object
     * @for AppProjectConversationController
     * @private
     */
    metadata = {
        sections: [
            {
                name: "conversationCreate",
                fields: [
                    {
                        name: "subject",
                        validations: {
                            default: {
                                type: "string",
                                rules: [
                                    {
                                        name: "required"
                                    }
                                ]
                            }
                        }
                    },
                    {
                        name: "description",
                        validations: {
                            default: {
                                type: "string",
                                rules: [
                                    {
                                        name: "required"
                                    }
                                ]
                            }
                        }
                    },
                    {
                        name: "roomType",
                        validations: {
                            default: {
                                type: "string",
                                rules: [
                                    {
                                        name: "required"
                                    }
                                ]
                            }
                        }
                    },
                    {
                        name: "projectId",
                        validations: {
                            default: {
                                type: "string",
                                rules: [
                                    {
                                        name: "required"
                                    }
                                ]
                            }
                        }
                    }
                ]
            }
        ]
    }

    /**
     * Query params that the controller needs to support
     * 
     * @property queryParams
     * @type Array
     * @for AppProjectConversationController
     * @public
     */
    queryParams = ['c_id'];

    /**
     * This function is called on the initialization of the controller. In this function
     * we're calling setupSchema method in order to generate schema, by analyzing metadata
     * defined in the controller, that will be used to validate the form of the template.
     *
     * @method constructor
     * @public
     */
    constructor() {
        super(...arguments);
        this.setupSchema();
    }

    /**
     * This is the flag which is used to
     *
     * @property currentUser
     * @type Ember.Service
     * @for Conversation
     * @public
     */
    shiftPressed = false;

    /**
     * This is the list of issues related to the current project
     *
     * @property issuesList
     * @type Array
     * @for Conversation
     * @public
     */
    issuesList = [];

    /**
     * This is the list users in the system
     *
     * @property usersList
     * @type Array
     * @for Conversation
     * @public
     */
    usersList = [];

    /**
     * This flag is used to show or hide the modal dialog box for adding conversations
     *
     * @property addConversationDialog
     * @type bool
     * @for Conversation
     * @private
     */
    addConversationDialog = false;

    /**
     * PubSub service is used to provide DDAD 
     *
     * @property pubSub
     * @type Ember.Service
     * @for Conversation
     * @private
     */
    @service pubSub;

    /**
     * Available room types
     *
     * @property roomTypes
     * @type Array
     * @for Conversation
     * @private
     */
    roomTypes = [
        { value: "discussion", label: "Discussion" },
        { value: "vote", label: "Vote" }
    ];

    /**
     * Default room type
     *
     * @property roomType
     * @type Object
     * @for Conversation
     * @private
     */
    roomType = { value: "discussion", label: "Discussion" };

    /**
     * Current page for pagination
     * @property currentPage
     * @type {number}
     * @public
     */
    @tracked currentPage = 1;

    /**
     * Page size for pagination
     * @property pageSize
     * @type {number}
     * @public
     */
    @tracked pageSize = 10;

    /**
     * Whether there are more conversations to load
     * @property hasMoreConversations
     * @type {boolean}
     * @public
     */
    @tracked hasMoreConversations = true;

    /**
     * Whether conversations are currently being loaded
     * @property isLoadingConversations
     * @type {boolean}
     * @public
     */
    @tracked isLoadingConversations = false;

    /**
     * Conversations list
     * @property conversations
     * @type {Array}
     * @public
     */
    @tracked conversations = [];

    /**
     * This function is used to create a comment on the conversation.
     *
     * @method saveComment
     * @param {String} relatedId
     * @param {String} contents
     * @public
     */
    @action saveComment(relatedId, contents) {
        Logger.debug('AppProjectConversationController::save()');
        if (contents == undefined) {
            return false;
        }
        let _self = this;

        let comment = this.store.createRecord('comment', {
            relatedId: relatedId,
            relatedTo: 'conversationrooms',
            comment: contents,
        });

        return comment.save().then(function (comment) {
            let conversation = _self.conversations.find(conversation => conversation.id === relatedId);
            conversation.comments.pushObject(comment);
            _self.pubSub.trigger('clearContents');
        });

    }

    /**
     * This function allows us to save votes in the database as comments
     *
     * @method vote
     * @param {String} vote
     * @param {String} relatedId
     * @public
     * @todo Check if the user has already voted if so then disable the vote
     */
    @action vote(vote, relatedId) {
        if (relatedId === null) {
            return false;
        }

        let _self = this;
        let comment = this.store.createRecord('comment', {
            relatedId: relatedId,
            relatedTo: 'conversationrooms',
            comment: vote,
        });


        comment.save().then(function (savedComment) {
            let count = _self.conversations.length;
            while (count > 0) {
                count--;
                if (_self.conversations[count].id === relatedId) {
                    _self.conversations[count].comments.pushObject(savedComment);
                    event.target.value = '';
                    break;
                }
            }
        });
    }

    /**
     * This action is called when we wish to upvote the conversation
     *
     * @method upvote
     * @param {String} conversationId
     * @public
     */
    @action upvote(conversationId) {
        Logger.debug("AppProjectConversationController:upvote(" + conversationId + ")");

        let _self = this;
        let vote = this.store.createRecord('vote', {
            vote: 1,
            relatedTo: 'conversationrooms',
            relatedId: conversationId
        });

        return vote.save().then(function (data) {
            if (data.get('id') !== undefined) {
                new Messenger().post({
                    message: _self.intl.t("views.app.conversation.voted"),
                    tpye: 'success',
                    showCloseButton: true
                });

                _self.conversations.filterBy('id', conversationId)[0].votes.addObject(data);
            }
        });
    }

    /**
     * This function is used to add a new conversation in the system
     *
     * @method addConversation
     * @public
     */
    @action addConversation() {
        Logger.debug('AppProjectConversationController:addConversation');

        let _self = this;

        let newConversation = this.newConversation;
        newConversation.set('projectId', _self.get('projectId'));

        this.validate(newConversation, 'conversationCreate')
            .then((validation) => {
                if (validation.isValid) {
                    // Save it
                    newConversation.save().then(function (conversation) {
                        Logger.debug('A new conversation has been saved');

                        _self.conversations.unshiftObject(conversation);
                        new Messenger().post({
                            message: _self.intl.t("views.app.conversation.created", { name: conversation.get('subject') }),
                            type: 'success',
                            showCloseButton: true
                        });

                        _self.send('removeModal');

                        _self.set('newConversation',
                            _self.get('store').createRecord('conversationroom', {
                                projectShortcode: _self.get('projectShortcode')
                            }));
                    });

                } else {
                    let messages = _self._buildMessages(validation.errors, 'conversation');

                    new Messenger().post({
                        message: messages,
                        type: 'error',
                        showCloseButton: true
                    });
                }
            });
        return false;
    }

    /**
     * This function is called when the issue type is being selected
     *
     * @method selectNewType
     * @param {Object} target
     * @public
     */
    @action selectNewType(target) {
        Logger.debug('App.Project.Conversation.Create:selectNewType');
        let newConversation = this.newConversation;
        newConversation.set('roomType', target.value);
        Logger.debug('-App.Project.Conversation.Create:selectNewType');
    }

    /**
     * This function is used to show the add modal dialog box
     *
     * @method showDialog
     * @public
     */
    @action showDialog() {
        this.set('addConversationDialog', true);
    }

    /**
     * This function is used to hide the add conversation modal
     *
     * @method removeModal
     * @public
     */
    @action removeModal() {
        if (this.isDestroyed || this.isDestroying) return;
        this.set('addConversationDialog', false);
        $('.modal').modal('hide');
    }

    /**
     * This function is used to scroll to the conversation.
     * 
     * @method scrollToConversation
     * @public
     */
    @action scrollToConversation() {
        let conversationId = this.c_id;
        let element = document.getElementById(conversationId);
        this.scrollAndHighlight(element, true);
    }

    /**
     * Loads more conversations for lazy loading
     * @method loadMoreConversations
     * @param {Object} paginationInfo - Object containing page, pageSize, etc.
     * @public
     * @async
     * @returns {Promise<Object>} Returns object with items and metadata
     */
    @action
    async loadMoreConversations(paginationInfo = {}) {
        if (this.isLoadingConversations || !this.hasMoreConversations) {
            return { items: [] };
        }

        const { page, pageSize } = paginationInfo;
        
        try {
            this.isLoadingConversations = true;
            
            let projectId = this.trackedProject.getProjectId();
            let _conversationOptions = {
                order: "DESC",
                sort: "Conversationroom.dateModified",
                query: "(Conversationroom.projectId : " + projectId + ")",
                limit: pageSize,
                page: page
            };

            let newConversations = await this.store.query('conversationroom', _conversationOptions);

            for(let conversation of newConversations.toArray()) {
                let comments = await this.store.query('comment', {
                    query: `(Comment.relatedId : ${conversation.id})`,
                    sort: 'Comment.dateCreated',
                    order: 'ASC',
                    limit: -1
                }).catch((error) => {
                    this.errorManager.handleError(error, {
                        moduleName: 'conversationroom'
                    });
                });
                conversation.comments = comments;
            }
            // Check if we've reached the end
            if (newConversations.length < pageSize) {
                this.hasMoreConversations = false;
            }

            // Add new conversations to the existing list
            this.conversations = [...this.conversations, ...newConversations.toArray()];
            
            return {
                items: newConversations.toArray(),
                hasReachedEnd: !this.hasMoreConversations
            };
        } catch (error) {
            Logger.error('Error loading more conversations:', error);
            this.errorManager.handleError(error, {
                moduleName: 'conversationroom'
            });
            return { items: [] };
        } finally {
            this.isLoadingConversations = false;
        }
    }
}