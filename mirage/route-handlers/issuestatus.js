import getRequestData from '../helpers/parse-request';
import { Response } from 'ember-cli-mirage';

export function register(server, ctx) {
    server.get('/issuestatus', (schema, request) => {
        let query = request.queryParams.query || '';

        // Settings asks for the global (system) statuses only, in board order.
        if (query.includes('Issuestatus.system : 1') && request.queryParams.sort === 'Issuestatus.sortOrder') {
            return schema.issuestatuses.where({ system: '1' }).sort((a, b) => a.sortOrder - b.sortOrder);
        }

        return schema.issuestatuses.all().sort((a, b) => a.sortOrder - b.sortOrder);
    });

    server.get('/issuestatus/:id', (schema, request) => {
        let id = request.params.id;
        return schema.issuestatuses.find(id);
    });

    server.post('/issuestatus', (schema, request) => {
        let requestData = getRequestData(request);
        return server.create('issuestatus', requestData.attributes);
    });

    server.patch('/issuestatus/:id', (schema, request) => {
        let requestData = getRequestData(request);
        let issueStatus = schema.issuestatuses.find(request.params.id);
        issueStatus.update(requestData.attributes);
        return issueStatus;
    });

    // Like Gaia, refuse to delete a status that issues still use.
    server.delete('/issuestatus/:id', (schema, request) => {
        let issueStatus = schema.issuestatuses.find(request.params.id);

        if (issueStatus.issueCount > 0) {
            return new Response(422, {}, { errors: [{ detail: 'This status cannot be deleted: issues use it.' }] });
        }

        issueStatus.destroy();
        return issueStatus;
    });
}
