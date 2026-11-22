/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import App from 'prometheus/routes/app';

/**
 * The Environment tab of the workspace Settings: the bound runtime and the repositories agents work on, read only.
 *
 * @class Environment
 * @namespace Prometheus.Routes.Workspace.Settings
 * @module App.Workspace
 * @extends App
 */
export default class WorkspaceSettingsEnvironmentRoute extends App {
    /**
     * The number of repositories the table shows
     *
     * @property limit
     * @type Number
     */
    limit = 20;

    /**
     * Returns the workspace of the Settings page with its repositories.
     *
     * @method model
     * @return {Object}
     * @protected
     */
    async model() {
        let parent = this.modelFor('app.workspace.settings');
        if (!parent.workspace) {
            return parent;
        }
        try {
            let repositories = await this.store.query('repository', {
                query: `((Repository.workspaceId : ${parent.workspace.id}))`,
                limit: this.limit
            });
            let projects = await this.store.query('project', {
                query: `((Project.workspaceId : ${parent.workspace.id}))`,
                limit: 100
            });
            let projectNames = {};
            projects.forEach((project) => {
                projectNames[project.id] = project.name;
            });
            return { workspace: parent.workspace, repositories: repositories.slice(), projectNames };
        } catch (error) {
            this.errorManager.handleLoadError(error, { moduleName: 'workspace' });
            return { workspace: parent.workspace, repositories: [] };
        }
    }

    /**
     * Hands the workspace, its repositories and the project names to the controller.
     *
     * @method setupController
     * @param {Controller} controller
     * @param {Object} model
     * @protected
     */
    setupController(controller, model) {
        controller.set('model', model.workspace);
        controller.set('repositories', model.repositories || []);
        controller.set('projectNames', model.projectNames || {});
    }
}
