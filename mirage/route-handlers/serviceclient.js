import getRequestData from '../helpers/parse-request';

export function register(server) {
    server.get('/serviceclient', (schema) => {
        return schema.serviceclients.all().sort((a, b) => a.name.localeCompare(b.name));
    });

    server.get('/serviceclient/:id', (schema, request) => {
        return schema.serviceclients.find(request.params.id);
    });

    // Gaia only accepts a change of the status.
    server.patch('/serviceclient/:id', (schema, request) => {
        let requestData = getRequestData(request);
        let serviceClient = schema.serviceclients.find(request.params.id);
        serviceClient.update({ status: requestData.attributes.status });
        return serviceClient;
    });
}
