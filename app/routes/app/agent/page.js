/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import AppRoute from 'prometheus/routes/app';

/**
 * The route of an agent's detail page.
 *
 * @class AppAgentPageRoute
 * @namespace Prometheus.Routes
 * @module App.Agent
 * @extends AppRoute
 */
export default class AppAgentPageRoute extends AppRoute {
    /**
     * Loads the agent with its user and sponsor, then its user's roles, project memberships and identities.
     * These are separate queries because Gaia limits the joined rows of a hasMany, not the parents.
     *
     * @method model
     * @param {Object} params the route params
     * @return {Promise<Object>}
     */
    async model(params) {
        try {
            let agents = await this.store.query('agent', {
                query: `(Agent.id : ${params.agent_id})`,
                rels: 'user,sponsor'
            });
            let agent = agents.objectAt(0);
            let userId = agent.userId;
            let [userroles, memberships, identities] = await Promise.all([
                this.store.query('userrole', { query: `(Userrole.userId : ${userId})`, rels: 'role', limit: -1 }),
                this.store.query('membership', { query: `(Membership.userId : ${userId})`, rels: 'project', limit: -1 }),
                this.store.query('useridentity', { query: `(Useridentity.userId : ${userId})`, limit: -1 })
            ]);

            return { agent, userroles: userroles.toArray(), memberships: memberships.toArray(), identities: identities.toArray() };
        } catch (error) {
            this.errorManager.handleError(error, { moduleName: 'agent' });
        }
    }

    /**
     * @method setupController
     * @param {Prometheus.Controllers.App.Agent.Page} controller the controller of this route
     * @param {Object} model the agent and what belongs to it
     */
    setupController(controller, model) {
        let { agent, userroles, memberships, identities } = model;

        agent.user?.identities?.pushObjects(identities);
        controller.set('model', agent);
        controller.set('userroles', userroles);
        controller.set('memberships', memberships);
        controller.set('showWholePrompt', false);
        this.breadcrumb.setTitle(this.routeName, agent.name);
    }
}
