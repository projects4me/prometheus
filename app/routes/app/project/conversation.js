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
     * Query params that the conversation route accepts.
     * 
     * @property queryParams
     * @type Object
     * @for Conversation
     * @public
     */
    queryParams: {
        c_id: {
            refreshModel: false
        }
    },

    /**
     * The model hook for this route. This is used load the conversations that we have in the system.
     * 
     * @method model
     * @returns {Promise}
     */
    model() {
        Logger.debug('AppProjectConversationRoute::model');
        let _self = this;
        let params = this.controllerFor('app.project');

        let projectId = this.trackedProject.getProjectId();
        let options = {
            limit: -1,
            page: 0
        };

        if (params.query !== undefined && params.query !== '' && params.query !== null) {
            options.query = params.query;
        }

        let _conversationOptions = {
            rels: "comments",
            order: "DESC",
            sort: "comments.dateModified, Conversationroom.dateModified",
            query: "(Conversationroom.projectId : " + projectId + ")"
        }

        Logger.debug('-AppProjectConversationRoute::model');
        return this.store.query(this.module, _conversationOptions)
            .catch((error) => {
                _self.errorManager.handleError(error, {
                    moduleName: 'conversationroom'
                })
            })
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

        controller.set('model', model.toArray());

        let newConversation = this.store.createRecord('conversationroom', {});
        controller.set('newConversation', newConversation);

        // Set the data in the controller so that any data bound in the view can get re-rendered
        controller.set('module', this.module);
        controller.set('projectId', this.trackedProject.getProjectId());
    },
});