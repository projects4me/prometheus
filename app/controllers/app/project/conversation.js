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
import DateUtils from 'prometheus/utils/date';
import { task, timeout } from 'ember-concurrency';
import format from 'prometheus/utils/data/format';

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
    queryParams = ['c_id', 'query', 'filter', 'date', 'q'];

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
     * The query for the filtered conversations
     * @property filterQuery
     * @type {string}
     * @public
     */
    @tracked filterQuery = null;

    /**
     * This is used to identify the module to which filter will be applied.
     * 
     * @property filterRelatedTo
     * @type {string}
     * @public
     */
    @tracked filterRelatedTo = '';

    /**
     * The date range for the filtered conversations
     * @property range
     * @type {string}
     * @public
     */
    @tracked dateRange = null;

    /**
     * Static list of filters for conversations
     * @property conversationFilters
     * @type {Array}
     * @public
     */
    conversationFilters = [
        { name: 'myLikes', label: 'My Likes', 
          query: () => `(votes.createdUser : ${this.currentUser.user.id})`
        },
        { name: 'votes', label: 'Votes',
            query: () => `(Conversationroom.roomType : vote)`,
         },
        { name: 'discussion', label: 'Discussion',
          query: () => `(Conversationroom.roomType : discussion)`,
        },
        { name: 'linkedWithIssues', label: 'Linked With Issues',
          query: () => `(Conversationroom.issueNumber !NULL)`,
        },
        { name: 'unlinked', label: 'Unlinked',
          query: () => `(Conversationroom.issueNumber NULL)`,
        }
    ];

    /**
     * Active filter (single select)
     * @property activeFilter
     * @type {string|null}
     * @public
     */
    @tracked activeFilter = null;

    /**
     * Computed property that returns filters with active state
     * @property filters
     * @type {Array}
     * @public
     */
    get filters() {
        return this.conversationFilters.map((filter) => {
            return {
                label: filter.label,
                value: filter.name,
                query: filter?.query?.() || '',
                isActive: this.activeFilter === filter.name
            };
        });
    }

    /**
     * Static list of date filters for conversations
     * @property conversationDateFilters
     * @type {Array}
     * @public
     */
    conversationDateFilters = [
        { name: 'today', label: 'Today' },
        { name: 'thisWeek', label: 'This Week' },
        { name: 'thisMonth', label: 'This Month' },
        { name: 'lastMonth', label: 'Last Month' },
        { name: 'last3Months', label: 'Last 3 Months' },
        { name: 'thisYear', label: 'This Year' }
    ];

    /**
     * Active date filter (single select)
     * @property activeDateFilter
     * @type {string|null}
     * @public
     */
    @tracked activeDateFilter = null;

    /**
     * Computed property that returns date filters with active state
     * @property dateFilters
     * @type {Array}
     * @public
     */
    get dateFilters() {
        return this.conversationDateFilters.map((filter) => {
            return {
                label: filter.label,
                value: filter.name,
                isActive: this.activeDateFilter === filter.name,
                startDate: DateUtils.getRangeByContext(filter.name).startDate,
                endDate: DateUtils.getRangeByContext(filter.name).endDate
            };
        });
    }

    /**
     * The search query that will be used to filter the conversations
     * @property searchQuery
     * @type {string}
     * @public
     */
    @tracked searchQuery = null;

    /**
     * The current search keywords entered by the user
     * @property searchText
     * @type {string}
     * @public
     */
    @tracked searchText = '';

    /**
     * Current page for link-issue dropdown search results.
     * @property linkedIssuePage
     * @type {number}
     * @public
     */
    @tracked linkedIssuePage = 1;

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
    @(task(function* (query) {
        yield timeout(300);
        let projectId = this.projectId;
        let baseQuery = `(Issue.projectId : ${projectId}) AND (Issue.conversationRoomId NULL)`;
        let searchClause = query && String(query).trim()
            ? ` AND ((Issue.issueNumber CONTAINS ${query}) OR (Issue.subject CONTAINS ${query}) OR (Issue.description CONTAINS ${query}))`
            : '';
        let options = {
            query: baseQuery + searchClause,
            limit: 5,
            page: this.linkedIssuePage
        };
        let data = yield this.store.query('issue', options);
        let map = {
            id: 'id',
            name: 'subject',
            number: 'issueNumber',
            status: 'status',
            project: 'project'
        };
        return (new format(this)).getSelectList(data, map);
    })) linkIssueSearch;

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
            if(_self.selectedConversation?.id === relatedId) {
                _self.selectedConversation.comments.pushObject(comment);
            } else {
                _self.conversations.find((conversation) => conversation.id === relatedId).comments.pushObject(comment);
            }
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
            if(_self.selectedConversation?.id === relatedId) {
                _self.selectedConversation.comments.pushObject(savedComment);
            } else {
                _self.conversations.find((conversation) => conversation.id === relatedId).comments.pushObject(savedComment);
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
                    _self.selectedConversation.votes.addObject(data);
                } else {
                    _self.conversations.find((conversation) => conversation.id === conversationId).votes.addObject(data);
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
                : _self.conversations.find((c) => c.id === conversationId);
            if (conversation && conversation.votes) {
                conversation.votes.removeObject(voteRecord);
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
            : this.conversations.find((c) => c.id === conversationId);
        if (!conversation || !conversation.votes) return;

        let userVote = conversation.votes.find((v) => v.createdUser === this.currentUser.user.id);
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

                        _self.conversations.unshiftObject(conversation);
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
     * Persists the linked issue for a conversation (edit modal). Called from ConversationItem on save.
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

        try {
            this.isLoadingConversations = true;
            let newConversations = [];
            let _conversationOptions = {
                order: "DESC",
                sort: "Conversationroom.dateModified",
                rels: 'votes,issue',
                limit: this.pageSize,
                page: this.page + 1
            }
            if(!this.query) {
                newConversations = await this.fetchAllConversations(_conversationOptions);
            } else {
                _conversationOptions.query = `(Conversationroom.projectId : ${this.projectId}) AND (Conversationroom.dateModified <: ${this.now}) AND (${this.query})`;
                newConversations = await this.fetchFilteredConversations(_conversationOptions);
            }
            // Check if we've reached the end
            if (newConversations.length < this.pageSize) {
                this.hasMoreConversations = false;
            }

            this.page++;
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

    /**
     * Fetches all conversations for the project.
     * 
     * @method fetchAllConversations
     * @param {Object} options - The options for the query
     * @public
     * @async
     * @returns {Promise<Array>} Returns an array of conversations
     */
    async fetchAllConversations(options) {
        let newConversations = await this.store.query('conversationroom', options).catch((error) => {
            this.errorManager.handleError(error, {
                moduleName: 'conversationroom'
            });
        });
        newConversations = await this.fetchAndLinkComments(newConversations);
        return newConversations;
    }

    /**
     * This function is used to fetch the conversations that match the filter criteria.
     * 
     * @method fetchFilteredConversations
     * @param {Object} options - The options for the query
     * @returns {Promise<Array>} Returns an array of conversations
     */
    async fetchFilteredConversations(options) {
        let conversations = await this.store.query('conversationroom', options)
            .catch((error) => {
                this.errorManager.handleError(error, {
                    moduleName: 'conversationroom'
                })
            });
        conversations = await this.fetchAndLinkComments(conversations).catch((error) => {
            this.errorManager.handleError(error, {
                moduleName: 'conversationroom'
            });
        });
        return conversations;
    }

    /**
     * This function is used to fetch the comments for the conversations and link them to the conversations.
     * 
     * @method fetchAndLinkComments
     * @param {Array} conversations - Array of conversations
     * @public
     * @async
     * @returns {Promise<Array>} Returns an array of conversations with comments linked
     */
    async fetchAndLinkComments(conversations) {
        for(let conversation of conversations.toArray()) {
            let comments = await this.store.query('comment', {
                query: `(Comment.relatedId : ${conversation.id}) AND (Comment.dateCreated <: ${this.now})`,
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
        return conversations;
    }

    /**
     * Refreshes the conversation
     * @method refreshConversation
     * @public
     * @async
     */
    @action 
    async refreshConversation() {
        Logger.debug('AppProjectConversationController:refreshConversation');
        let messenger = new Messenger().post({
            message: this.intl.t("views.app.conversation.refreshing"),
            type: 'info',
            showCloseButton: true,
            hideAfter: false
        });
        document.querySelector('.conversation-grid').classList.add('filter-blur');
        await this.router.refresh().catch((error) => {
            this.errorManager.handleError(error, {
                moduleName: 'conversationroom'
            });
            messenger.update({
                message: this.intl.t("views.app.conversation.refreshError"),
                type: 'error',
                showCloseButton: true,
                hideAfter: 3
            });
            document.querySelector('.conversation-grid').classList.remove('filter-blur');
        });
        this.page = 1;
        this.hasMoreConversations = true;
        this.scrollToTop();
        document.querySelector('.conversation-grid').classList.remove('filter-blur');
        messenger.update({
            message: this.intl.t("views.app.conversation.refreshed"),
            type: 'success',
            showCloseButton: true,
            hideAfter: 3
        });
    }

    /**
     * Scrolls to the top of the conversation grid.
     * 
     * @method scrollToTop
     * @public
     */
    @action scrollToTop() {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    /**
     * Handles the filter toggle functionality for conversations
     * Toggles the filter on/off
     *
     * @method handleFilterToggle
     * @param {string} filterName - The name of the filter to toggle
     * @public
     * @action
     */
    @action
    handleFilterToggle(filterName) {
        if (this.activeFilter === filterName) {
            this.activeFilter = null;
            this.filterQuery = null;
        } else {
            this.activeFilter = filterName;
            const match = this.filters.find((f) => f.value === filterName);
            this.filterQuery = match ? match.query : null;
        }
        this.handleSearch();
    }

    /**
     * Handles the date filter toggle functionality for conversations
     * Single select: one date filter at a time
     *
     * @method handleDateToggle
     * @param {string} dateFilterName - The name of the date filter to toggle
     * @public
     * @action
     */
    @action
    handleDateToggle(dateFilterName) {
        if (this.activeDateFilter === dateFilterName) {
            this.activeDateFilter = null;
            this.dateRange = null;
        } else {
            this.activeDateFilter = dateFilterName;
            const dateFilter = this.dateFilters.find((f) => f.value === dateFilterName);
            this.dateRange = dateFilter
                ? `((Conversationroom.dateModified >: ${dateFilter.startDate}) AND (Conversationroom.dateModified <: ${dateFilter.endDate}))`
                : null;
        }
        this.handleSearch();
    }

    /**
     * Handles the search functionality for conversations
     * Search functionality will be implemented in next iteration
     *
     * @method handleSearch
     * @public
     * @action
     */
    @action
    handleSearch() {
        let query = this.filterQuery ? String(this.filterQuery) : null;

        if (this.dateRange) {
            query = query ? query + ' AND ' + this.dateRange : this.dateRange;
        }
        if (this.searchQuery) {
            query = query ? query + ' AND ' + this.searchQuery : this.searchQuery;
        }

        (this.query !== query) && this.set('query', query);
        this.set('filter', this.activeFilter);
        this.set('date', this.activeDateFilter);
        this.set('q', this.searchText || null);
        this.setHasMoreFlag();
    }

    /**
     * Handles Enter key press in the search input field
     * Triggers the search action when Enter is pressed
     *
     * @method handleEnterKey
     * @param {Event} event - The keyboard event
     * @public
     * @action
     */
    @action
    handleEnterKey(event) {
        if (event.key === 'Enter' || event.keyCode === 13) {
            event.preventDefault();
            this.handleSearch();
        }
    }

    /**
     * Updates the search query in the search input field
     * @method updateSearchQuery
     * @param {Event} event - The keyboard event
     * @public
     * @action
     */
    @action
    updateSearchQuery(event) {
        let query = event.target.value;
        if(!_.isEmpty(query)) {
            this.searchText = query;
            this.searchQuery = `((Conversationroom.subject CONTAINS ${query}) OR (Conversationroom.description CONTAINS ${query}))`;
        } else {
            this.searchText = '';
            this.searchQuery = null;
        }
    }

    /**
     * Restores dropdown and search state from URL query params (filter, date, q).
     * Called when the route loads so dropdowns reflect applied filters on reload.
     *
     * @method restoreStateFromQueryParams
     * @public
     */
    restoreStateFromQueryParams() {
        const filterParam = this.filter;
        const dateParam = this.date;
        const qParam = this.q;
        this.page = 1;

        if (filterParam && this.conversationFilters.some((f) => f.name === filterParam)) {
            this.activeFilter = filterParam;
            const match = this.conversationFilters.find((f) => f.name === filterParam);
            this.filterQuery = match?.query?.() ?? null;
        } else {
            this.activeFilter = null;
            this.filterQuery = null;
        }

        if (dateParam && this.conversationDateFilters.some((f) => f.name === dateParam)) {
            this.activeDateFilter = dateParam;
            const range = DateUtils.getRangeByContext(dateParam);
            this.dateRange = `(Conversationroom.dateModified >: ${range.startDate}) AND (Conversationroom.dateModified <: ${range.endDate})`;
        } else {
            this.activeDateFilter = null;
            this.dateRange = null;
        }

        if (qParam && String(qParam).trim()) {
            this.searchText = String(qParam).trim();
            const q = this.searchText;
            this.searchQuery = `((Conversationroom.subject CONTAINS ${q}) OR (Conversationroom.description CONTAINS ${q}))`;
        } else {
            this.searchText = '';
            this.searchQuery = null;
        }
    }    

    /**
     * Sets the has more flag for the conversations
     * @method setHasMoreFlag
     * @public
     */
    @action
    setHasMoreFlag() {
        let hasMore = (this.conversations.length >= this.pageSize) || this.activeFilter || this.activeDateFilter || this.searchQuery;
        this.hasMoreConversations = hasMore;
    }

    /**
     * Clears the search query in the search input field
     * @method clearSearch
     * @public
     * @action
     */
    @action
    clearSearch() {
        this.set('query', null);
        this.set('filter', null);
        this.set('date', null);
        this.set('q', null);
        this.dateRange = null;
        this.searchText = '';
        this.filterQuery = null;
        this.searchQuery = null;
        this.hasMoreConversations = true;
        this.page = 1;
        this.activeFilter = null;
        this.activeDateFilter = null;
    }
}