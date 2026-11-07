import getRequestData from '../helpers/parse-request';

export function register(server, ctx) {
    server.get('/savedsearch', (schema) => {
        return schema.savedsearches.all();
    });

    server.patch('/savedsearch/:id', (schema, request) => {
        let { attributes } = getRequestData(request);
        let savedsearch = schema.savedsearches.find(request.params.id);

        savedsearch.update(attributes);

        return savedsearch;
    });
}
