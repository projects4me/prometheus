/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { service } from '@ember/service';
import App from 'prometheus/routes/app';
import { objectAt } from 'prometheus/utils/array/object-at';
import { setWorkspaceBreadcrumb } from 'prometheus/utils/workspace/breadcrumb';

/**
 * The read-only workspace Overview route
 *
 * @class Index
 * @namespace Prometheus.Routes
 * @module App.Workspace
 * @extends App
 */
export default class WorkspaceIndexRoute extends App {
    @service trackedProject;

    /**
     * The number of projects on a page of the Projects box
     *
     * @property pageSize
     * @type Number
     */
    pageSize = 10;

    queryParams = {
        page: { refreshModel: true },
        sort: { refreshModel: true },
        order: { refreshModel: true }
    };

    /**
     * Loads the workspace and its projects (the members are paged by the controller). Resolves to `{ notFound: true }` when no workspace has the
     * short code and to `{ failed: true }` when a query fails. Projects cover what the viewer can read.
     *
     * @method model
     * @param {Object} params the query params, `page` is the page of the Projects box
     * @return {Object}
     * @protected
     */
    async model(params) {
        let shortCode = this.paramsFor('app.workspace').shortcode;
        let workspace;
        let projects;
        let repositoryNames = {};
        let hasNextProjects = false;
        try {
            let workspaces = await this.store.query('workspace', {
                query: `((Workspace.shortCode : ${shortCode}))`,
                rels: 'createdBy,runtime',
                limit: 1
            });
            workspace = objectAt(workspaces, 0);
            if (!workspace) {
                return { notFound: true };
            }

            projects = await this.store.query('project', {
                query: `((Project.workspaceId : ${workspace.id}))`,
                rels: 'manager',
                sort: params?.sort || 'Project.name',
                order: params?.order || 'asc',
                page: Math.max(1, Number(params?.page) || 1),
                limit: this.pageSize
            });
            hasNextProjects = Boolean(projects.meta?.links?.next);
            repositoryNames = await this.loadRepositoryNames(projects);
        } catch (error) {
            this.errorManager.handleLoadError(error, { moduleName: 'workspace' });
            return { failed: true };
        }

        setWorkspaceBreadcrumb(this.breadcrumb, this.trackedProject, workspace);
        return { workspace, projects: projects.slice(), repositoryNames, hasNextProjects };
    }

    /**
     * Loads the repositories of the shown projects with one query and maps each project id to the name of its
     * first repository. A project without a repository of its own has no entry.
     *
     * @method loadRepositoryNames
     * @param {Project[]} projects the projects of the shown page
     * @return {Object} the repository name by project id
     * @protected
     */
    async loadRepositoryNames(projects) {
        let names = {};
        let ids = projects.map((project) => project.id);
        if (ids.length === 0) {
            return names;
        }
        let repositories = await this.store.query('repository', {
            query: `((Repository.projectId CONTAINS ${ids.join(',')}))`,
            sort: 'Repository.name',
            order: 'asc',
            limit: 100
        });
        repositories.forEach((repository) => {
            if (!(repository.projectId in names)) {
                names[repository.projectId] = repository.name;
            }
        });
        return names;
    }

    /**
     * Hands the loaded model to the controller, the base route's setupController doesn't.
     *
     * @method setupController
     * @param {Prometheus.Controllers.App} controller
     * @param {Object} model
     * @protected
     */
    setupController(controller, model) {
        super.setupController(controller, model);
        controller.set('model', model);
        if (model.workspace) {
            controller.loadMembers(0);
            controller.resetActivities();
            controller.loadMilestones(0);
        }
    }
}
