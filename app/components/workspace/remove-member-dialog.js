/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { isDestroying, isDestroyed } from '@ember/destroyable';

/**
 * The Remove member dialog of a workspace: shows the projects the member leaves and their open issues, and asks who
 * takes the issues over. The caller passes `@workspace`, `@member` (a Workspacemember), `@onClose` and `@onRemoved`.
 *
 * @class WorkspaceRemoveMemberDialogComponent
 * @namespace Prometheus.Components
 * @extends Component
 */
export default class WorkspaceRemoveMemberDialogComponent extends Component {
    @service workspaceMemberRemoval;
    @service intl;

    /**
     * The projects the member leaves
     *
     * @property projects
     * @type Project[]
     */
    @tracked projects = [];

    /**
     * The people and agents who can take the issues over, as `{ label, value }`
     *
     * @property options
     * @type Object[]
     */
    @tracked options = [];

    /**
     * The open issues of the member, as `{ issue, project, selected }`
     *
     * @property rows
     * @type Object[]
     */
    @tracked rows = [];

    /**
     * The "Set all to" choice
     *
     * @property setAll
     * @type Object
     */
    @tracked setAll = null;

    /**
     * The "Set all to" choice that was applied, which Gaia receives as `handoverTo`
     *
     * @property applied
     * @type Object
     */
    @tracked applied = null;

    /**
     * Gaia's refusal or load errors
     *
     * @property errors
     * @type String[]
     */
    @tracked errors = [];

    /**
     * Whether the data is loaded
     *
     * @property loaded
     * @type Boolean
     */
    @tracked loaded = false;

    /**
     * The member who is removed, loaded from the member row
     *
     * @property user
     * @type User
     */
    @tracked user = null;

    constructor() {
        super(...arguments);
        this.load();
    }

    /**
     * Whether the component is torn down
     *
     * @property gone
     * @type Boolean
     */
    get gone() {
        return isDestroying(this) || isDestroyed(this);
    }

    /**
     * Whether Confirm is blocked: the member has open issues and nobody takes them over yet
     *
     * @property blocked
     * @type Boolean
     */
    get blocked() {
        return !this.loaded || (this.rows.length > 0 && !this.applied);
    }

    /**
     * Loads the projects, the open issues and the people who can take them over.
     *
     * @method load
     */
    async load() {
        try {
            let user = await this.args.member.user;
            let service = this.workspaceMemberRemoval;
            let projects = await service.projects(this.args.workspace);
            let [assignees, issues] = await Promise.all([
                service.assignees(this.args.workspace, user),
                service.openIssues(user, projects)
            ]);
            if (this.gone) {
                return;
            }
            this.user = user;
            this.projects = projects;
            this.options = assignees.map((assignee) => ({ label: assignee.name, value: assignee.id }));
            this.rows = issues.map((issue) => ({
                issue,
                project: projects.find((project) => String(project.id) === String(issue.projectId)),
                selected: null
            }));
            this.loaded = true;
        } catch {
            if (!this.gone) {
                this.errors = [this.intl.t('views.app.workspace.remove.loadFailed')];
            }
        }
    }

    /**
     * Chooses the "Set all to" person.
     *
     * @method selectSetAll
     * @param {Object} option `{ label, value }`
     */
    @action
    selectSetAll(option) {
        this.setAll = option || null;
    }

    /**
     * Gives every issue the "Set all to" person.
     *
     * @method apply
     */
    @action
    apply() {
        if (!this.setAll) {
            return;
        }
        this.applied = this.setAll;
        this.rows = this.rows.map((row) => ({ ...row, selected: this.setAll }));
        this.errors = [];
    }

    /**
     * Chooses the assignee of one issue.
     *
     * @method selectRow
     * @param {Object} row
     * @param {Object} option `{ label, value }`
     */
    @action
    selectRow(row, option) {
        this.rows = this.rows.map((item) => (item === row ? { ...item, selected: option || this.applied } : item));
        this.errors = [];
    }

    /**
     * Reassigns the issues, removes the member and asks the caller to refresh.
     *
     * @method remove
     * @return {Promise<Boolean>} whether the member was removed, which closes the dialog
     */
    @action
    async remove() {
        let choices = this.rows.map((row) => ({ issue: row.issue, userId: (row.selected || this.applied).value }));
        let errors = await this.workspaceMemberRemoval.remove(
            this.args.workspace,
            this.user,
            choices,
            this.applied?.value || null
        );
        if (errors.length === 0) {
            if (!this.gone) {
                await this.args.onRemoved?.();
            }
            return true;
        }
        if (!this.gone) {
            this.errors = errors;
        }
        return false;
    }
}
