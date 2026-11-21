import { tracked } from '@glimmer/tracking';
import PrometheusListController from 'prometheus/controllers/prometheus/list';

/**
 * The controller of the workspaces list
 *
 * @class Index
 * @namespace Prometheus.Controllers.Workspaces
 * @module App
 * @extends PrometheusListController
 */
export default class AppWorkspacesIndexController extends PrometheusListController {
    @tracked querySchema = null;

    sort = 'Workspace.name';
    order = 'asc';

    get columns() {
        return [
            { key: 'name', label: this.intl.t('views.app.workspace.list.name'), sortable: true, sortKey: 'Workspace.name' },
            { key: 'shortCode', label: this.intl.t('views.app.workspace.list.shortCode'), sortable: true, sortKey: 'Workspace.shortCode' },
            { key: 'projectCount', label: this.intl.t('views.app.workspace.list.projects'), sortable: true, sortKey: 'Workspace.projectCount' },
            { key: 'memberCount', label: this.intl.t('views.app.workspace.list.members'), sortable: true, sortKey: 'Workspace.memberCount' },
            { key: 'createdBy', label: this.intl.t('views.app.workspace.list.createdBy'), sortable: true, sortKey: 'createdBy.name' },
            { key: 'dateCreated', label: this.intl.t('views.app.workspace.list.createdOn'), sortable: true, sortKey: 'Workspace.dateCreated' }
        ];
    }
}
