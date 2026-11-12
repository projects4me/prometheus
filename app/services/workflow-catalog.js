/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/* global Logger */
import Service, { inject as service } from '@ember/service';

/**
 * Loads what the workflow editor's step forms pick from: Gaia's trigger catalog (the payload paths filters and
 * expressions use) and the agents a run agent step can run. The trigger catalog only changes with a Gaia release, so
 * it is loaded once per session; the agents are read again each time an editor opens.
 *
 * @class WorkflowCatalogService
 * @namespace Prometheus.Services
 * @extends Service
 */
export default class WorkflowCatalogService extends Service {
    /**
     * @property store
     * @type Service
     * @private
     */
    @service store;

    /**
     * The pending or settled load of the trigger catalog, shared by every caller
     *
     * @property _events
     * @type Promise
     * @private
     */
    _events = null;

    /**
     * The trigger events and the agents. A list the user may not read loads as empty, so the editor still opens.
     *
     * @method load
     * @return {Promise} resolves to { events, agents }
     * @public
     */
    load() {
        if (!this._events) {
            this._events = this._loadEvents().then((events) => {
                if (!events) {
                    this._events = null;
                }
                return events ?? [];
            });
        }
        return Promise.all([this._events, this._loadAgents()]).then(([events, agents]) => ({ events, agents }));
    }

    /**
     * @method _loadEvents
     * @return {Promise} resolves to the Workflowevent records, or null when they could not be read
     * @private
     */
    async _loadEvents() {
        try {
            let events = await this.store.findAll('workflowevent');
            return events.slice();
        } catch (error) {
            Logger.debug('WorkflowCatalogService: the trigger catalog could not be read', error);
            return null;
        }
    }

    /**
     * @method _loadAgents
     * @return {Promise} resolves to the Agent records
     * @private
     */
    async _loadAgents() {
        try {
            let agents = await this.store.query('agent', {
                sort: 'Agent.name',
                order: 'ASC',
                rels: 'user',
                limit: -1
            });
            return agents.slice();
        } catch (error) {
            Logger.debug('WorkflowCatalogService: the agents could not be read', error);
            return [];
        }
    }
}
