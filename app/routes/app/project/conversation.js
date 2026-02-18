/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import App from "prometheus/routes/app";
import { inject } from '@ember/service';

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
     * The model hook for this route. This is used load the conversations that we have in the system.
     * 
     * @method model
     * @returns {Promise}
     */
    async model(params) {
        Logger.debug('AppProjectConversationRoute::model');
        let _self = this;
        let projectId = this.trackedProject.getProjectId();

        // Initial load with pagination - load first 15 conversations
        let _conversationOptions = {
            order: "DESC",
            sort: "Conversationroom.dateModified",
            rels: 'votes',
            query: "(Conversationroom.projectId : " + projectId + ")",
            limit: 10,
            page: 1
        }

        Logger.debug('-AppProjectConversationRoute::model');
        let conversations = await this.store.query(this.module, _conversationOptions)
            .catch((error) => {
                _self.errorManager.handleError(error, {
                    moduleName: 'conversationroom'
                })
            });

        for(let conversation of conversations.toArray()) {
            let comments = await this.store.query('comment', {
                query: `(Comment.relatedId : ${conversation.id})`,
                sort: 'Comment.dateCreated',
                order: 'ASC',
                limit: -1
            }).catch((error) => {
                _self.errorManager.handleError(error, {
                    moduleName: 'conversationroom'
                })
            });
            conversation.comments = comments;
        }

        let selectedConversation = null;
        if(params.c_id) {
            selectedConversation = await this.store.query('conversationroom', {
                query: `((Conversationroom.id : ${params.c_id}) AND (Conversationroom.projectId : ${projectId}))`,
                rels: 'votes,comments',
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
     * This controller is used to load the conversations that we have in the system
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
        controller.set('hasMoreConversations', model.conversations.length >= controller.pageSize);
    },
    /**
     * This function is called when the route is exited.
     *
     * @method resetController
     * @param {Prometheus.Controller.Conversation} controller The controller object for this route
     * @param {boolean} isExiting Whether the route is exiting
     * @private
     */
    resetController: function (controller, isExiting) {
        if (isExiting) {
            controller.selectedConversation = null;
        }
    }
});