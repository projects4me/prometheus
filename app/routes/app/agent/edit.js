/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import AppAgentCreateRoute from 'prometheus/routes/app/agent/create';

/**
 * The route to edit an agent: the create form, filled with the agent and its roles and project memberships.
 *
 * @class AppAgentEditRoute
 * @namespace Prometheus.Routes
 * @module App.Agent
 * @extends AppAgentCreateRoute
 */
export default class AppAgentEditRoute extends AppAgentCreateRoute {
    templateName = 'app/agent/create';

    /**
     * The agent with its user and sponsor, or null when there is no such agent or the query fails (`loadFailed`).
     *
     * @method model
     * @param {Object} params the route params
     * @return {Promise<Prometheus.Models.Agent>}
     */
    async model(params) {
        this.loadFailed = false;
        try {
            let agents = await this.store.query('agent', {
                query: `(Agent.id : ${params.agent_id})`,
                rels: 'user,sponsor'
            });
            return agents.objectAt(0) ?? null;
        } catch (error) {
            this.errorManager.handleLoadError(error, { moduleName: 'agent' });
            this.loadFailed = true;
            return null;
        }
    }

    /**
     * Loads the roles and projects to choose from, and the ones the agent's user already has.
     *
     * @method afterModel
     * @param {Prometheus.Models.Agent} agent the agent
     * @return {Promise}
     */
    async afterModel(agent) {
        this.current = { userroles: [], memberships: [] };
        if (!agent) {
            return;
        }
        this.options = await this.loadOptions();
        try {
            let [userroles, memberships] = await Promise.all([
                this.store.query('userrole', { query: `(Userrole.userId : ${agent.userId})`, limit: -1 }),
                this.store.query('membership', { query: `(Membership.userId : ${agent.userId})`, limit: -1 })
            ]);
            this.current = { userroles: userroles.toArray(), memberships: memberships.toArray() };
        } catch (error) {
            this.errorManager.handleLoadError(error, { moduleName: 'agent' });
            this.loadFailed = true;
        }
    }

    /**
     * @method setupController
     * @param {Prometheus.Controllers.App.Agent.Edit} controller the controller of this route
     * @param {Prometheus.Models.Agent} model the agent
     */
    setupController(controller, model) {
        controller.set('notFound', !model && !this.loadFailed);
        controller.set('loadFailed', this.loadFailed);
        controller.set('model', model);
        if (!model || this.loadFailed) {
            return;
        }
        controller.setupForm(this.options, this.current);
        this.breadcrumb.setTitle('app.agent.page', model.name);
    }

    /**
     * Drops unsaved edits when the user leaves.
     *
     * @method resetController
     * @param {Prometheus.Controllers.App.Agent.Edit} controller the controller of this route
     */
    resetController(controller) {
        controller.model?.rollbackAttributes();
    }
}
