/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import App from 'prometheus/routes/app';
import { service } from '@ember/service';

import { objectAt } from 'prometheus/utils/array/object-at';
/**
 * The route of one thread: it loads the thread with its author, issue and votes (comments come through their own
 * query in the page controller), marks it as the open one in the browser and opens it in the page controller.
 *
 * @class Page
 * @namespace Prometheus.Routes
 * @module App.Project.Conversation
 * @extends App
 */
export default class AppProjectConversationPageRoute extends App {
    /**
     * The trackedProject service provides id of the selected project.
     *
     * @property trackedProject
     * @type Ember.Service
     * @public
     */
    @service trackedProject;

    /**
     * Loads the thread of the selected project
     *
     * @method model
     * @param {Object} params
     * @returns {Promise<Prometheus.Models.Conversationroom|undefined>}
     */
    async model(params) {
        Logger.debug('AppProjectConversationPageRoute::model');
        let projectId = this.trackedProject.getProjectId();
        try {
            let rooms = await this.store.query('conversationroom', {
                query: `((Conversationroom.id : ${params.conversation_id}) AND (Conversationroom.projectId : ${projectId}))`,
                rels: 'createdBy,issue,votes',
                limit: -1
            });
            return objectAt(rooms, 0);
        } catch (error) {
            this.errorManager.handleError(error, { moduleName: 'conversationroom' });
        }
    }

    /**
     * Opens the thread in the browser and names the breadcrumb after it
     *
     * @method setupController
     * @param {Controller} controller
     * @param {Prometheus.Models.Conversationroom} model
     * @private
     */
    setupController(controller, model) {
        let layout = this.controllerFor('app.project.conversation');
        layout.selectedConversationId = model?.id ?? null;
        layout.selectedConversation = model ?? null;
        this.breadcrumb.setTitle(this.routeName, model?.subject);
        this.breadcrumb.setIcon(this.routeName, 'comments');
        controller.model = model;
        controller.layout = layout;
        controller.openThread(model, this.trackedProject.getProjectId());
    }

    /**
     * Stops the open thread's live comment updates when the thread page is left
     *
     * @method resetController
     * @param {Controller} controller
     * @param {Boolean} isExiting
     * @private
     */
    resetController(controller, isExiting) {
        if (isExiting) {
            controller.closeThread();
        }
    }
}
