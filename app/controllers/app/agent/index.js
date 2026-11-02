/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

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
     * The fields the query builder can filter the list by.
     *
     * @property metadata
     * @type Object
     */
    metadata = {
        filters: [
            {
                id: 'Agent.name',
                label: this.intl.t('views.app.agent.list.name'),
                type: 'string'
            },
            {
                id: 'Agent.purpose',
                label: this.intl.t('views.app.agent.list.purpose'),
                type: 'string',
                operators: ['equal', 'not_equal', 'contains', 'is_null', 'is_not_null']
            },
            {
                id: 'sponsor.name',
                label: this.intl.t('views.app.agent.list.sponsor'),
                type: 'string'
            }
        ]
    };

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
