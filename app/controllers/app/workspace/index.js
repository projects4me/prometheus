/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { isDestroying, isDestroyed } from '@ember/destroyable';
import AppController from 'prometheus/controllers/app';

/**
 * The controller of the workspace Overview: exposes the route's model.
 *
 * @class WorkspaceIndexController
 * @namespace Prometheus.Controllers
 * @module App.Workspace
 * @extends AppController
 */
export default class WorkspaceIndexController extends AppController {
    @service store;
    @service errorManager;

    queryParams = ['page'];

    /**
     * The page of the Projects box
     *
     * @property page
     * @type Number
     */
    @tracked page = 1;

    /**
     * The number of projects on a page, the same as the route's
     *
     * @property pageSize
     * @type Number
     */
    pageSize = 10;

    /**
     * The offset of the first project on the shown page, for AppUi::Pager
     *
     * @property offset
     * @type Number
     */
    get offset() {
        return (Math.max(1, Number(this.page) || 1) - 1) * this.pageSize;
    }

    /**
     * Shows the page that starts at the offset AppUi::Pager asks for.
     *
     * @method changeOffset
     * @param {Number} offset
     */
    @action
    changeOffset(offset) {
        this.page = Math.floor(offset / this.pageSize) + 1;
    }

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
