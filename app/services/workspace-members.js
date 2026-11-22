/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Service, { service } from '@ember/service';

/**
 * Loads and changes what the Invite member dialog of a workspace needs: the people who can be invited and the
 * memberships. Gaia's member sync (agaia-4780) copies a membership created in one project to all the others.
 *
 * @class WorkspaceMembersService
 * @namespace Prometheus.Services
 * @extends Service
 */
export default class WorkspaceMembersService extends Service {
    @service store;
    @service intl;

    /**
     * The users who are not yet members of the workspace, by name.
     *
     * @method candidates
     * @param {Workspace} workspace
     * @return {Promise<User[]>}
     */
    async candidates(workspace) {
        let [users, members] = await Promise.all([
            this.store.query('user', { sort: 'User.name', order: 'asc', page: 1, limit: 100 }),
            this.store.query('workspacemember', { query: `((Workspacemember.workspaceId : ${workspace.id}))`, limit: 100 })
        ]);
        let memberIds = members.slice().map((member) => String(member.userId));
        return users.slice().filter((user) => !memberIds.includes(String(user.id)));
    }

    /**
     * The first project of the workspace by name, where the memberships are created.
     *
     * @method firstProject
     * @param {Workspace} workspace
     * @return {Promise<Project|null>}
     */
    async firstProject(workspace) {
        let projects = await this.store.query('project', {
            query: `((Project.workspaceId : ${workspace.id}))`,
            sort: 'Project.name',
            order: 'asc',
            limit: 1
        });
        return projects.slice()[0] || null;
    }

    /**
     * Creates one membership per user in the first project of the workspace, Gaia adds them to the other projects.
     *
     * @method invite
     * @param {Workspace} workspace
     * @param {User[]} users
     * @return {Promise<String[]>} Gaia's refusal messages, empty when everyone was invited
     */
    async invite(workspace, users) {
        let project = await this.firstProject(workspace);
        if (!project) {
            return [this.intl.t('views.app.workspace.invite.noProject')];
        }
        let errors = [];
        for (let user of users) {
            let membership = this.store.createRecord('membership', { userId: user.id, projectId: project.id, user, project });
            try {
                await membership.save();
            } catch (error) {
                membership.unloadRecord();
                let messages = (Array.isArray(error?.errors) ? error.errors : []).map((entry) => entry?.detail).filter(Boolean);
                errors.push(...(messages.length ? messages : [this.intl.t('views.app.workspace.invite.failed', { user: user.name })]));
            }
        }
        return errors;
    }
}
