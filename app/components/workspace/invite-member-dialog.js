/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { isDestroying, isDestroyed } from '@ember/destroyable';

/**
 * The Invite member dialog of a workspace: choose people, read that they join all the projects, confirm.
 * The caller passes `@workspace`, `@onClose` and `@onInvited` (called after the invitations, to refresh its tables).
 *
 * @class WorkspaceInviteMemberDialogComponent
 * @namespace Prometheus.Components
 * @extends Component
 */
export default class WorkspaceInviteMemberDialogComponent extends Component {
    @service workspaceMembers;
    @service intl;

    /**
     * The people who can be invited, as `{ label, value, user }`
     *
     * @property options
     * @type Object[]
     */
    @tracked options = [];

    /**
     * The chosen options
     *
     * @property selected
     * @type Object[]
     */
    @tracked selected = [];

    /**
     * Gaia's refusal or load errors
     *
     * @property errors
     * @type String[]
     */
    @tracked errors = [];

    constructor() {
        super(...arguments);
        this.loadOptions();
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
     * Loads the people who can be invited.
     *
     * @method loadOptions
     */
    async loadOptions() {
        try {
            let users = await this.workspaceMembers.candidates(this.args.workspace);
            if (!this.gone) {
                this.options = users.map((user) => ({ label: user.name, value: user.id, user }));
            }
        } catch {
            if (!this.gone) {
                this.errors = [this.intl.t('views.app.workspace.invite.loadFailed')];
            }
        }
    }

    /**
     * Chooses the people to invite.
     *
     * @method selectUsers
     * @param {Object[]} options
     */
    @action
    selectUsers(options) {
        this.selected = options || [];
        this.errors = [];
    }

    /**
     * Invites the chosen people and asks the caller to refresh.
     *
     * @method invite
     * @return {Promise<Boolean>} whether everyone was invited, which closes the dialog
     */
    @action
    async invite() {
        let errors = await this.workspaceMembers.invite(this.args.workspace, this.selected.map((option) => option.user));
        if (!this.gone) {
            await this.args.onInvited?.();
        }
        if (errors.length === 0) {
            return true;
        }
        if (!this.gone) {
            this.errors = errors;
            this.selected = [];
            this.loadOptions();
        }
        return false;
    }
}
