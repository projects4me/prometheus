/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { isDestroying, isDestroyed } from '@ember/destroyable';
import AppController from 'prometheus/controllers/app';

/**
 * The controller of the workspace Overview: exposes the route's model and deletes an empty workspace after confirmation.
 *
 * @class WorkspaceIndexController
 * @namespace Prometheus.Controllers
 * @module App.Workspace
 * @extends AppController
 */
export default class WorkspaceIndexController extends AppController {
    @service router;
    @service intl;
    @service store;
    @service errorManager;

    /**
     * Whether the delete confirmation is open
     *
     * @property confirmingDelete
     * @type Boolean
     */
    @tracked confirmingDelete = false;

    /**
     * The messages of Gaia's refusal to delete the workspace, empty when there is none
     *
     * @property deleteErrors
     * @type String[]
     */
    @tracked deleteErrors = [];

    /**
     * The users of the shown page of members
     *
     * @property members
     * @type User[]
     */
    @tracked members = [];

    /**
     * The offset of the first member on the shown page, for AppUi::Pager
     *
     * @property membersOffset
     * @type Number
     */
    @tracked membersOffset = 0;

    /**
     * Whether Gaia may have a page of members after the shown one
     *
     * @property hasMoreMembers
     * @type Boolean
     */
    @tracked hasMoreMembers = false;

    /**
     * Whether a page of members is loading
     *
     * @property isMembersLoading
     * @type Boolean
     */
    @tracked isMembersLoading = false;

    /**
     * The number of members per page
     *
     * @property membersPageSize
     * @type Number
     */
    membersPageSize = 20;

    /**
     * Whether the members need the pager
     *
     * @property hasMembersPages
     * @type Boolean
     */
    get hasMembersPages() {
        return this.membersOffset > 0 || this.hasMoreMembers;
    }

    /**
     * Whether the workspace has projects, which blocks deleting it
     *
     * @property hasProjects
     * @type Boolean
     */
    get hasProjects() {
        return (this.model.workspace?.projectCount ?? 0) > 0;
    }

    /**
     * Opens the delete confirmation
     *
     * @method openDelete
     */
    @action
    openDelete() {
        if (this.hasProjects) {
            return;
        }
        this.deleteErrors = [];
        this.confirmingDelete = true;
    }

    /**
     * Closes the delete confirmation
     *
     * @method closeDelete
     */
    @action
    closeDelete() {
        this.confirmingDelete = false;
    }

    /**
     * Deletes the workspace and goes to the workspaces list. When Gaia refuses, its messages are shown in the
     * confirmation, which stays open.
     *
     * @method deleteWorkspace
     * @return {Promise<Boolean>} whether it was deleted, which closes the confirmation
     */
    @action
    async deleteWorkspace() {
        let workspace = this.model.workspace;
        try {
            await workspace.destroyRecord();
        } catch (error) {
            workspace.rollbackAttributes();
            if (isDestroying(this) || isDestroyed(this)) {
                return false;
            }
            let messages = (Array.isArray(error?.errors) ? error.errors : []).map((entry) => entry?.detail).filter(Boolean);
            this.deleteErrors = messages.length ? messages : [this.intl.t('views.app.workspace.delete.failed')];
            return false;
        }
        if (isDestroying(this) || isDestroyed(this)) {
            return true;
        }
        this.confirmingDelete = false;
        this.router.transitionTo('app.workspaces');
        return true;
    }

    /**
     * Loads the page of members that starts at the offset. Gaia joins the memberships to the workspace through the
     * project; a user that is a member of several projects is shown once per page.
     *
     * @method loadMembers
     * @param {Number} offset
     * @return {Promise}
     */
    @action
    async loadMembers(offset) {
        let workspace = this.model?.workspace;
        if (!workspace) {
            return;
        }
        this.isMembersLoading = true;
        try {
            let memberships = await this.store.query('membership', {
                query: `((project.workspaceId : ${workspace.id}))`,
                rels: 'user,project',
                sort: 'user.name',
                order: 'ASC',
                limit: this.membersPageSize,
                page: Math.floor(offset / this.membersPageSize) + 1
            });
            let users = await Promise.all(memberships.map((membership) => membership.user));
            if (isDestroying(this) || isDestroyed(this)) {
                return;
            }
            let seen = new Set();
            this.members = users.filter((user) => {
                if (!user || seen.has(user.id)) {
                    return false;
                }
                seen.add(user.id);
                return true;
            });
            this.membersOffset = offset;
            this.hasMoreMembers = memberships.length >= this.membersPageSize;
        } catch (error) {
            this.errorManager.handleLoadError(error, { moduleName: 'workspace' });
        } finally {
            if (!isDestroying(this) && !isDestroyed(this)) {
                this.isMembersLoading = false;
            }
        }
    }
}
