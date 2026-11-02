/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import AppRoute from 'prometheus/routes/app';

/**
 * The route to create an agent. It also loads the roles and projects the agent can be given access to.
 *
 * @class AppAgentCreateRoute
 * @namespace Prometheus.Routes
 * @module App.Agent
 * @extends AppRoute
 */
export default class AppAgentCreateRoute extends AppRoute {
    /**
     * Queries the roles and projects for the access box; rejects when either query fails.
     *
     * @method queryOptions
     * @return {Promise<Object>}
     */
    async queryOptions() {
        let [roles, projects] = await Promise.all([
            this.store.query('role', { limit: -1 }),
            this.store.query('project', { limit: -1 })
        ]);
        return {
            roles: roles.toArray().map((role) => ({ label: role.name, value: role.id })),
            projects: projects.toArray().map((project) => ({ label: project.name, value: project.id }))
        };
    }

    /**
     * The roles and projects for the access box, or empty lists when they fail to load.
     *
     * @method loadOptions
     * @return {Promise<Object>}
     */
    async loadOptions() {
        try {
            return await this.queryOptions();
        } catch (error) {
            this.errorManager.handleError(error, { moduleName: 'agent' });
            return { roles: [], projects: [] };
        }
    }

    /**
     * The new agent, with the defaults the edit mockup shows.
     *
     * @method model
     * @return {Prometheus.Models.Agent}
     */
    model() {
        return this.store.createRecord('agent', {
            accountStatus: 'active',
            maxTurns: 80,
            maxRunsPerIssue: 10,
            permissionMode: 'auto',
            modelConfig: { simple: 'sonnet', complex: 'opus', escalation: 'opus' }
        });
    }

    /**
     * @method afterModel
     * @return {Promise}
     */
    async afterModel() {
        this.options = await this.loadOptions();
    }

    /**
     * @method setupController
     * @param {Prometheus.Controllers.App.Agent.Create} controller the controller of this route
     * @param {Prometheus.Models.Agent} model the agent
     */
    setupController(controller, model) {
        controller.set('model', model);
        controller.setupForm(this.options, {});
    }

    /**
     * Drops the unsaved agent when the user leaves.
     *
     * @method resetController
     * @param {Prometheus.Controllers.App.Agent.Create} controller the controller of this route
     */
    resetController(controller) {
        if (controller.model?.isNew) {
            controller.model.unloadRecord();
        }
    }
}
