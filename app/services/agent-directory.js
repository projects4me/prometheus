/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Service, { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

/**
 * Tells which users are agents and who each agent runs for. Records that only carry a user id (comments,
 * time logs, activity) use it, because Gaia gives them no user type.
 *
 * @class AgentDirectoryService
 * @namespace Prometheus.Services
 * @extends Ember.Service
 */
export default class AgentDirectoryService extends Service {
    @service store;

    /**
     * The agents, once loaded.
     *
     * @property agents
     * @type {Array}
     * @public
     */
    @tracked agents = [];

    /**
     * The pending or finished load, so that the agents are fetched once.
     *
     * @property loading
     * @type {Promise}
     * @private
     */
    loading = null;

    /**
     * Loads the agents once. A failure (e.g. no read permission) leaves the directory empty.
     *
     * @method load
     * @return {Promise}
     * @public
     */
    load() {
        if (!this.loading) {
            this.loading = this.store.query('agent', { rels: 'sponsor', page: 1, limit: 200 })
                .then((agents) => {
                    this.agents = agents.toArray();
                })
                .catch(() => {
                    this.agents = [];
                });
        }

        return this.loading;
    }

    /**
     * Finds the agent behind a user.
     *
     * @method find
     * @param {String} userId the id of the user
     * @return {Prometheus.Models.Agent|undefined}
     * @public
     */
    find(userId) {
        return userId ? this.agents.find((agent) => agent.userId === String(userId)) : undefined;
    }

    /**
     * Tells whether a user is an agent: its type says so, or the directory knows it.
     *
     * @method isAgent
     * @param {String} userId the id of the user
     * @param {String} [type] the user type, when the record carries one
     * @return {Boolean}
     * @public
     */
    isAgent(userId, type) {
        return type === 'agent' || Boolean(this.find(userId));
    }
}
