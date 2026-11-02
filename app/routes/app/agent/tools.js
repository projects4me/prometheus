/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import AppRoute from 'prometheus/routes/app';

/**
 * This is the route for the tool catalog: the tool servers, their tools and the grants to agents.
 *
 * @class AppAgentToolsRoute
 * @namespace Prometheus.Routes
 * @module App.Agent
 * @extends AppRoute
 */
export default class AppAgentToolsRoute extends AppRoute {
    /**
     * Loads the whole catalog, it is small and the screen counts tools and grants per server.
     *
     * @method model
     * @return {Promise<Object>}
     */
    async model() {
        try {
            let all = { limit: -1 };
            let [servers, tools, grants, agents] = await Promise.all([
                this.store.query('toolserver', { ...all, sort: 'Toolserver.name', order: 'asc' }),
                this.store.query('tool', { ...all, sort: 'Tool.name', order: 'asc' }),
                this.store.query('agenttool', all),
                this.store.query('agent', { ...all, sort: 'Agent.name', order: 'asc' })
            ]);

            return { servers, tools, grants, agents };
        } catch (error) {
            this.errorManager.handleError(error, { moduleName: 'agent' });
        }
    }

    /**
     * @method setupController
     * @param {Prometheus.Controllers.App.Agent.Tools} controller the controller of this route
     * @param {Object} model the catalog
     */
    setupController(controller, model) {
        controller.load(model);
    }
}
