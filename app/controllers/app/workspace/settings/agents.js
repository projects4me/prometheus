/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import AppController from 'prometheus/controllers/app';

/**
 * The controller of the Agents tab of the workspace Settings: lists the views it links to with their counts.
 *
 * @class WorkspaceSettingsAgentsController
 * @namespace Prometheus.Controllers
 * @module App.Workspace
 * @extends AppController
 */
export default class WorkspaceSettingsAgentsController extends AppController {
    /**
     * The links of the tab: the view's route, label key and count
     *
     * @property links
     * @type Array
     */
    get links() {
        return [
            { name: 'agents', route: 'app.agent.index', label: 'global.module.plural.agent', count: this.model.agents },
            { name: 'workflows', route: 'app.workflow.index', label: 'views.nav.menu.workflow.label', count: this.model.workflows },
            { name: 'tools', route: 'app.agent.tools', label: 'views.app.workspace.settings.agents.tools', count: this.model.tools },
            { name: 'skills', route: 'app.agent.skills', label: 'views.app.workspace.settings.agents.skills', count: this.model.skills }
        ].map((link) => ({
            ...link,
            display: link.count === null ? '-' : (link.count >= this.countLimit ? `${link.count}+` : link.count)
        }));
    }
}
