/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import AppWorkspacesCreateController from 'prometheus/controllers/app/workspaces/create';

/**
 * The controller of the Projects tab of the workspace Settings, it saves the workspace details and pages the member
 * projects. The create controller's validations and Gaia error handling are reused.
 *
 * @class WorkspaceSettingsProjectsController
 * @namespace Prometheus.Controllers
 * @module App.Workspace
 * @extends AppWorkspacesCreateController
 */
export default class WorkspaceSettingsProjectsController extends AppWorkspacesCreateController {
    layoutName = 'edit';

    @service intl;

    queryParams = ['page', 'sort', 'order', 'memberPage', 'memberOrder'];

    @tracked page = 1;
    @tracked sort = 'Project.name';
    @tracked order = 'asc';

    /**
     * The shown page of the workspace's projects, set by the route
     *
     * @property projects
     * @type Project[]
     */
    @tracked projects = [];

    /**
     * Whether Gaia has a page of projects after the shown one
     *
     * @property hasNextProjects
     * @type Boolean
     */
    @tracked hasNextProjects = false;

    pageSize = 10;

    @tracked memberPage = 1;
    @tracked memberOrder = 'asc';

    /**
     * The shown page of the workspace's members, set by the route
     *
     * @property members
     * @type Workspacemember[]
     */
    @tracked members = [];

    /**
     * Whether Gaia has a page of members after the shown one
     *
     * @property hasNextMembers
     * @type Boolean
     */
    @tracked hasNextMembers = false;

    memberPageSize = 20;

    /**
     * The columns of the Members table
     *
     * @property memberColumns
     * @type Array
     */
    get memberColumns() {
        let t = (key) => this.intl.t(`views.app.workspace.settings.members.${key}`);
        return [
            { key: 'member', label: t('member'), sortable: true, sortKey: 'User.name' },
            { key: 'type', label: t('type') },
            { key: 'projects', label: t('projects') },
            { key: 'openIssues', label: t('openIssues') },
            { key: 'actions', label: '' }
        ];
    }

    /**
     * The offset of the first member on the shown page, for AppUi::Pager
     *
     * @property memberOffset
     * @type Number
     */
    get memberOffset() {
        return (Math.max(1, Number(this.memberPage) || 1) - 1) * this.memberPageSize;
    }

    /**
     * Toggles the order of the members, sorted by name, and shows the first page.
     *
     * @method sortMembers
     */
    @action
    sortMembers() {
        this.memberOrder = this.memberOrder === 'asc' ? 'desc' : 'asc';
        this.memberPage = 1;
    }

    /**
     * Shows the page of members that starts at the offset AppUi::Pager asks for.
     *
     * @method changeMemberOffset
     * @param {Number} offset
     */
    @action
    changeMemberOffset(offset) {
        this.memberPage = Math.floor(offset / this.memberPageSize) + 1;
    }

    /**
     * Whether the Invite member dialog is open
     *
     * @property invitingMember
     * @type Boolean
     */
    @tracked invitingMember = false;

    /**
     * Opens the Invite member dialog
     *
     * @method openInvite
     */
    @action
    openInvite() {
        this.invitingMember = true;
    }

    /**
     * Closes the Invite member dialog
     *
     * @method closeInvite
     */
    @action
    closeInvite() {
        this.invitingMember = false;
    }

    /**
     * Reloads the page after people were invited, so the Members table shows them.
     *
     * @method memberInvited
     */
    @action
    memberInvited() {
        this.router.refresh();
    }

    /**
     * Whether the Add project dialog is open
     *
     * @property addingProject
     * @type Boolean
     */
    @tracked addingProject = false;

    /**
     * Opens the Add project dialog
     *
     * @method openAddProject
     */
    @action
    openAddProject() {
        this.addingProject = true;
    }

    /**
     * Closes the Add project dialog
     *
     * @method closeAddProject
     */
    @action
    closeAddProject() {
        this.addingProject = false;
    }

    /**
     * The project whose Move out dialog is open
     *
     * @property movingProject
     * @type Project
     */
    @tracked movingProject = null;

    /**
     * Opens the Move project out dialog
     *
     * @method openMoveOut
     * @param {Project} project
     */
    @action
    openMoveOut(project) {
        this.movingProject = project;
    }

    /**
     * Closes the Move project out dialog
     *
     * @method closeMoveOut
     */
    @action
    closeMoveOut() {
        this.movingProject = null;
    }

    /**
     * Reloads the page after a project moved out.
     *
     * @method projectMoved
     */
    @action
    projectMoved() {
        this.router.refresh();
    }

    /**
     * Reloads the page after a project joined, so both tables show it.
     *
     * @method projectAdded
     */
    @action
    projectAdded() {
        this.router.refresh();
    }

    /**
     * The columns of the Member Projects table
     *
     * @property columns
     * @type Array
     */
    get columns() {
        let t = (key) => this.intl.t(`views.app.workspace.settings.projects.${key}`);
        return [
            { key: 'name', label: t('project') },
            { key: 'workspaceJoinedAt', label: t('joined'), sortable: true, sortKey: 'Project.workspaceJoinedAt' },
            { key: 'openIssueCount', label: t('openIssues') },
            { key: 'runsInProgress', label: t('workInFlight') },
            { key: 'actions', label: '' }
        ];
    }

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
     * Sorts the projects on the field, toggling the order when it is already the sort, and shows the first page.
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
     * Goes back to the Overview of the workspace, dropping the unsaved changes
     *
     * @method afterCancel
     * @param {Workspace} model
     * @protected
     */
    afterCancel(model) {
        let shortCode = model.shortCode;
        model.rollbackAttributes();
        this.router.transitionTo('app.workspace', shortCode);
    }
}
