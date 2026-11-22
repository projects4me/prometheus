/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Service, { service } from '@ember/service';

/**
 * Loads and changes what the Add project dialog of a workspace needs: the projects that can join, who is shared
 * when one joins and the PATCH of `workspaceId`. Gaia owns the rules (permission, work in progress, member sync).
 *
 * @class WorkspaceProjectsService
 * @namespace Prometheus.Services
 * @extends Service
 */
export default class WorkspaceProjectsService extends Service {
    @service store;
    @service intl;

    /**
     * The projects the user can see that are not in the workspace, by name. Gaia refuses a project the user can't
     * update when it is chosen.
     *
     * @method candidates
     * @param {Workspace} workspace
     * @return {Promise<Project[]>}
     */
    async candidates(workspace) {
        let projects = await this.store.query('project', { sort: 'Project.name', order: 'asc', limit: 100 });
        return projects.slice().filter((project) => String(this.workspaceIdOf(project)) !== String(workspace.id));
    }

    /**
     * The id of the workspace the project is in, from its attribute or its relationship.
     *
     * @method workspaceIdOf
     * @param {Project} project
     * @return {String|null}
     */
    workspaceIdOf(project) {
        return project.workspaceId || project.belongsTo('workspace').id() || null;
    }

    /**
     * How many projects share the workspace of the project, to tell when leaving it empties it.
     *
     * @method isAloneInWorkspace
     * @param {Project} project
     * @return {Promise<Boolean>}
     */
    async isAloneInWorkspace(project) {
        let workspaceId = this.workspaceIdOf(project);
        if (!workspaceId) {
            return false;
        }
        let siblings = await this.store.query('project', { query: `((Project.workspaceId : ${workspaceId}))`, limit: 2 });
        return siblings.length <= 1;
    }

    /**
     * The members shared both ways when the project joins: the workspace members the project gets, and the project
     * members the workspace's projects get.
     *
     * @method sharing
     * @param {Workspace} workspace
     * @param {Project} project
     * @return {Promise<Object>} `{ toProject, toOthers }`, lists of users
     */
    async sharing(workspace, project) {
        let [workspaceMembers, projectMembers] = await Promise.all([
            this.store.query('workspacemember', { query: `((Workspacemember.workspaceId : ${workspace.id}))`, rels: 'user', sort: 'User.name', order: 'asc', limit: 50 }),
            this.store.query('membership', { query: `((Membership.projectId : ${project.id}))`, rels: 'user', limit: 50 })
        ]);
        let inWorkspace = workspaceMembers.slice().map((row) => row.user);
        let inProject = projectMembers.slice().map((row) => row.user);
        let ids = (users) => users.map((user) => String(user.get('id')));
        let toProject = inWorkspace.filter((user) => !ids(inProject).includes(String(user.get('id'))));
        let toOthers = inProject.filter((user) => !ids(inWorkspace).includes(String(user.get('id'))));
        return { toProject, toOthers };
    }

    /**
     * The name of the first repository of the project, empty when it has none.
     *
     * @method repositoryName
     * @param {Project} project
     * @return {Promise<String>}
     */
    async repositoryName(project) {
        let repositories = await this.store.query('repository', { query: `((Repository.projectId CONTAINS ${project.id}))`, sort: 'Repository.name', order: 'asc', limit: 1 });
        return repositories.slice()[0]?.name || '';
    }

    /**
     * Moves the project into the workspace.
     *
     * @method join
     * @param {Workspace} workspace
     * @param {Project} project
     * @return {Promise<String[]>} Gaia's refusal messages, empty when the project joined
     */
    async join(workspace, project) {
        return this.patchWorkspace(project, workspace.id, 'views.app.workspace.addProject.failed');
    }

    /**
     * The other workspaces the project can move to, by name. Gaia refuses one the user can't update.
     *
     * @method moveTargets
     * @param {Workspace} workspace the workspace the project leaves
     * @return {Promise<Workspace[]>}
     */
    async moveTargets(workspace) {
        let workspaces = await this.store.query('workspace', { sort: 'Workspace.name', order: 'asc', limit: 100 });
        return workspaces.slice().filter((other) => String(other.id) !== String(workspace.id));
    }

    /**
     * Moves the project out of its workspace, into the target or, when there is none, into a new workspace that
     * takes the project's name and code. A new workspace is dropped again when Gaia refuses the move.
     *
     * @method moveOut
     * @param {Project} project
     * @param {Workspace|null} target null for a new workspace
     * @return {Promise<String[]>} Gaia's refusal messages, empty when the project moved
     */
    async moveOut(project, target) {
        let created = null;
        if (!target) {
            created = this.store.createRecord('workspace', { name: project.name, shortCode: project.shortCode });
            try {
                await created.save();
            } catch (error) {
                created.unloadRecord();
                return this.messagesOf(error, 'views.app.workspace.moveOut.failed');
            }
            target = created;
        }
        let errors = await this.patchWorkspace(project, target.id, 'views.app.workspace.moveOut.failed');
        if (errors.length && created) {
            try {
                await created.destroyRecord();
            } catch {
                created.unloadRecord();
            }
        }
        return errors;
    }

    /**
     * Saves the project with the workspace.
     *
     * @method patchWorkspace
     * @param {Project} project
     * @param {String} workspaceId
     * @param {String} failedKey translation key of the message when Gaia gives none
     * @return {Promise<String[]>} Gaia's refusal messages, empty when saved
     */
    async patchWorkspace(project, workspaceId, failedKey) {
        project.workspaceId = workspaceId;
        try {
            await project.save();
        } catch (error) {
            project.rollbackAttributes();
            return this.messagesOf(error, failedKey);
        }
        return [];
    }

    /**
     * Gaia's messages of a failed save.
     *
     * @method messagesOf
     * @param {Error} error
     * @param {String} failedKey translation key of the message when Gaia gives none
     * @return {String[]}
     */
    messagesOf(error, failedKey) {
        let messages = (Array.isArray(error?.errors) ? error.errors : []).map((entry) => entry?.detail).filter(Boolean);
        return messages.length ? messages : [this.intl.t(failedKey)];
    }
}
