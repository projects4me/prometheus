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

    queryParams = ['page', 'sort', 'order'];

    /**
     * The page of the Projects box
     *
     * @property page
     * @type Number
     */
    @tracked page = 1;

    /**
     * The sort field of the Projects box
     *
     * @property sort
     * @type String
     */
    @tracked sort = 'Project.name';

    /**
     * The sort order of the Projects box
     *
     * @property order
     * @type String
     */
    @tracked order = 'asc';

    @service intl;

    /**
     * The columns of the Projects table
     *
     * @property columns
     * @type Array
     */
    get columns() {
        return [
            { key: 'name', label: this.intl.t('views.app.workspace.detail.projectColumn') },
            { key: 'openIssueCount', label: this.intl.t('views.app.workspace.detail.openIssues'), sortable: true, sortKey: 'Project.openIssueCount' },
            { key: 'activeMilestoneName', label: this.intl.t('views.app.workspace.detail.activeMilestone') },
            { key: 'repository', label: this.intl.t('views.app.workspace.detail.repository') },
            { key: 'manager', label: this.intl.t('views.app.workspace.detail.projectManager') }
        ];
    }

    /**
     * Sorts the projects on the field (toggling the order when it is already the sort) and shows the first page.
     *
     * @method sortData
     * @param {String} field
     */
    @action
    sortData(field) {
        this.order = field === this.sort && this.order === 'asc' ? 'desc' : 'asc';
        this.sort = field;
        this.page = 1;
    }

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
     * Loads the page of members that starts at the offset. Gaia's workspacemember has one row per person, so nobody repeats.
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
            let rows = await this.store.query('workspacemember', {
                query: `((Workspacemember.workspaceId : ${workspace.id}))`,
                rels: 'user',
                limit: this.membersPageSize,
                page: Math.floor(offset / this.membersPageSize) + 1
            });
            let users = await Promise.all(rows.map((row) => row.user));
            if (isDestroying(this) || isDestroyed(this)) {
                return;
            }
            this.members = users.filter(Boolean);
            this.membersOffset = offset;
            this.hasMoreMembers = rows.length >= this.membersPageSize;
        } catch (error) {
            this.errorManager.handleLoadError(error, { moduleName: 'workspace' });
        } finally {
            if (!isDestroying(this) && !isDestroyed(this)) {
                this.isMembersLoading = false;
            }
        }
    }
}
