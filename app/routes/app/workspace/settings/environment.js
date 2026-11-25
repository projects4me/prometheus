/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { service } from '@ember/service';
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
    @service acl;

    /**
     * The number of repositories the table shows
     *
     * @property limit
     * @type Number
     */
    limit = 20;

    /**
     * The number of runtimes the picker lists
     *
     * @property runtimeLimit
     * @type Number
     */
    runtimeLimit = 100;

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
            let runtimes = await this.loadRuntimes();
            return { workspace: parent.workspace, repositories: repositories.slice(), projectNames, runtimes };
        } catch (error) {
            this.errorManager.handleLoadError(error, { moduleName: 'workspace' });
            return { workspace: parent.workspace, repositories: [] };
        }
    }

    /**
     * The service clients of kind runtime the user can pick from, empty when the user cannot read service clients or
     * the list fails (the tab then shows the bound runtime only).
     *
     * @method loadRuntimes
     * @return {Promise<Serviceclient[]>}
     * @private
     */
    async loadRuntimes() {
        if (!this.acl.checkAccess('serviceclient.read')) {
            return [];
        }
        try {
            let runtimes = await this.store.query('serviceclient', {
                query: '((Serviceclient.kind : runtime))',
                sort: 'Serviceclient.name',
                order: 'ASC',
                limit: this.runtimeLimit
            });
            return runtimes.slice();
        } catch (error) {
            this.errorManager.handleLoadError(error, { moduleName: 'serviceclient' });
            return [];
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
        controller.set('runtimes', model.runtimes || []);
        controller.set('selectedRuntimeId', model.workspace?.runtimeId || model.workspace?.belongsTo('runtime').id() || null);
        controller.set('runtimeErrors', []);
    }
}
