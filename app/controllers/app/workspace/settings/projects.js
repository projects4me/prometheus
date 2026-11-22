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

    queryParams = ['page', 'sort', 'order'];

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
