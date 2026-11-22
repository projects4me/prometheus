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
     * The name of the runtime the workspace is bound to, empty when it has none
     *
     * @property runtimeName
     * @type String
     */
    get runtimeName() {
        return this.model?.workspace?.runtime?.get('name') || '';
    }

    /**
     * The repositories that belong to the workspace rather than to a project
     *
     * @property workspaceRepositoryCount
     * @type Number
     */
    get workspaceRepositoryCount() {
        let workspace = this.model?.workspace;
        return Math.max(0, (workspace?.repositoryCount || 0) - (workspace?.projectRepositoryCount || 0));
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

    /**
     * The activities of the workspace loaded so far, grouped by the date they were created on
     *
     * @property activityGroups
     * @type Object
     */
    @tracked activityGroups = {};

    /**
     * Whether Gaia may have more activities than the loaded pages
     *
     * @property hasMoreActivities
     * @type Boolean
     */
    @tracked hasMoreActivities = false;

    /**
     * Whether a page of activities is loading
     *
     * @property isActivitiesLoading
     * @type Boolean
     */
    @tracked isActivitiesLoading = false;

    /**
     * The number of activities per page
     *
     * @property activitiesPageSize
     * @type Number
     */
    activitiesPageSize = 10;

    /**
     * The activities loaded so far, newest first
     *
     * @property activities
     * @type Activity[]
     * @private
     */
    activities = [];

    /**
     * The last page of activities loaded
     *
     * @property activitiesPage
     * @type Number
     * @private
     */
    activitiesPage = 0;

    /**
     * Whether the workspace has any activity to show
     *
     * @property hasActivities
     * @type Boolean
     */
    get hasActivities() {
        return Object.keys(this.activityGroups).length > 0;
    }

    /**
     * Groups the activities by the date they were created on, like the project Overview does.
     *
     * @method groupActivities
     * @param {Activity[]} activities
     * @return {Object}
     * @protected
     */
    groupActivities(activities) {
        let groups = {};
        activities.forEach((activity) => {
            let dateCreated = activity.get('dateCreated').substring(0, 10);
            groups[dateCreated] = groups[dateCreated] || { dateCreated, data: [] };
            groups[dateCreated].data.push(activity);
        });
        return groups;
    }

    /**
     * Loads the first page of the workspace's activities, dropping what an earlier workspace left.
     *
     * @method resetActivities
     * @return {Promise}
     */
    @action
    resetActivities() {
        this.activities = [];
        this.activitiesPage = 0;
        this.activityGroups = {};
        this.hasMoreActivities = false;
        this.isActivitiesLoading = false;
        return this.loadMoreActivities();
    }

    /**
     * Loads the next page of activities (newest first) and adds it to the timeline.
     *
     * @method loadMoreActivities
     * @return {Promise}
     */
    @action
    async loadMoreActivities() {
        let workspace = this.model?.workspace;
        if (!workspace || this.isActivitiesLoading) {
            return;
        }
        this.isActivitiesLoading = true;
        try {
            let rows = await this.store.query('activity', {
                query: `((Activity.relatedTo : workspace) AND (Activity.relatedId : ${workspace.id}))`,
                sort: 'Activity.dateCreated',
                order: 'DESC',
                limit: this.activitiesPageSize,
                page: this.activitiesPage + 1
            });
            if (isDestroying(this) || isDestroyed(this) || this.model?.workspace !== workspace) {
                // the controller moved to another workspace while this page was loading
                return;
            }
            this.activitiesPage += 1;
            this.activities = [...this.activities, ...rows.slice()];
            this.activityGroups = this.groupActivities(this.activities);
            this.hasMoreActivities = rows.length >= this.activitiesPageSize;
        } catch (error) {
            this.errorManager.handleLoadError(error, { moduleName: 'workspace' });
        } finally {
            if (!isDestroying(this) && !isDestroyed(this) && this.model?.workspace === workspace) {
                this.isActivitiesLoading = false;
            }
        }
    }
}
