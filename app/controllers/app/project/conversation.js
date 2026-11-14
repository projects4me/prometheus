/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import ProjectRelated from "prometheus/controllers/prometheus/projectrelated";
import Evented from '@ember/object/evented';
import $ from "jquery";
import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task, timeout } from 'ember-concurrency';
import format from 'prometheus/utils/data/format';
import { peekOrPush, pushIfMissing, removeById } from 'prometheus/utils/live/collection';
import UrlState from 'prometheus/utils/state/url-state';
import ListLoader from 'prometheus/utils/state/list-loader';
import ThreadCounts from 'prometheus/utils/conversation/thread-counts';
import { fetchRoomCounts } from 'prometheus/utils/conversation/room-counts';
import { BROWSER_PARAMS } from 'prometheus/utils/conversation/browser-defaults';
import { addRecord, removeRecord } from 'prometheus/utils/array/record-list';
import { toArray } from 'prometheus/utils/array/to-array';
import {
    buildConversationListRequest, buildSortOptions, buildGroupOptions, arrangeConversations
} from 'prometheus/utils/conversation/list-options';

/**
 * Conversation rooms controller, including Hermes live handlers for comments,
 * votes, and conversation-created events on the tracked project.
 *
 * @class AppProjectConversationController
 * @namespace Prometheus.Controllers
 * @module App.Project
 * @extends Prometheus
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default class AppProjectConversationController extends ProjectRelated.extend(Evented) {

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
    queryParams = ['c_id', 'query', 'searchId', 'page', 'sort', 'order', 'group'];

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
        this.conversationList = new ListLoader({
            store: this.store,
            modelName: 'conversationroom',
            pageSize: this.pageSize,
            owner: this,
            buildRequest: values => buildConversationListRequest(this.trackedProject.getProjectId(), values)
        });
        this.threadCounts = new ThreadCounts({ owner: this, fetch: roomIds => fetchRoomCounts(this.store, roomIds) });
        this.urlState = new UrlState(this, { schema: BROWSER_PARAMS, routeName: 'app.project.conversation' });
        this.urlState.onChange(values => this.paramsChanged(values));
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
     * Hermes socket client used to register conversation live events.
     *
     * @property hermes
     * @type Ember.Service
     * @for Conversation
     * @private
     */
    @service hermes;

    /**
     * Reload prompt shown when a live event cannot be applied in place.
     *
     * @property liveReloadPrompt
     * @type Ember.Service
     * @for Conversation
     * @private
     */
    @service liveReloadPrompt;

    /**
     * Disposer returned by hermes.register() for this screen.
     *
     * @property hermesDisposer
     * @type Function|null
     * @for AppProjectConversationController
     * @private
     */
    hermesDisposer = null;

    /**
     * Current user
     * @property currentUser
     * @type Ember.Service
     * @for Conversation
     * @public
     */
    @service currentUser;

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
     * @property page
     * @type {number}
     * @public
     */
    @tracked page = 1;

    /**
     * Page size for pagination
     * @property pageSize
     * @type {number}
     * @public
     */
    @tracked pageSize = 20;

    /**
     * Selected issue for linking to a new conversation (create modal).
     * @property newConversationLinkedIssue
     * @type {Object|null}
     * @public
     */
    @tracked newConversationLinkedIssue = null;

    /**
     * Task to load issue options for the Link Issue dropdown (create/edit modals).
     * Returns issues in the current project that are not already linked to a conversation.
     *
     * @property linkIssueSearch
     * @type {Task}
     * @public
     */
    linkIssueSearch = task(async (query) => {
        await timeout(300);
        let projectId = this.projectId;
        let baseQuery = `(Issue.projectId : ${projectId}) AND (Issue.conversationRoomId NULL)`;
        let searchClause = query && String(query).trim()
            ? ` AND ((Issue.issueNumber CONTAINS ${query}) OR (Issue.subject CONTAINS ${query}) OR (Issue.description CONTAINS ${query}))`
            : '';
        let options = {
            query: baseQuery + searchClause,
            limit: 10,
            sort: 'Issue.issueNumber',
            order: 'DESC'
        };
        let data = await this.store.query('issue', options);
        let map = {
            id: 'id',
            name: 'subject',
            number: 'issueNumber',
            status: 'status',
            project: 'project'
        };
        return (new format(this)).getSelectList(data, map);
    });

    /**
     * This function is used to create a comment on the conversation.
     *
     * @method saveComment
     * @param {String} relatedId
     * @param {String} contents
     * @param {Array} mentionedIssues
     * @public
     */
    @action saveComment(relatedId, contents, mentionedIssues) {
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

        return comment.save({adapterOptions: {mentionedIssues: mentionedIssues}}).then(function (comment) {
            // The open thread's comments belong to the page controller, which adds the returned comment
            if(_self.selectedConversation?.id !== relatedId) {
                pushIfMissing(_self.findConversationById(relatedId)?.comments, comment);
            }
            return comment;
        }).catch(function (error) {
            if (comment.isNew) {
                comment.unloadRecord();
            }
            throw error;
        });
    }

    /**
     * This function allows us to save votes in the database as comments
     *
     * @method vote
     * @param {String} vote
     * @param {String} relatedId
     * @returns {Promise<Object>|Boolean} The saved vote comment
     * @public
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


        return comment.save().then(function (savedComment) {
            if(_self.selectedConversation?.id === relatedId) {
                pushIfMissing(_self.selectedConversation.comments, savedComment);
            } else {
                pushIfMissing(
                    _self.listedConversations.find((conversation) => conversation.id === relatedId)?.comments,
                    savedComment
                );
            }
            return savedComment;
        });
    }

    /**
     * This action is called when we wish to upvote the conversation
     *
     * @method upvote
     * @param {String} conversationId
     * @public
     */
    @action async upvote(conversationId) {
        Logger.debug("AppProjectConversationController:upvote(" + conversationId + ")");

        let _self = this;
        let vote = this.store.createRecord('vote', {
            vote: 1,
            relatedTo: 'conversationrooms',
            relatedId: conversationId
        });

        let messenger = new Messenger().post({
            message: _self.intl.t("views.app.conversation.addingVote"),
            type: 'info',
            showCloseButton: true,
            hideAfter: false
        });

        try {   
            let data = await vote.save();
            if (data.get('id') !== undefined) {
                messenger.update({
                    message: _self.intl.t("views.app.conversation.addedVote"),
                    tpye: 'success',
                    showCloseButton: true,
                    hideAfter: 3

                });

                if(_self.selectedConversation?.id === conversationId) {
                    addRecord(_self.selectedConversation.votes, data);
                } else {
                    addRecord(_self.listedConversations.find((conversation) => conversation.id === conversationId).votes, data);
                }
            }
        } catch(error) {
            messenger.update({
                message: _self.intl.t("views.app.conversation.addVoteError"),
                type: 'error',
                showCloseButton: true,
                hideAfter: 3
            });
            Logger.error('Error adding vote:', error);
        }
    }

    /**
     * Removes the current user's vote from a conversation.
     *
     * @method removeVote
     * @param {String} conversationId
     * @param {Object} voteRecord The vote model to destroy
     * @public
     */
    @action async removeVote(conversationId, voteRecord) {
        let _self = this;
        let messenger = new Messenger().post({
            message: _self.intl.t("views.app.conversation.removingVote"),
            type: 'info',
            showCloseButton: true,
            hideAfter: false
        });
        try {
            await voteRecord.destroyRecord();
            messenger.update({
                message: _self.intl.t("views.app.conversation.removedVote"),
                type: 'success',
                showCloseButton: true,
                hideAfter: 3
            });
            let conversation = _self.selectedConversation?.id === conversationId
                ? _self.selectedConversation
                : _self.listedConversations.find((c) => c.id === conversationId);
            if (conversation && conversation.votes) {
                removeRecord(conversation.votes, voteRecord);
            }
        } catch (error) {
            messenger.update({
                message: _self.intl.t("views.app.conversation.removeVoteError"),
                type: 'error',
                showCloseButton: true,
                hideAfter: 3
            });
            Logger.error('Error removing vote:', error);
        }
    }

    /**
     * Toggles the current user's vote: adds vote if not voted, removes vote if already voted.
     *
     * @method toggleVote
     * @param {String} conversationId
     * @public
     */
    @action async toggleVote(conversationId) {
        let conversation = this.selectedConversation?.id === conversationId
            ? this.selectedConversation
            : this.listedConversations.find((c) => c.id === conversationId);
        if (!conversation || !conversation.votes) return;

        let userVote = toArray(conversation.votes).find((v) => v.createdUser === this.currentUser.user.id);
        if (userVote) {
            await this.removeVote(conversationId, userVote);
        } else {
            await this.upvote(conversationId);
        }
        return true;
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
                    let linkedIssue = _self.newConversationLinkedIssue;
                    if (linkedIssue && linkedIssue.id) {
                        newConversation.set('issueId', linkedIssue.id);
                        let issue = _self.store.peekRecord('issue', linkedIssue.id);
                        if (issue) newConversation.set('issue', issue);
                        issue.set('conversationRoomId', newConversation.id);
                        issue.save().then(function (issue) {
                            Logger.debug('The issue has been linked to the conversation');
                        });
                    }
                    newConversation.save().then(function (conversation) {
                        Logger.debug('A new conversation has been saved');

                        _self.afterConversationCreated(conversation);
                        new Messenger().post({
                            message: _self.intl.t("views.app.conversation.created", { name: conversation.get('subject') }),
                            type: 'success',
                            showCloseButton: true
                        });

                        _self.send('removeModal');
                        _self.set('newConversationLinkedIssue', null);
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
     * Sets the selected issue for linking to the new conversation (create modal).
     *
     * @method setNewConversationLinkedIssue
     * @param {Object|null} issue Option object with id, number, name
     * @public
     */
    @action setNewConversationLinkedIssue(issue) {
        this.newConversationLinkedIssue = issue;
    }

    /**
     * Saves a thread edited in the edit thread modal: subject and description, then the linked issue. Rolls the
     * unsaved attributes back and rethrows when a save fails.
     *
     * @method updateConversation
     * @param {Object} conversation Conversation model
     * @param {Object} changes { subject, description, linkedIssue }
     * @returns {Promise}
     * @public
     */
    @action async updateConversation(conversation, { subject, description, linkedIssue }) {
        Logger.debug('AppProjectConversationController::updateConversation');
        try {
            conversation.set('subject', subject);
            conversation.set('description', description);
            await conversation.save();
            await this.updateConversationLinkedIssue(conversation, linkedIssue);
        } catch (error) {
            conversation.rollbackAttributes();
            throw error;
        }
    }

    /**
     * Persists the linked issue for a conversation (edit modal). Called by updateConversation.
     *
     * @method updateConversationLinkedIssue
     * @param {Object} conversation Conversation model
     * @param {Object|null} selectedIssue Option object with id, number, name
     * @public
     */
    @action async updateConversationLinkedIssue(conversation, selectedIssue) {
        let issueId = selectedIssue && selectedIssue.id ? selectedIssue.id : null;
        let issueNumber = selectedIssue && selectedIssue.number ? selectedIssue.number : null;
        if (selectedIssue) {
            let issue = this.store.peekRecord('issue', issueId);
            issue.conversationRoomId = conversation.id;
            conversation.issueNumber = issueNumber;
            conversation.issueId = issueId;
            conversation.issue = issue;
            await issue.save();
        } else if (conversation.issueId) {
            let issue = await this.store.findRecord('issue', conversation.issueId);
            if (issue) {
                issue.conversationRoomId = null;
                conversation.issueNumber = null;
                conversation.issueId = null;
                conversation.issue = null;
                await issue.save();
            }
        }
        await conversation.save();
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
        this.set('newConversationLinkedIssue', null);
    }

    /**
     * Registers the conversation screen's Hermes intents for the tracked project.
     *
     * @method registerHermesIntents
     * @param {String} projectId Tracked project id
     * @returns {void}
     * @public
     */
    registerHermesIntents(projectId) {
        this.unregisterHermesIntents();
        if (!projectId) {
            return;
        }
        this.hermesDisposer = this.hermes.register(this, projectId, {
            'conversation.comment.created': this.handleCommentCreated.bind(this),
            'conversation.comment.updated': this.handleCommentUpdated.bind(this),
            'conversation.comment.deleted': this.handleCommentDeleted.bind(this),
            'conversation.vote.added': this.handleVoteAdded.bind(this),
            'conversation.vote.removed': this.handleVoteRemoved.bind(this),
            'conversation.created': this.handleConversationCreated.bind(this)
        });
    }

    /**
     * Disposes the conversation screen's Hermes registration and clears the
     * reload prompt.
     *
     * @method unregisterHermesIntents
     * @returns {void}
     * @public
     */
    unregisterHermesIntents() {
        this.hermesDisposer?.();
        this.hermesDisposer = null;
        this.liveReloadPrompt.clear(this);
    }

    /**
     * Appends a newly created comment onto its conversation room.
     *
     * @method handleCommentCreated
     * @param {Object} envelope Domain-event envelope
     * @returns {void}
     * @public
     */
    handleCommentCreated(envelope) {
        this.threadCounts.addComment(envelope.changes?.relatedId, envelope.resource.id, envelope.changes?.comment);
        let room = this.findConversationForEvent(envelope);
        if (!room || this.isOpenThread(room)) {
            return;
        }
        let comment = peekOrPush(
            this.store,
            'comment',
            envelope.resource.id,
            envelope.changes
        );
        pushIfMissing(room.comments, comment);
    }

    /**
     * Applies conversation.comment.updated and attaches the comment to its room.
     *
     * @method handleCommentUpdated
     * @param {Object} envelope Domain-event envelope
     * @returns {void}
     * @public
     */
    handleCommentUpdated(envelope) {
        let comment = peekOrPush(
            this.store,
            'comment',
            envelope.resource.id,
            envelope.changes
        );
        if (!comment) {
            return;
        }
        let room = this.findConversationForEvent(envelope)
            || this.findConversationContaining('comments', comment.id);
        if (!this.isOpenThread(room)) {
            pushIfMissing(room?.comments, comment);
        }
    }

    /**
     * Removes a deleted comment from its conversation room.
     *
     * @method handleCommentDeleted
     * @param {Object} envelope Domain-event envelope
     * @returns {void}
     * @public
     */
    handleCommentDeleted(envelope) {
        let known = this.store.peekRecord('comment', envelope.resource.id);
        this.threadCounts.removeComment(
            envelope.resource.id,
            envelope.changes?.relatedId ?? known?.relatedId,
            envelope.changes?.comment ?? known?.comment
        );
        let room = this.findConversationForEvent(envelope);
        if (this.isOpenThread(room)) {
            return;
        }
        if (room) {
            removeById(room.comments, envelope.resource.id);
        } else {
            this.removeCommentFromConversations(envelope.resource.id);
        }
    }

    /**
     * Appends a newly added vote onto its conversation room.
     *
     * @method handleVoteAdded
     * @param {Object} envelope Domain-event envelope
     * @returns {void}
     * @public
     */
    handleVoteAdded(envelope) {
        let room = this.findConversationForEvent(envelope);
        if (!room) {
            return;
        }
        let vote = peekOrPush(this.store, 'vote', envelope.resource.id, envelope.changes);
        pushIfMissing(room.votes, vote);
    }

    /**
     * Removes a vote from its conversation room.
     *
     * @method handleVoteRemoved
     * @param {Object} envelope Domain-event envelope
     * @returns {void}
     * @public
     */
    handleVoteRemoved(envelope) {
        let room = this.findConversationForEvent(envelope);
        if (room) {
            removeById(room.votes, envelope.resource.id);
            return;
        }
        let containingRoom = this.findConversationContaining('votes', envelope.resource.id);
        removeById(containingRoom?.votes, envelope.resource.id);
    }

    /**
     * Reloads the list when another user creates a conversation; the creating user's own list reloads when the
     * thread is saved.
     *
     * @method handleConversationCreated
     * @param {Object} envelope Domain-event envelope
     * @returns {void}
     * @public
     */
    handleConversationCreated(envelope) {
        if (envelope?.actorId && envelope.actorId === this.currentUser.user?.id) {
            return;
        }
        this.refreshList();
    }

    /**
     * Whether a room is the discussion open on the page, whose comment events the page controller handles.
     * An open vote room stays with this controller: the page controller only listens for discussions.
     *
     * @method isOpenThread
     * @param {Object} room Conversation room
     * @returns {Boolean}
     * @private
     */
    isOpenThread(room) {
        return Boolean(room) && room === this.selectedConversation && room.roomType === 'discussion';
    }

    /**
     * Resolves the conversation room for a comment or vote envelope.
     *
     * @method findConversationForEvent
     * @param {Object} envelope Domain-event envelope
     * @returns {Object|null}
     * @private
     */
    findConversationForEvent(envelope) {
        let conversationId = envelope.changes?.relatedId
            || envelope.changes?.conversationId
            || envelope.meta?.conversationId
            || envelope.meta?.relatedId;
        return this.findConversationById(conversationId);
    }

    /**
     * Finds a loaded room that already contains the given comment or vote.
     *
     * @method findConversationContaining
     * @param {String} collectionName comments or votes
     * @param {String} resourceId Comment or vote id
     * @returns {Object|null}
     * @private
     */
    findConversationContaining(collectionName, resourceId) {
        let rooms = this.selectedConversation
            ? [this.selectedConversation, ...(this.listedConversations || [])]
            : (this.listedConversations || []);
        return rooms.find((room) => room[collectionName]?.find((item) => item.id === resourceId)) || null;
    }

    /**
     * Finds a conversation by id from the selected room or the loaded list.
     *
     * @method findConversationById
     * @param {String} id Conversation room id
     * @returns {Object|null}
     * @private
     */
    findConversationById(id) {
        if (!id) {
            return null;
        }
        if (this.selectedConversation?.id === id) {
            return this.selectedConversation;
        }
        return (this.listedConversations || []).find((conversation) => conversation.id === id) || null;
    }

    /**
     * Removes a comment from the selected room and every loaded room, except the open discussion, whose comments
     * the page controller owns.
     *
     * @method removeCommentFromConversations
     * @param {String} commentId Comment id
     * @returns {void}
     * @private
     */
    removeCommentFromConversations(commentId) {
        let rooms = [this.selectedConversation, ...(this.listedConversations || [])].filter(Boolean);
        rooms.forEach((room) => {
            if (this.isOpenThread(room)) {
                return;
            }
            removeById(room.comments, commentId);
        });
    }

    /**
     * The tracked project, whose id scopes the list request
     *
     * @property trackedProject
     * @type Ember.Service
     * @public
     */
    @service trackedProject;

    /**
     * The saved searches service
     *
     * @property savedSearch
     * @type Ember.Service
     * @public
     */
    @service savedSearch;

    /**
     * The search, page, sort, order and group of the browser, kept in the URL without refreshing the route; a change
     * that alters the list request reloads only the list
     *
     * @property urlState
     * @type UrlState
     * @public
     */
    urlState;

    /**
     * The page of threads the browser lists, with its loading flag, error and retry
     *
     * @property conversationList
     * @type ListLoader
     * @public
     */
    conversationList;

    /**
     * The comment counts and vote tallies of the listed threads
     *
     * @property threadCounts
     * @type ThreadCounts
     * @public
     */
    threadCounts;

    /**
     * The field the threads are sorted by on the server
     *
     * @property sort
     * @type String
     * @public
     */
    @tracked sort = 'Conversationroom.dateModified';

    /**
     * The order of the sort, ASC or DESC
     *
     * @property order
     * @type String
     * @public
     */
    @tracked order = 'DESC';

    /**
     * The grouping of the list: milestone (default), roomType or none
     *
     * @property group
     * @type String
     * @public
     */
    @tracked group = 'milestone';

    /**
     * The id of the saved search the query came from, null for none
     *
     * @property searchId
     * @type String
     * @public
     */
    @tracked searchId = null;

    /**
     * The id of the thread open in the detail column, null for none
     *
     * @property selectedConversationId
     * @type String
     * @public
     */
    @tracked selectedConversationId = null;

    /**
     * The milestone names by milestone id, loaded by the route
     *
     * @property milestones
     * @type Object
     * @public
     */
    @tracked milestones = {};

    /**
     * The ezSearch schema of the threads, loaded by the route
     *
     * @property querySchema
     * @type Object
     * @public
     */
    @tracked querySchema = null;

    /**
     * The saved searches of the user for the threads, loaded by the route; always replaced, never mutated
     *
     * @property savedsearches
     * @type Array
     * @public
     */
    @tracked savedsearches = [];

    /**
     * The record the save search dialog fills in
     *
     * @property newSavedsearch
     * @type Prometheus.Models.Savedsearch
     * @public
     */
    @tracked newSavedsearch = null;

    /**
     * Whether the save search dialog is open
     *
     * @property saveSearchDialog
     * @type Boolean
     * @public
     */
    @tracked saveSearchDialog = false;

    /**
     * The query the save search dialog shows
     *
     * @property saveSearchQuery
     * @type String
     * @public
     */
    @tracked saveSearchQuery = '';

    /**
     * The sort options of the list menu
     *
     * @property sortOptions
     * @type Array
     * @public
     */
    get sortOptions() {
        return buildSortOptions(this.intl);
    }

    /**
     * The group options of the list menu
     *
     * @property groupOptions
     * @type Array
     * @public
     */
    get groupOptions() {
        return buildGroupOptions({ intl: this.intl, milestones: this.milestones });
    }

    /**
     * The order in the lower case the QuickList toolbar uses
     *
     * @property listOrder
     * @type String
     * @public
     */
    get listOrder() {
        return String(this.order).toLowerCase();
    }

    /**
     * The query params the row links carry, so the search, sort and group stay when a thread is opened
     *
     * @property linkQuery
     * @type Object
     * @public
     */
    get linkQuery() {
        return { query: this.query, searchId: this.searchId, page: this.page, sort: this.sort, order: this.order, group: this.group };
    }

    /**
     * The threads of the loaded page in the order QuickList shows them
     *
     * @property listedConversations
     * @type Array
     * @public
     */
    get listedConversations() {
        return arrangeConversations(this.conversationList.items, { group: this.group, milestones: this.milestones });
    }

    /**
     * Whether Gaia linked a next page of the list; the browser never asks for a total
     *
     * @property hasNext
     * @type Boolean
     * @public
     */
    get hasNext() {
        return this.conversationList.hasNext;
    }

    /**
     * Whether the list is loading a page
     *
     * @property isListLoading
     * @type Boolean
     * @public
     */
    get isListLoading() {
        return this.conversationList.isLoading;
    }

    /**
     * The error of the latest list load
     *
     * @property listError
     * @type Object
     * @public
     */
    get listError() {
        return this.conversationList.error;
    }

    /**
     * Whether a search narrows the list
     *
     * @property isSearching
     * @type Boolean
     * @public
     */
    get isSearching() {
        return Boolean(this.query);
    }

    /**
     * The saved searches in the shape EzSearchCompact expects
     *
     * @property ezSavedSearches
     * @type Array
     * @public
     */
    get ezSavedSearches() {
        return this.savedsearches.map(search => ({
            id: search.get('id'),
            name: search.get('name'),
            query: search.get('searchquery')
        }));
    }

    /**
     * Reloads the list when the changed params alter its request; grouping only regroups the loaded page
     *
     * @method paramsChanged
     * @param {Object} values The current params
     * @returns {Promise|void}
     * @private
     */
    paramsChanged(values) {
        let params = this.conversationList.params;
        if (params && JSON.stringify(this.conversationList.buildRequest(values)) === JSON.stringify(this.conversationList.buildRequest(params))) {
            return;
        }
        return this.loadCounts(this.conversationList.run(values));
    }

    /**
     * Loads the comment counts of the listed page once the page itself has loaded; rows render while they load
     *
     * @method loadCounts
     * @param {Promise} pageLoad The load of the list page
     * @returns {Promise}
     * @private
     */
    async loadCounts(pageLoad) {
        let records = await pageLoad;
        if (records) {
            await this.threadCounts.load(this.conversationList.items.map(room => room.id));
        }
    }

    /**
     * The comment count and vote tallies of a listed thread, null while they load
     *
     * @method countsFor
     * @param {String} roomId
     * @returns {Object|null}
     * @public
     */
    countsFor(roomId) {
        return this.threadCounts.countsFor(roomId);
    }

    /**
     * Shows the first page the route loaded; a page that failed to load is loaded again here, so the list shows its
     * error and retry
     *
     * @method showFirstPage
     * @param {Object} values The params the page was loaded for
     * @param {Object} firstPage `{ records }` or `{ error }`
     * @returns {Promise|void}
     * @public
     */
    showFirstPage(values, firstPage) {
        if (firstPage?.error) {
            return this.loadCounts(this.conversationList.run(values));
        }
        this.conversationList.seed(firstPage?.records, values);
        return this.loadCounts(Promise.resolve(firstPage?.records));
    }

    /**
     * Loads the current page of the list again; the retry of the list error and the reload after a change
     *
     * @method refreshList
     * @returns {Promise}
     * @public
     */
    @action
    refreshList() {
        return this.loadCounts(this.conversationList.retry());
    }

    /**
     * Reloads the list after a thread was created here and opens it
     *
     * @method afterConversationCreated
     * @param {Prometheus.Models.Conversationroom} conversation
     * @returns {void}
     * @public
     */
    afterConversationCreated(conversation) {
        this.refreshList();
        this.router.transitionTo('app.project.conversation.page', conversation.id);
    }

    /**
     * Sorts the list by a field; a date starts with the newest first, a subject from A to Z
     *
     * @method sortList
     * @param {String} key The sort field
     * @param {String} order asc or desc as the toolbar sends it
     * @returns {void}
     * @public
     */
    @action
    sortList(key, order) {
        let isDate = key !== 'Conversationroom.subject';
        let next = key === this.sort ? order : isDate ? 'desc' : 'asc';
        this.urlState.set({ sort: key, order: next.toUpperCase() });
    }

    /**
     * Groups the list; it only regroups the loaded page, so the page stays
     *
     * @method groupList
     * @param {String} key none, milestone or roomType
     * @returns {void}
     * @public
     */
    @action
    groupList(key) {
        this.urlState.set({ group: key, page: this.page });
    }

    /**
     * Opens a page of the list
     *
     * @method changePage
     * @param {Number} page
     * @returns {void}
     * @public
     */
    @action
    changePage(page) {
        this.urlState.set({ page });
    }

    /**
     * Runs a query from ezSearch; only the list reloads for it
     *
     * @method applyQuery
     * @param {String} query The Gaia query, empty for none
     * @public
     */
    @action
    applyQuery(query) {
        this.urlState.set({ query: query || '' });
    }

    /**
     * Clears the search, the action of the empty state
     *
     * @method clearListSearch
     * @public
     */
    @action
    clearListSearch() {
        this.searchId = null;
        this.urlState.set({ query: '' });
    }

    /**
     * Marks a saved search as the active one, or clears the mark; its query arrives through applyQuery
     *
     * @method selectSavedSearch
     * @param {Object|null} search The picked item or null
     * @public
     */
    @action
    selectSavedSearch(search) {
        this.searchId = search ? String(search.id) : null;
    }

    /**
     * Opens the save dialog for the query ezSearch hands over
     *
     * @method showEzSaveSearchDialog
     * @param {String} query
     * @public
     */
    @action
    showEzSaveSearchDialog(query) {
        this.saveSearchQuery = query;
        this.saveSearchDialog = true;
    }

    /**
     * Closes the save dialog
     *
     * @method removeSaveSearchDialog
     * @public
     */
    @action
    removeSaveSearchDialog() {
        this.saveSearchDialog = false;
    }

    /**
     * Saves the query of the dialog as a saved search of the threads of the project
     *
     * @method saveEzSearch
     * @returns {Promise}
     * @public
     */
    @action
    async saveEzSearch() {
        let query = this.saveSearchQuery;
        if (!query) {
            this.removeSaveSearchDialog();
            return;
        }
        try {
            let data = await this.savedSearch.create(this.newSavedsearch, {
                relatedTo: 'conversationroom',
                query,
                projectId: this.trackedProject.getProjectId()
            });
            if (this.isDestroying || this.isDestroyed) {
                return;
            }
            this.savedsearches = [...this.savedsearches, data];
            this.newSavedsearch = this.store.createRecord('savedsearch');
            new Messenger().post({
                message: this.intl.t('views.app.conversation.browser.savedSearchAdded', { name: data.get('name'), htmlSafe: true }),
                type: 'success',
                showCloseButton: true
            });
        } catch (error) {
            this.errorManager.handleError(error, { moduleName: 'savedsearch' });
        }
        if (!this.isDestroying && !this.isDestroyed) {
            this.removeSaveSearchDialog();
        }
    }

    /**
     * Replaces the query of a saved search with the one ezSearch hands over
     *
     * @method updateEzSavedSearch
     * @param {Object} search The saved search item
     * @param {String} query
     * @returns {Promise}
     * @public
     */
    @action
    async updateEzSavedSearch(search, query) {
        let record = this.savedsearches.find(item => String(item.get('id')) === String(search.id));
        if (!record) {
            return;
        }
        try {
            await this.savedSearch.update(record, query);
            if (!this.isDestroying && !this.isDestroyed) {
                this.savedsearches = [...this.savedsearches];
            }
        } catch (error) {
            record.rollbackAttributes();
            this.errorManager.handleError(error, { moduleName: 'savedsearch' });
        }
    }

    /**
     * Puts the browser back to its defaults and drops the listed page, when the threads are left or the project
     * switches, so the next visit starts clean
     *
     * @method resetBrowser
     * @returns {void}
     * @public
     */
    resetBrowser() {
        UrlState.resetController(this);
        this.conversationList.reset();
        this.searchId = null;
        this.selectedConversation = null;
        this.selectedConversationId = null;
        this.unregisterHermesIntents();
    }
}
