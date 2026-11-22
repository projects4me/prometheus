/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import App from 'prometheus/routes/app';

/**
 * The Agents tab of the workspace Settings: counts of the agents, workflows, tools and skills.
 *
 * @class Agents
 * @namespace Prometheus.Routes.Workspace.Settings
 * @module App.Workspace
 * @extends App
 */
export default class WorkspaceSettingsAgentsRoute extends App {
    /**
     * The number of records the counts look at, a count of this many is shown as "N+"
     *
     * @property countLimit
     * @type Number
     */
    countLimit = 100;

    /**
     * Counts the records of a model, resolves to null when the query fails.
     *
     * @method count
     * @param {String} modelName
     * @return {Promise<Number|null>}
     * @protected
     */
    async count(modelName) {
        try {
            let records = await this.store.query(modelName, { limit: this.countLimit });
            return records.length;
        } catch {
            return null;
        }
    }

    async model() {
        let [agents, workflows, tools, skills] = await Promise.all(
            ['agent', 'workflow', 'tool', 'skill'].map((name) => this.count(name))
        );
        return { agents, workflows, tools, skills };
    }

    setupController(controller, model) {
        controller.set('model', model);
        controller.set('countLimit', this.countLimit);
    }
}
