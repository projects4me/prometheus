/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import App from 'prometheus/routes/app';

/**
 * The Projects tab of the workspace Settings, it edits the workspace the Settings page loaded and lists its projects.
 *
 * @class Projects
 * @namespace Prometheus.Routes.Workspace.Settings
 * @module App.Workspace
 * @extends App
 */
export default class WorkspaceSettingsProjectsRoute extends App {
    /**
     * The number of projects on a page of the Member Projects box
     *
     * @property pageSize
     * @type Number
     */
    pageSize = 10;

    /**
     * The number of members on a page of the Members box
     *
     * @property memberPageSize
     * @type Number
     */
    memberPageSize = 20;

    queryParams = {
        memberPage: { refreshModel: true },
        memberOrder: { refreshModel: true },
        page: { refreshModel: true },
        sort: { refreshModel: true },
        order: { refreshModel: true }
    };

    /**
     * Returns the workspace of the Settings page with one page of its projects.
     *
     * @method model
     * @param {Object} params the query params
     * @return {Object}
     * @protected
     */
    async model(params) {
        let parent = this.modelFor('app.workspace.settings');
        if (!parent.workspace) {
            return parent;
        }
        try {
            let projects = await this.store.query('project', {
                query: `((Project.workspaceId : ${parent.workspace.id}))`,
                sort: params?.sort || 'Project.name',
                order: params?.order || 'asc',
                page: Math.max(1, Number(params?.page) || 1),
                limit: this.pageSize
            });
            let members = await this.loadMembers(parent.workspace, params);
            return { workspace: parent.workspace, projects: projects.slice(), hasNextProjects: Boolean(projects.meta?.links?.next), ...members };
        } catch (error) {
            this.errorManager.handleLoadError(error, { moduleName: 'workspace' });
            return { workspace: parent.workspace, projects: [], hasNextProjects: false, members: [], hasNextMembers: false };
        }
    }

    /**
     * Loads one page of the workspace's members, one row per person, sorted by name.
     *
     * @method loadMembers
     * @param {Workspace} workspace
     * @param {Object} params the query params
     * @return {Object}
     * @protected
     */
    async loadMembers(workspace, params) {
        let rows = await this.store.query('workspacemember', {
            query: `((Workspacemember.workspaceId : ${workspace.id}))`,
            rels: 'user',
            sort: 'User.name',
            order: params?.memberOrder === 'desc' ? 'desc' : 'asc',
            page: Math.max(1, Number(params?.memberPage) || 1),
            limit: this.memberPageSize
        });
        return { members: rows.slice(), hasNextMembers: Boolean(rows.meta?.links?.next) };
    }

    setupController(controller, model) {
        controller.set('model', model.workspace);
        controller.set('projects', model.projects || []);
        controller.set('hasNextProjects', Boolean(model.hasNextProjects));
        controller.set('members', model.members || []);
        controller.set('hasNextMembers', Boolean(model.hasNextMembers));
        controller.set('message', {});
    }
}
