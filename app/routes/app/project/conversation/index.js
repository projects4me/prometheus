/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import App from 'prometheus/routes/app';
import { arrangeConversations } from 'prometheus/utils/conversation/list-options';

/**
 * The route of the threads without a selected thread: it opens the thread of an old `?c_id=` link, else the first
 * thread of the list. Only when nothing matches does it stay, and the outlet says no thread is open.
 *
 * @class Index
 * @namespace Prometheus.Routes
 * @module App.Project.Conversation
 * @extends App
 */
export default class AppProjectConversationIndexRoute extends App {
    /**
     * Replaces this route with the page of the thread named by `c_id`, else of the first listed thread
     *
     * @method redirect
     * @private
     */
    redirect() {
        let layout = this.modelFor('app.project.conversation');
        let cId = this.paramsFor('app.project.conversation').c_id;
        if (cId) {
            return this.router.replaceWith('app.project.conversation.page', cId, { queryParams: { c_id: null } });
        }
        let records = layout?.firstPage?.records?.toArray?.() ?? [];
        let first = arrangeConversations(records, { group: layout?.values?.group, milestones: layout?.milestones ?? {} }).at(0);
        if (first) {
            return this.router.replaceWith('app.project.conversation.page', first.id);
        }
    }

    /**
     * Clears the selection in the thread browser
     *
     * @method setupController
     * @private
     */
    setupController() {
        this.controllerFor('app.project.conversation').selectedConversationId = null;
    }
}
