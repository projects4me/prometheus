import { service } from '@ember/service';
import AppRoute from 'prometheus/routes/app';

/**
 * The route of the workspaces list
 *
 * @class Index
 * @namespace Prometheus.Routes.Workspaces
 * @module App
 * @extends AppRoute
 */
export default class AppWorkspacesIndexRoute extends AppRoute {
    @service('query-schema') querySchemaService;

    queryParams = {
        query: { refreshModel: true },
        page: { refreshModel: true },
        sort: { refreshModel: true },
        order: { refreshModel: true }
    };

    model(params) {
        let options = {
            query: params.query || null,
            sort: params.sort || 'Workspace.name',
            order: params.order || 'asc',
            page: params.page || 1,
            limit: 20
        };

        return this.store.query('workspace', options).catch((error) => {
            this.errorManager.handleError(error, { moduleName: 'workspace' });
        });
    }

    async afterModel() {
        this.schema = null;

        try {
            let schema = await this.querySchemaService.load('Workspace');
            this.schema = Array.isArray(schema) ? null : schema;
        } catch (error) {
            this.errorManager.handleError(error, { moduleName: 'workspace' });
        }
    }

    setupController(controller, model) {
        controller.set('model', model);
        controller.set('savedsearches', []);
        controller.set('querySchema', this.schema);
    }
}
