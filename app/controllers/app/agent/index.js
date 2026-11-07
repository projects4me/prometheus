/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { tracked } from '@glimmer/tracking';
import PrometheusListController from 'prometheus/controllers/prometheus/list';

/**
 * The controller of the agents list.
 *
 * @class AppAgentIndexController
 * @namespace Prometheus.Controllers
 * @module App.Agent
 * @extends PrometheusListController
 */
export default class AppAgentIndexController extends PrometheusListController {
    /**
     * The search schema <EzSearch> filters the list with.
     *
     * @property querySchema
     * @type Object
     */
    @tracked querySchema = null;

    /**
     * What differs on this list when saving a search.
     *
     * @method savedSearchContext
     * @return {Object}
     */
    savedSearchContext() {
        return { relatedTo: 'agent', messagePrefix: 'views.app.agent.list.savedsearch' };
    }

    sort = 'Agent.name';
    order = 'asc';

    /**
     * The project memberships of the agents on the page.
     *
     * @property memberships
     * @type Array
     */
    memberships = [];

    /**
     * The project names of an agent, from its user's memberships.
     *
     * @method projectsOf
     * @param {Prometheus.Models.Agent} agent
     * @return {Array}
     */
    projectsOf = (agent) => {
        return (this.memberships || [])
            .filter((membership) => String(membership.userId) === String(agent.userId))
            .map((membership) => membership.project)
            .filter(Boolean);
    };

    /**
     * An agent's status lives on its user: sets the user's account status.
     *
     * @method activationTarget
     * @param {Prometheus.Models.Agent} agent
     * @param {Boolean} active
     * @return {Prometheus.Models.User|null}
     * @protected
     */
    activationTarget(agent, active) {
        let status = active ? 'active' : 'inactive';
        if (!agent.user || agent.user.accountStatus === status) {
            return null;
        }
        agent.user.set('accountStatus', status);
        return agent.user;
    }
}
