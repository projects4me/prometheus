/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import App from "prometheus/routes/app";
import { inject } from '@ember/service';
import DateUtils from 'prometheus/utils/date';

/**
 * This is the route to load the conversations for a project
 *
 * @class Conversation
 * @namespace Prometheus.Routes
 * @module App.Project
 * @extends AppRoute
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default App.extend({

    /**
     * The requested module
     *
     * @property module
     * @type String
     * @for Conversation
     * @private
     */
    module: 'conversationroom',

    /**
     * The data for the current route
     *
     * @property data
     * @type Object
     * @for Conversation
     * @private
     */
    data: null,

    /**
     * The selected items in the list view
     *
     * @property selectedCount
     * @type Integer
     * @for Conversation
     * @private
     */
    selectedCount: 0,

    /**
     * The trackedProject service provides id of the selected project.
     *
     * @property trackedProject
     * @type Ember.Service
     * @for Conversation
     * @private
     */
    trackedProject: inject(),

    /**
     * The current date and time in 'YYYY-MM-DD HH:mm:ss.0' format.
     *
     * @property now
     * @type string
     * @for Conversation
     * @private
     */
    now : DateUtils.getNow(),

    queryParams: {
        query: {
            refreshModel: true
        }
    },
    /**
     * The model hook for this route. This is used load the conversations that we have in the system.
     * 
     * @method model
     * @returns {Promise}
     */
    async model(params) {
        Logger.debug('AppProjectConversationRoute::model');
        let _self = this;
        this.now = DateUtils.getNow();
        let projectId = this.trackedProject.getProjectId();
        let conversations = [];
        if(params.query || params.range) {
            conversations = await this.fetchFilteredConversations(projectId, params);
        } else {
            conversations = await this.fetchAllConversations(projectId);
        }

        let selectedConversation = null;
        if(params.c_id) {
            selectedConversation = await this.store.query('conversationroom', {
                query: `((Conversationroom.id : ${params.c_id}) AND (Conversationroom.projectId : ${projectId}))`,
                rels: 'votes,comments,issue',
                limit: -1
            }).catch((error) => {
                _self.errorManager.handleError(error, {
                    moduleName: 'conversationroom'
                })
            });
        }        
        return {
            "conversations": conversations,
            "selectedConversation": selectedConversation
        };
    },

    /**
     * Loads conversations onto the controller and registers Hermes intents
     * for this project's live conversation events.
     *
     * @method setupController
     * @param {Prometheus.Controller.Conversation} controller the controller object for this route
     * @param {Prometheus.Models.Conversation} model
     * @private
     */
    setupController: function (controller, model) {
        Logger.debug('AppProjectConversationRoute::setupController');

        controller.set('conversations', model.conversations.toArray());
        controller.set('selectedConversation', model.selectedConversation?.objectAt(0));
        let newConversation = this.store.createRecord('conversationroom', {
            projectShortcode: this.trackedProject.shortCode
        });
        controller.set('newConversation', newConversation);

        // Set the data in the controller so that any data bound in the view can get re-rendered
        controller.set('module', this.module);
        controller.set('projectId', this.trackedProject.getProjectId());
        controller.set('projectShortcode', this.trackedProject.shortCode);
        controller.setHasMoreFlag();
        controller.set('now', this.now);
        controller.restoreStateFromQueryParams?.();
        controller.registerHermesIntents(this.trackedProject.getProjectId());
    },
    /**
     * This function is used to fetch all conversations for the project.
     * 
     * @method fetchAllConversations
     * @param {string} projectId - The id of the project
     * @returns {Promise<Array>} Returns an array of conversations
     */
    fetchAllConversations: async function(projectId) {
        let _conversationOptions = {
            order: "DESC",
            sort: "Conversationroom.dateModified",
            rels: 'votes,issue',
            query: `(Conversationroom.projectId : ${projectId}) AND (Conversationroom.dateModified <: ${this.now})`,
            limit: 10,
            page: 1
        }
        let controller = this.controllerFor('app.project.conversation');
        controller.set('now', this.now);
        return await controller.fetchAllConversations(_conversationOptions);
    },
    /**
     * This function is used to fetch filtered conversations for the project.
     * 
     * @method fetchFilteredConversations
     * @param {string} projectId - The id of the project
     * @param {Object} params - The parameters for the query
     * @returns {Promise<Array>} Returns an array of conversations
     */
    fetchFilteredConversations: async function(projectId, params) {
        let query = params.query;
        let _conversationOptions = {
            order: "DESC",
            sort: "Conversationroom.dateModified",
            rels: 'votes,issue',
            query: `(Conversationroom.projectId : ${projectId}) AND (Conversationroom.dateModified <: ${this.now})`,
            limit: 10,
            page: 1
        };
        if (query) {
            _conversationOptions.query += ` AND ${query}`;
        }
        let controller = this.controllerFor('app.project.conversation');
        controller.set('now', this.now);
        return await controller.fetchFilteredConversations(_conversationOptions);
    },
    /**
     * On exit, dispose Hermes intents and clear the selected conversation.
     *
     * @method resetController
     * @param {Prometheus.Controller.Conversation} controller The controller object for this route
     * @param {boolean} isExiting Whether the route is exiting
     * @private
     */
    resetController: function (controller, isExiting) {
        if (isExiting) {
            controller.unregisterHermesIntents();
            controller.selectedConversation = null;
        }
    }
});