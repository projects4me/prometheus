/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import AppRoute from 'prometheus/routes/app';

/**
 * This is the route for the skills and the agents they are granted to.
 *
 * @class AppAgentSkillsRoute
 * @namespace Prometheus.Routes
 * @module App.Agent
 * @extends AppRoute
 */
export default class AppAgentSkillsRoute extends AppRoute {
    /**
     * @method model
     * @return {Promise<Object>}
     */
    async model() {
        try {
            let all = { limit: -1 };
            let [skills, grants, agents] = await Promise.all([
                this.store.query('skill', { ...all, sort: 'Skill.name', order: 'asc' }),
                this.store.query('agentskill', all),
                this.store.query('agent', { ...all, sort: 'Agent.name', order: 'asc' })
            ]);

            return { skills, grants, agents };
        } catch (error) {
            this.errorManager.handleError(error, { moduleName: 'agent' });
        }
    }

    /**
     * @method setupController
     * @param {Prometheus.Controllers.App.Agent.Skills} controller the controller of this route
     * @param {Object} model the skills, grants and agents
     */
    setupController(controller, model) {
        controller.load(model);
    }
}
