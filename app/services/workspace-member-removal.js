/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Service, { service } from '@ember/service';

/**
 * Loads and changes what the Remove member dialog of a workspace needs: the projects the member leaves, their open
 * issues, the people who can take the issues over, and the removal itself. Gaia owns the rules (the 409 without
 * `handoverTo`, the target check); an issue always has an assignee, so there is no "unassigned" choice.
 *
 * @class WorkspaceMemberRemovalService
 * @namespace Prometheus.Services
 * @extends Service
 */
export default class WorkspaceMemberRemovalService extends Service {
    @service store;
    @service intl;

    pageSize = 100;

    /**
     * The projects of the workspace, by name.
     *
     * @method projects
     * @param {Workspace} workspace
     * @return {Promise<Project[]>}
     */
    async projects(workspace) {
        let projects = await this.store.query('project', {
            query: `((Project.workspaceId : ${workspace.id}))`,
            sort: 'Project.name',
            order: 'asc',
            limit: 100
        });
        return projects.slice();
    }

    /**
     * The people and agents who can take the issues over: the other members of the workspace, by name.
     *
     * @method assignees
     * @param {Workspace} workspace
     * @param {User} user the member who is removed
     * @return {Promise<User[]>}
     */
    async assignees(workspace, user) {
        let members = await this.store.query('workspacemember', {
            query: `((Workspacemember.workspaceId : ${workspace.id}))`,
            rels: 'user',
            limit: 100
        });
        let users = [];
        for (let member of members.slice()) {
            let other = await member.user;
            if (other && String(other.id) !== String(user.id)) {
                users.push(other);
            }
        }
        return users.sort((a, b) => String(a.name).localeCompare(String(b.name)));
    }

    /**
     * The open issues (status not done) assigned to the user in the projects, paged per project.
     *
     * @method openIssues
     * @param {User} user
     * @param {Project[]} projects
     * @return {Promise<Issue[]>}
     */
    async openIssues(user, projects) {
        let open = [];
        for (let project of projects) {
            for (let page = 1; ; page++) {
                let issues = await this.store.query('issue', {
                    query: `((Issue.assignee : ${user.id}) AND (Issue.projectId : ${project.id}))`,
                    rels: 'issuestatus',
                    sort: 'Issue.issueNumber',
                    order: 'asc',
                    page,
                    limit: this.pageSize
                });
                let list = issues.slice();
                for (let issue of list) {
                    let status = await issue.issuestatus;
                    if (!['1', 'true'].includes(String(status?.done))) {
                        open.push(issue);
                    }
                }
                if (list.length < this.pageSize) {
                    break;
                }
            }
        }
        return open;
    }

    /**
     * Reassigns the issues whose choice differs from the "Set all" user, then deletes one membership of the user,
     * Gaia removes them from the other projects and hands the rest over to `handoverTo`.
     *
     * @method remove
     * @param {Workspace} workspace
     * @param {User} user the member who is removed
     * @param {Object[]} choices `{ issue, userId }` per open issue
     * @param {String|null} handoverTo the "Set all" user id, null when there are no open issues
     * @return {Promise<String[]>} Gaia's refusal messages, empty when the member was removed
     */
    async remove(workspace, user, choices, handoverTo) {
        try {
            for (let { issue, userId } of choices) {
                if (String(userId) !== String(handoverTo)) {
                    issue.assignee = String(userId);
                    await issue.save();
                }
            }
            let membership = await this.membershipOf(workspace, user);
            if (!membership) {
                return [this.intl.t('views.app.workspace.remove.noMembership')];
            }
            let queryParams = handoverTo ? { handoverTo } : {};
            await membership.destroyRecord({ adapterOptions: { queryParams } });
            return [];
        } catch (error) {
            let messages = (Array.isArray(error?.errors) ? error.errors : []).map((entry) => entry?.detail).filter(Boolean);
            return messages.length ? messages : [this.intl.t('views.app.workspace.remove.failed', { user: user.name })];
        }
    }

    /**
     * One membership of the user in the workspace: the one in its first project that has it.
     *
     * @method membershipOf
     * @param {Workspace} workspace
     * @param {User} user
     * @return {Promise<Membership|null>}
     */
    async membershipOf(workspace, user) {
        let projects = await this.projects(workspace);
        for (let project of projects) {
            let memberships = await this.store.query('membership', {
                query: `((Membership.projectId : ${project.id}) AND (Membership.userId : ${user.id}))`,
                limit: 1
            });
            let found = memberships.slice()[0];
            if (found) {
                return found;
            }
        }
        return null;
    }
}
